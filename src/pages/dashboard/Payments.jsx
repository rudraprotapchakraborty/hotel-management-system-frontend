import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, Crown, RefreshCw, XCircle } from "lucide-react";
import api, { getErrorMessage } from "../../lib/api";
import { useCart } from "../../context/CartContext";
import { formatDate, money } from "../../lib/format";
import { PageTitle } from "./DashboardLayout";

export const PAYMENT_STATUS = {
  paid: ["Paid", "bg-[var(--done-soft)] text-done"],
  failed: ["Failed", "bg-[var(--danger-soft)] text-danger"],
  cancelled: ["Cancelled", "bg-line/70 text-muted"],
  pending: ["Pending", "bg-[var(--progress-soft)] text-progress"],
};

const banners = {
  success: { Icon: CheckCircle2, tone: "bg-[var(--done-soft)] text-done", text: "Payment received. Thank you, your order is in." },
  failed: { Icon: XCircle, tone: "bg-[var(--danger-soft)] text-danger", text: "The payment did not go through, so you were not charged. Your cart is still waiting." },
  cancelled: { Icon: XCircle, tone: "bg-line/60 text-muted", text: "You cancelled the payment. Your cart is still waiting." },
};

export default function Payments() {
  const [params, setParams] = useSearchParams();
  const status = params.get("status");
  const { refresh } = useCart();
  const [orders, setOrders] = useState(null);
  const [error, setError] = useState(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setError(null);
    api
      .get("/payments/mine")
      .then((res) => !cancelled && setOrders(res.data.data))
      .catch((err) => !cancelled && setError(getErrorMessage(err, "Could not load your orders.")));
    return () => {
      cancelled = true;
    };
  }, [attempt]);

  // Coming back from the SSLCommerz payment page: the cart may have changed
  useEffect(() => {
    if (status) refresh();
  }, [status, refresh]);

  const banner = banners[status];

  return (
    <>
      <PageTitle title="Payment" accent="history" />
      {banner && (
        <div role="status" className={`mb-6 flex items-start gap-3 rounded-2xl p-4 text-sm ${banner.tone}`}>
          <banner.Icon className="mt-0.5 h-5 w-5 shrink-0" />
          <p className="flex-1">{banner.text}</p>
          <button type="button" onClick={() => setParams({}, { replace: true })} className="font-semibold underline underline-offset-2">
            Dismiss
          </button>
        </div>
      )}

      {error ? (
        <div role="alert" className="card grid place-items-center gap-4 p-10 text-center">
          <p className="text-muted">{error}</p>
          <button type="button" onClick={() => setAttempt((n) => n + 1)} className="btn btn-primary btn-sm">
            <RefreshCw className="h-3.5 w-3.5" /> Try again
          </button>
        </div>
      ) : !orders ? (
        <div className="space-y-3" role="status" aria-label="Loading orders">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton h-28" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="card grid place-items-center gap-4 p-14 text-center">
          <p className="text-lg font-bold">No orders yet</p>
          <Link to="/meals" className="btn btn-primary btn-sm">
            Browse the menu
          </Link>
        </div>
      ) : (
        <ul className="space-y-4">
          {orders.map((o) => {
            const [label, tone] = PAYMENT_STATUS[o.status] ?? PAYMENT_STATUS.pending;
            return (
              <li key={o.id} className="card p-5">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                  <span className={`chip ${tone}`}>{label}</span>
                  <span className="text-sm text-muted">{formatDate(o.paidAt ?? o.createdAt)}</span>
                  <span className="chip bg-line/60 text-muted">{o.method === "stripe" ? "Card" : "SSLCommerz"}</span>
                  <span className="ml-auto text-xl font-bold tabular-nums">{money(o.total)}</span>
                </div>
                <ul className="mt-4 divide-y divide-line text-sm">
                  {o.items.map((i, idx) => (
                    <li key={idx} className="flex items-center justify-between gap-3 py-2">
                      <span className="flex items-center gap-2">
                        {i.kind === "plan" && <Crown className="h-4 w-4 text-brand" />}
                        {i.name}
                      </span>
                      <span className="tabular-nums text-muted">{money(i.price)}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-3 break-all font-mono text-xs text-muted">Transaction {o.transactionId}</p>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
