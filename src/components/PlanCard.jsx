import { Link } from "react-router-dom";
import { Check, Crown } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { BADGE_LABELS, money, tierOf } from "../lib/format";

/** A membership plan. The button depends on what the signed-in person already has. */
export default function PlanCard({ plan, highlight = false }) {
  const { user } = useAuth();
  const { add, has } = useCart();
  const free = plan.price <= 0;
  const owned = user && tierOf(user.badge) >= tierOf(plan.badge);
  const inCart = has("plan", plan.id);

  let action;
  if (free) action = <span className="btn btn-ghost w-full cursor-default">Included for everyone</span>;
  else if (owned) action = <span className="btn btn-ghost w-full cursor-default">{user.badge === plan.badge ? "Your current plan" : "Included in your plan"}</span>;
  else if (inCart) {
    action = (
      <Link to="/dashboard/cart" className="btn btn-ink w-full">
        In your cart: checkout
      </Link>
    );
  } else {
    action = (
      <button type="button" onClick={() => add("plan", plan.id, plan.name)} className={`btn w-full ${highlight ? "btn-primary" : "btn-ink"}`}>
        Choose {BADGE_LABELS[plan.badge]}
      </button>
    );
  }

  return (
    <article className={`card relative flex h-full flex-col p-7 ${highlight ? "border-brand shadow-[var(--shadow)]" : ""}`}>
      {highlight && <span className="chip absolute -top-3 left-7 bg-brand text-on-brand">Most popular</span>}
      <div className="flex items-center gap-2.5">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-soft text-brand">
          <Crown className="h-5 w-5" />
        </span>
        <h3 className="text-lg font-bold tracking-tight">{plan.name}</h3>
      </div>
      <p className="mt-5 flex items-baseline gap-1">
        <span className="text-4xl font-bold tracking-tight tabular-nums">{free ? "Free" : money(plan.price)}</span>
        {!free && <span className="text-sm text-muted">one-time</span>}
      </p>
      {plan.description && <p className="mt-3 text-sm leading-relaxed text-muted">{plan.description}</p>}
      <ul className="mt-5 space-y-2.5 text-sm">
        {plan.features.map((f) => (
          <li key={f} className="flex items-start gap-2.5">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-done" />
            <span>{f}</span>
          </li>
        ))}
      </ul>
      <div className="mt-auto pt-7">{action}</div>
    </article>
  );
}

export function PlanGridSkeleton() {
  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4" role="status" aria-label="Loading plans">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="skeleton h-[380px] !rounded-3xl" />
      ))}
    </div>
  );
}
