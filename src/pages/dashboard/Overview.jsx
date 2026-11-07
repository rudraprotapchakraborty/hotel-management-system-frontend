import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ConciergeBell, CreditCard, Crown, Heart, ShoppingBag, Star } from "lucide-react";
import api from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import { BADGE_LABELS, money } from "../../lib/format";
import { PageTitle } from "./DashboardLayout";

const Stat = ({ icon: Icon, label, value, tone = "var(--brand)" }) => (
  <div className="card flex items-center gap-4 p-5">
    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl" style={{ background: `color-mix(in oklab, ${tone} 14%, transparent)`, color: tone }}>
      <Icon className="h-5 w-5" />
    </span>
    <div>
      <dd className="text-2xl font-bold leading-none tracking-tight tabular-nums">{value ?? "–"}</dd>
      <dt className="mt-1 text-xs font-semibold text-muted">{label}</dt>
    </div>
  </div>
);

export default function Overview() {
  const { user } = useAuth();
  const [me, setMe] = useState(null);
  const [admin, setAdmin] = useState(null);

  useEffect(() => {
    api.get("/dashboard/summary").then((r) => setMe(r.data.data)).catch(() => {});
    if (user.role === "ADMIN") api.get("/admin/stats").then((r) => setAdmin(r.data.data)).catch(() => {});
  }, [user.role]);

  const badge = me?.badge ?? user.badge ?? "bronze";

  return (
    <>
      <PageTitle title="Welcome back," accent={user.fullName.split(" ")[0]} />

      <div className="card flex flex-wrap items-center gap-4 bg-brand-soft/60 p-5">
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand text-on-brand">
          <Crown className="h-6 w-6" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">Your membership</p>
          <p className="text-xl font-bold tracking-tight">{BADGE_LABELS[badge]}</p>
        </div>
        {badge !== "platinum" && (
          <Link to="/membership" className="btn btn-primary btn-sm">
            Upgrade <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        )}
      </div>

      <h2 className="mb-3 mt-9 text-sm font-bold uppercase tracking-wider text-muted">Your activity</h2>
      <dl className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <Stat icon={ShoppingBag} label="Items in your cart" value={me?.cartItems} />
        <Stat icon={CreditCard} label="Orders paid" value={me?.orders} tone="var(--done)" />
        <Stat icon={CreditCard} label="Total spent" value={me ? money(me.spent) : undefined} tone="var(--done)" />
        <Stat icon={Star} label="Reviews written" value={me?.reviews} tone="var(--gold)" />
        <Stat icon={ConciergeBell} label="Requests waiting" value={me?.pendingRequests} tone="var(--progress)" />
        <Stat icon={Heart} label="Dishes you like" value={me?.likes} tone="var(--danger)" />
      </dl>

      {admin && (
        <>
          <h2 className="mb-3 mt-9 text-sm font-bold uppercase tracking-wider text-muted">Hotel overview</h2>
          {user.isDemo && (
            <p role="note" className="mb-3 rounded-2xl border border-brand/25 bg-brand-soft p-3.5 text-sm">
              <b>Test admin.</b> You see and manage test data only, never real members.
            </p>
          )}
          <dl className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Stat icon={CreditCard} label="Revenue" value={money(admin.revenue)} tone="var(--done)" />
            <Stat icon={ShoppingBag} label="Paid orders" value={admin.orders} />
            <Stat icon={ConciergeBell} label="Requests waiting" value={admin.pendingRequests} tone="var(--progress)" />
            <Stat icon={Crown} label="Plan members" value={admin.members} tone="var(--gold)" />
            <Stat icon={Star} label="Reviews" value={admin.reviews} tone="var(--gold)" />
            <Stat icon={ShoppingBag} label="Dishes on menu" value={admin.meals} />
            <Stat icon={ShoppingBag} label="Upcoming dishes" value={admin.upcoming} tone="var(--progress)" />
            <Stat icon={Heart} label="Members" value={admin.users} tone="var(--danger)" />
          </dl>
        </>
      )}
    </>
  );
}
