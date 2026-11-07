import { useCallback, useEffect, useState } from "react";
import { Ban, ChevronLeft, ChevronRight, RefreshCw, Search, ShieldCheck, Trash2, UserCheck } from "lucide-react";
import toast from "react-hot-toast";
import api, { getErrorMessage } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import Avatar from "../../components/Avatar";
import ConfirmDialog from "../../components/ConfirmDialog";
import { BADGES, BADGE_LABELS, money } from "../../lib/format";
import { PageTitle } from "./DashboardLayout";

export default function AdminUsers() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [search, setSearch] = useState("");
  const [error, setError] = useState(null);
  const [removing, setRemoving] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    api
      .get("/admin/users", { params: { page, q: search || undefined, limit: 10 } })
      .then((res) => {
        setData(res.data.data);
        setError(null);
      })
      .catch((err) => setError(getErrorMessage(err, "Could not load members.")));
  }, [page, search]);

  useEffect(load, [load]);

  // Search as the admin types, without a request per keystroke
  useEffect(() => {
    const id = setTimeout(() => {
      setPage(1);
      setSearch(q.trim());
    }, 300);
    return () => clearTimeout(id);
  }, [q]);

  const update = async (target, patch, message) => {
    try {
      await api.patch(`/admin/users/${target.id}`, patch);
      toast.success(message);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const remove = async () => {
    setBusy(true);
    try {
      await api.delete(`/admin/users/${removing.id}`);
      toast.success("Member deleted");
      setRemoving(null);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
      setRemoving(null);
    }
    setBusy(false);
  };

  return (
    <>
      <PageTitle title="Hotel" accent="members">
        <div className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name or email" aria-label="Search members" className="input !rounded-full !py-2.5 pl-10" />
        </div>
      </PageTitle>
      {user.isDemo && (
        <p role="note" className="mb-5 rounded-2xl border border-brand/25 bg-brand-soft p-3.5 text-sm">
          <b>Test admin.</b> You only see and manage the test accounts, never real members.
        </p>
      )}

      {error ? (
        <p role="alert" className="card flex items-center justify-between gap-4 p-6 text-danger">
          {error}
          <button type="button" onClick={load} className="btn btn-ghost btn-sm">
            <RefreshCw className="h-3.5 w-3.5" /> Retry
          </button>
        </p>
      ) : !data ? (
        <div className="space-y-3" role="status" aria-label="Loading members">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton h-[72px]" />
          ))}
        </div>
      ) : data.users.length === 0 ? (
        <p className="card p-8 text-center text-muted">No members match your search.</p>
      ) : (
        <ul className="space-y-3">
          {data.users.map((m) => {
            const self = m.id === user.id;
            return (
              <li key={m.id} className="card flex flex-wrap items-center gap-4 p-4">
                <Avatar name={m.fullName} url={m.profileImageUrl} size={44} />
                <div className="min-w-0 flex-1 basis-48">
                  <p className="flex flex-wrap items-center gap-2 font-semibold">
                    <span className="truncate">{m.fullName}</span>
                    {m.role === "ADMIN" && (
                      <span className="chip bg-brand-soft text-brand">
                        <ShieldCheck className="h-3 w-3" /> Admin
                      </span>
                    )}
                    <span className="chip bg-line/60 text-muted">{BADGE_LABELS[m.badge]}</span>
                    {m.isBlocked && (
                      <span className="chip bg-[var(--danger-soft)] text-danger">
                        <Ban className="h-3 w-3" /> Blocked
                      </span>
                    )}
                    {m.isDemo && <span className="chip bg-line/60 text-muted">Test</span>}
                    {self && <span className="chip bg-[var(--done-soft)] text-done">You</span>}
                  </p>
                  <p className="truncate font-mono text-xs text-muted">{m.email}</p>
                </div>
                <p className="text-sm text-muted">
                  Spent <b className="tabular-nums text-ink">{money(m.spent)}</b>
                </p>
                {m.locked && <p className="text-xs font-semibold text-muted">Shared login, locked</p>}
                {!self && !m.locked && (
                  <div className="flex flex-wrap items-center gap-2">
                    <label className="sr-only" htmlFor={`tier-${m.id}`}>
                      Membership tier for {m.fullName}
                    </label>
                    <select id={`tier-${m.id}`} value={m.badge} onChange={(e) => update(m, { badge: e.target.value }, "Tier updated")} className="input !w-auto !rounded-full !py-2 pr-8 text-sm font-semibold">
                      {BADGES.map((b) => (
                        <option key={b} value={b}>
                          {BADGE_LABELS[b]}
                        </option>
                      ))}
                    </select>
                    {m.isBlocked ? (
                      <button type="button" onClick={() => update(m, { isBlocked: false }, "Member unblocked")} className="btn btn-ghost btn-sm">
                        <UserCheck className="h-3.5 w-3.5" /> Unblock
                      </button>
                    ) : (
                      <button type="button" onClick={() => update(m, { isBlocked: true }, "Member blocked")} className="btn btn-ghost btn-sm">
                        <Ban className="h-3.5 w-3.5" /> Block
                      </button>
                    )}
                    <button type="button" onClick={() => update(m, { role: m.role === "ADMIN" ? "USER" : "ADMIN" }, m.role === "ADMIN" ? "Admin role removed" : "Made an admin")} className="btn btn-ghost btn-sm">
                      <ShieldCheck className="h-3.5 w-3.5" /> {m.role === "ADMIN" ? "Make member" : "Make admin"}
                    </button>
                    <button type="button" onClick={() => setRemoving(m)} aria-label={`Delete ${m.fullName}`} className="grid h-9 w-9 place-items-center rounded-full text-muted hover:bg-[var(--danger-soft)] hover:text-danger">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {data && data.pages > 1 && (
        <nav aria-label="Pagination" className="mt-6 flex items-center justify-center gap-3">
          <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="btn btn-ghost btn-sm">
            <ChevronLeft className="h-4 w-4" /> Previous
          </button>
          <span className="text-sm text-muted tabular-nums">
            Page {data.page} of {data.pages}
          </span>
          <button type="button" disabled={page >= data.pages} onClick={() => setPage((p) => p + 1)} className="btn btn-ghost btn-sm">
            Next <ChevronRight className="h-4 w-4" />
          </button>
        </nav>
      )}

      {removing && <ConfirmDialog title="Delete this member?" message={`${removing.fullName}'s account, cart, requests, likes and reviews will be deleted. Order records are kept. This cannot be undone.`} busy={busy} onConfirm={remove} onCancel={() => setRemoving(null)} />}
    </>
  );
}
