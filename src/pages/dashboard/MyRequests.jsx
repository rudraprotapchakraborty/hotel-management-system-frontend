import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";
import api, { getErrorMessage } from "../../lib/api";
import { MealImage } from "../../components/MealCard";
import { formatDate, money } from "../../lib/format";
import { PageTitle } from "./DashboardLayout";

export const REQUEST_STATUS = {
  PENDING: ["Waiting for the kitchen", "bg-[var(--progress-soft)] text-progress"],
  SERVED: ["Served", "bg-[var(--done-soft)] text-done"],
  CANCELLED: ["Cancelled", "bg-line/70 text-muted"],
};

export default function MyRequests() {
  const [requests, setRequests] = useState(null);
  const [error, setError] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const res = await api.get("/requests/mine");
      setRequests(res.data.data);
    } catch (err) {
      setError(getErrorMessage(err, "Could not load your requests."));
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const cancel = async (id) => {
    setBusyId(id);
    try {
      await api.post(`/requests/${id}/cancel`);
      toast.success("Request cancelled");
      await load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
    setBusyId(null);
  };

  return (
    <>
      <PageTitle title="My" accent="requests" />
      {error ? (
        <div role="alert" className="card grid place-items-center gap-4 p-10 text-center">
          <p className="text-muted">{error}</p>
          <button type="button" onClick={load} className="btn btn-primary btn-sm">
            <RefreshCw className="h-3.5 w-3.5" /> Try again
          </button>
        </div>
      ) : !requests ? (
        <div className="space-y-3" role="status" aria-label="Loading your requests">
          {[1, 2].map((i) => (
            <div key={i} className="skeleton h-24" />
          ))}
        </div>
      ) : requests.length === 0 ? (
        <div className="card grid place-items-center gap-4 p-14 text-center">
          <p className="text-lg font-bold">No requests yet</p>
          <p className="max-w-sm text-sm text-muted">Use &ldquo;Request this meal&rdquo; on a dish and the kitchen will prepare it for you.</p>
          <Link to="/meals" className="btn btn-primary btn-sm">
            Browse the menu
          </Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {requests.map((r) => {
            const [label, tone] = REQUEST_STATUS[r.status];
            return (
              <li key={r.id} className="card flex items-center gap-4 p-4">
                {r.meal && (
                  <Link to={`/meals/${r.meal.id}`} className="block w-24 shrink-0 overflow-hidden rounded-xl sm:w-28" aria-label={r.meal.name}>
                    <MealImage meal={r.meal} className="aspect-[4/3]" />
                  </Link>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold">{r.meal?.name ?? "Removed dish"}</p>
                  <p className="text-xs text-muted">
                    {formatDate(r.createdAt)}
                    {r.meal ? ` · ${money(r.meal.price)}` : ""}
                  </p>
                  <span className={`chip mt-2 ${tone}`}>{label}</span>
                </div>
                {r.status === "PENDING" && (
                  <button type="button" disabled={busyId === r.id} onClick={() => cancel(r.id)} className="btn btn-ghost btn-sm">
                    {busyId === r.id && <Loader2 className="h-3.5 w-3.5 animate-spin" />} Cancel
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
