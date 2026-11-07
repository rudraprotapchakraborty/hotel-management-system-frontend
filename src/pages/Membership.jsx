import { useEffect, useState } from "react";
import api from "../lib/api";
import PlanCard, { PlanGridSkeleton } from "../components/PlanCard";

export default function Membership() {
  const [plans, setPlans] = useState(null);

  useEffect(() => {
    api.get("/public/plans").then((res) => setPlans(res.data.data)).catch(() => setPlans([]));
  }, []);

  return (
    <div className="frame pb-20 pt-10">
      <span className="eyeline">Membership</span>
      <h1 className="display mt-3 max-w-[720px] text-[clamp(32px,4.6vw,56px)]">
        Dine better with a <span className="accent">plan</span>.
      </h1>
      <p className="mt-4 max-w-[560px] text-muted">
        Everyone starts on Bronze. Silver, Gold and Platinum unlock perks such as liking and voting on upcoming dishes. Pay once and your tier stays.
      </p>
      <div className="mt-10">
        {plans === null ? (
          <PlanGridSkeleton />
        ) : plans.length === 0 ? (
          <p className="card p-10 text-center text-muted">Plans are not available right now.</p>
        ) : (
          <div className="grid gap-5 pt-3 md:grid-cols-2 xl:grid-cols-4">
            {plans.map((p) => (
              <PlanCard key={p.id} plan={p} highlight={p.badge === "gold"} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
