import { useCallback, useEffect, useState } from "react";
import { Check, Loader2, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";
import api, { getErrorMessage } from "../../lib/api";
import Avatar from "../../components/Avatar";
import { MealImage } from "../../components/MealCard";
import { formatDate } from "../../lib/format";
import { REQUEST_STATUS } from "./MyRequests";
import { PageTitle } from "./DashboardLayout";

export default function AdminRequests() {
  const [status, setStatus] = useState("PENDING");
  const [rows, setRows] = useState(null);
  const [error, setError] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const res = await api.get("/admin/requests", { params: { status } });
      setRows(res.data.data);
    } catch (err) {
      setError(getErrorMessage(err, "Could not load the requests."));
    }
  }, [status]);

  useEffect(() => {
    setRows(null);
    load();
  }, [load]);

  const serve = async (id) => {
    setBusyId(id);
    try {
      await api.post(`/admin/requests/${id}/serve`);
      toast.success("Marked as served");
      await load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
    setBusyId(null);
  };

  return (
    <>
      <PageTitle title="Meal" accent="requests" />
      <div role="tablist" aria-label="Request status" className="mb-6 inline-flex rounded-full border border-line bg-surface p-1">
        {[
          ["PENDING", "Waiting"],
          ["SERVED", "Served"],
          ["CANCELLED", "Cancelled"],
        ].map(([id, label]) => (
          <button key={id} role="tab" aria-selected={status === id} type="button" onClick={() => setStatus(id)} className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${status === id ? "bg-brand text-on-brand" : "text-muted hover:text-ink"}`}>
            {label}
          </button>
        ))}
      </div>

      {error ? (
        <div role="alert" className="card grid place-items-center gap-4 p-10 text-center">
          <p className="text-muted">{error}</p>
          <button type="button" onClick={load} className="btn btn-primary btn-sm">
            <RefreshCw className="h-3.5 w-3.5" /> Try again
          </button>
        </div>
      ) : !rows ? (
        <div className="space-y-3" role="status" aria-label="Loading requests">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton h-24" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <p className="card p-12 text-center text-muted">{status === "PENDING" ? "The kitchen is all caught up." : "Nothing here."}</p>
      ) : (
        <ul className="space-y-3">
          {rows.map((r) => (
            <li key={r.id} className="card flex flex-wrap items-center gap-4 p-4">
              {r.meal && <MealImage meal={r.meal} className="h-16 w-20 shrink-0 rounded-xl" />}
              <div className="min-w-0 flex-1 basis-48">
                <p className="truncate font-bold">{r.meal?.name ?? "Removed dish"}</p>
                <p className="mt-1 flex items-center gap-2 text-sm text-muted">
                  <Avatar name={r.user?.name} url={r.user?.image} size={20} />
                  <span className="truncate">
                    {r.user?.name} · {r.user?.email}
                  </span>
                </p>
                <p className="text-xs text-muted">{formatDate(r.createdAt)}</p>
              </div>
              <span className={`chip ${REQUEST_STATUS[r.status][1]}`}>{REQUEST_STATUS[r.status][0]}</span>
              {r.status === "PENDING" && (
                <button type="button" disabled={busyId === r.id} onClick={() => serve(r.id)} className="btn btn-primary btn-sm">
                  {busyId === r.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />} Mark served
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
