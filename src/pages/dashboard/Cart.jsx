import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { CreditCard, Crown, Landmark, Loader2, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import api, { getErrorMessage } from "../../lib/api";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { MealImage } from "../../components/MealCard";
import { money } from "../../lib/format";
import { PageTitle } from "./DashboardLayout";

const PUBLISHABLE_KEY = import.meta.env.STRIPE_PUBLISHABLE_KEY;
const stripePromise = PUBLISHABLE_KEY ? loadStripe(PUBLISHABLE_KEY) : null;

/** The card form. Rendered inside <Elements>, once the server has created the payment. */
function CardForm({ order, onPaid, onCancel }) {
  const stripe = useStripe();
  const elements = useElements();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const pay = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setBusy(true);
    setError(null);
    const result = await stripe.confirmPayment({ elements, redirect: "if_required" });
    if (result.error) {
      setError(result.error.message || "The payment did not go through.");
      setBusy(false);
      return;
    }
    try {
      // The server checks the payment with Stripe itself before it marks the order paid
      await api.post("/payments/stripe/confirm", { paymentId: order.paymentId });
      onPaid();
    } catch (err) {
      setError(getErrorMessage(err, "We could not confirm the payment. If you were charged, it will show in your orders."));
      setBusy(false);
    }
  };

  return (
    <form onSubmit={pay} className="space-y-5">
      <PaymentElement />
      {error && (
        <p role="alert" className="rounded-xl bg-[var(--danger-soft)] p-3 text-sm text-danger">
          {error}
        </p>
      )}
      <div className="flex gap-3">
        <button type="submit" disabled={!stripe || busy} className="btn btn-primary flex-1">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />} Pay {money(order.total)}
        </button>
        <button type="button" onClick={onCancel} disabled={busy} className="btn btn-ghost">
          Back
        </button>
      </div>
      <p className="text-center text-xs text-muted">Test mode: use card 4242 4242 4242 4242, any future date and any CVC.</p>
    </form>
  );
}

export default function Cart() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { items, total, loaded, remove, refresh } = useCart();
  const [methods, setMethods] = useState(null);
  const [order, setOrder] = useState(null); // a Stripe payment in progress
  const [starting, setStarting] = useState("");

  useEffect(() => {
    api.get("/payments/config").then((r) => setMethods(r.data.data)).catch(() => setMethods({ stripe: false, ssl: false }));
  }, []);

  const options = useMemo(() => (order ? { clientSecret: order.clientSecret, appearance: { theme: document.documentElement.classList.contains("dark") ? "night" : "stripe", variables: { colorPrimary: "#94620f", borderRadius: "12px" } } } : null), [order]);

  const startCard = async () => {
    setStarting("card");
    try {
      const res = await api.post("/payments/stripe/intent");
      setOrder(res.data.data);
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not start the card payment."));
      refresh();
    }
    setStarting("");
  };

  const startSsl = async () => {
    setStarting("ssl");
    try {
      const res = await api.post("/payments/ssl/init");
      window.location.assign(res.data.data.gatewayUrl);
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not reach the payment gateway."));
      setStarting("");
    }
  };

  const paid = async () => {
    await refresh();
    toast.success("Payment received. Thank you!");
    navigate("/dashboard/payments?status=success", { replace: true });
  };

  return (
    <>
      <PageTitle title="My" accent="cart" />

      {!loaded ? (
        <div className="space-y-3" role="status" aria-label="Loading your cart">
          {[1, 2].map((i) => (
            <div key={i} className="skeleton h-24" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="card grid place-items-center gap-4 p-14 text-center">
          <p className="text-lg font-bold">Your cart is empty</p>
          <p className="max-w-sm text-sm text-muted">Add dishes from the menu, or choose a membership plan.</p>
          <div className="flex gap-3">
            <Link to="/meals" className="btn btn-primary btn-sm">
              Browse the menu
            </Link>
            <Link to="/membership" className="btn btn-ghost btn-sm">
              See plans
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid gap-8 xl:grid-cols-[1fr_380px]">
          <ul className="space-y-3">
            {items.map((i) => (
              <li key={i.id} className="card flex items-center gap-4 p-4">
                {i.kind === "meal" ? (
                  <MealImage meal={{ name: i.name, image: i.image }} className="h-16 w-16 shrink-0 rounded-xl" />
                ) : (
                  <span className="grid h-16 w-16 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand">
                    <Crown className="h-7 w-7" />
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold">{i.name}</p>
                  <p className="text-xs text-muted">{i.kind === "plan" ? "Membership plan" : "Menu item"}</p>
                </div>
                <p className="font-bold tabular-nums">{money(i.price)}</p>
                <button type="button" onClick={() => remove(i.id)} disabled={Boolean(order)} aria-label={`Remove ${i.name}`} className="grid h-9 w-9 place-items-center rounded-full text-muted hover:bg-[var(--danger-soft)] hover:text-danger disabled:opacity-40">
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>

          <aside className="card h-fit p-6" aria-label="Checkout">
            <div className="flex items-baseline justify-between">
              <span className="text-sm font-semibold text-muted">Total</span>
              <span className="text-3xl font-bold tracking-tight tabular-nums">{money(total)}</span>
            </div>
            <p className="mt-1 text-xs text-muted">Prices are checked on the server when you pay.</p>

            {order && options && stripePromise ? (
              <div className="mt-6">
                <Elements stripe={stripePromise} options={options} key={order.clientSecret}>
                  <CardForm order={order} onPaid={paid} onCancel={() => { setOrder(null); refresh(); }} />
                </Elements>
              </div>
            ) : (
              <div className="mt-6 space-y-3">
                {methods === null ? (
                  <div className="skeleton h-12" />
                ) : (
                  <>
                    {methods.stripe && stripePromise && (
                      <button type="button" onClick={startCard} disabled={Boolean(starting)} className="btn btn-primary w-full">
                        {starting === "card" ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />} Pay by card
                      </button>
                    )}
                    {methods.ssl && (
                      <button type="button" onClick={startSsl} disabled={Boolean(starting)} className="btn btn-ink w-full">
                        {starting === "ssl" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Landmark className="h-4 w-4" />} Pay with SSLCommerz
                      </button>
                    )}
                    {!(methods.stripe && stripePromise) && !methods.ssl && <p className="text-sm text-muted">Online payments are not available right now.</p>}
                    {methods.ssl && <p className="text-center text-xs text-muted">SSLCommerz charges in BDT at about {methods.usdToBdt} BDT per USD ({Math.round(total * methods.usdToBdt).toLocaleString()} BDT).</p>}
                  </>
                )}
              </div>
            )}
            {user?.isDemo && <p className="mt-5 rounded-xl bg-brand-soft p-3 text-xs">Test accounts pay in sandbox mode: no real money moves.</p>}
          </aside>
        </div>
      )}
    </>
  );
}

