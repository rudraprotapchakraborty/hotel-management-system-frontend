import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";
import api, { getErrorMessage } from "../../lib/api";
import { formatDate, money } from "../../lib/format";
import { PAYMENT_STATUS } from "./Payments";
import { PageTitle } from "./DashboardLayout";

export default function AdminPayments() {
  const [page, setPage] = useState(1);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setError(null);
    api
      .get("/admin/payments", { params: { page, limit: 15 } })
      .then((res) => !cancelled && setData(res.data.data))
      .catch((err) => !cancelled && setError(getErrorMessage(err, "Could not load the payments.")));
    return () => {
      cancelled = true;
    };
  }, [page, attempt]);

  return (
    <>
      <PageTitle title="All" accent="payments" />
      {error ? (
        <div role="alert" className="card grid place-items-center gap-4 p-10 text-center">
          <p className="text-muted">{error}</p>
          <button type="button" onClick={() => setAttempt((n) => n + 1)} className="btn btn-primary btn-sm">
            <RefreshCw className="h-3.5 w-3.5" /> Try again
          </button>
        </div>
      ) : !data ? (
        <div className="space-y-3" role="status" aria-label="Loading payments">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton h-16" />
          ))}
        </div>
      ) : data.payments.length === 0 ? (
        <p className="card p-12 text-center text-muted">No payments yet.</p>
      ) : (
        <>
          <div className="card overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="border-b border-line text-xs uppercase tracking-wider text-muted">
                <tr>
                  <th className="px-4 py-3 font-semibold">Guest</th>
                  <th className="px-4 py-3 font-semibold">Items</th>
                  <th className="px-4 py-3 font-semibold">Method</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 text-right font-semibold">Total</th>
                  <th className="px-4 py-3 font-semibold">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {data.payments.map((p) => {
                  const [label, tone] = PAYMENT_STATUS[p.status] ?? PAYMENT_STATUS.pending;
                  return (
                    <tr key={p.id}>
                      <td className="px-4 py-3">
                        <p className="font-semibold">{p.user?.name ?? "Deleted member"}</p>
                        <p className="font-mono text-xs text-muted">{p.user?.email}</p>
                      </td>
                      <td className="max-w-[220px] px-4 py-3 text-muted">
                        <span className="line-clamp-2">{p.items.map((i) => i.name).join(", ")}</span>
                      </td>
                      <td className="px-4 py-3">{p.method === "stripe" ? "Card" : "SSLCommerz"}</td>
                      <td className="px-4 py-3">
                        <span className={`chip ${tone}`}>{label}</span>
                      </td>
                      <td className="px-4 py-3 text-right font-bold tabular-nums">{money(p.total)}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-muted">{formatDate(p.paidAt ?? p.createdAt)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {data.pages > 1 && (
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
        </>
      )}
    </>
  );
}
