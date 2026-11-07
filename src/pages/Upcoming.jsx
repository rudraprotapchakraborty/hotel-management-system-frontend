import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Crown, RefreshCw } from "lucide-react";
import api, { getErrorMessage } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { MealGrid, MealGridSkeleton } from "../components/MealCard";

export default function Upcoming() {
  const { user } = useAuth();
  const [meals, setMeals] = useState(null);
  const [error, setError] = useState(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setError(null);
    api
      .get("/meals", { params: { upcoming: "true", limit: 24 } })
      .then((res) => !cancelled && setMeals(res.data.data.meals))
      .catch((err) => !cancelled && setError(getErrorMessage(err, "Could not load the upcoming dishes.")));
    return () => {
      cancelled = true;
    };
  }, [attempt, user]);

  const free = !user || user.badge === "bronze";

  return (
    <div className="frame pb-20 pt-10">
      <span className="eyeline">Coming soon</span>
      <h1 className="display mt-3 text-[clamp(32px,4.4vw,52px)]">
        Upcoming <span className="accent">dishes</span>
      </h1>
      <p className="mt-3 max-w-[560px] text-muted">A first look at what the kitchen is working on. The most-liked dishes make it onto the menu.</p>

      {free && (
        <div role="note" className="mt-6 flex flex-wrap items-center gap-3 rounded-2xl border border-brand/25 bg-brand-soft p-4 text-sm">
          <Crown className="h-5 w-5 shrink-0 text-brand" />
          <p className="min-w-0 flex-1">Silver, Gold and Platinum members can like upcoming dishes and help decide what is served next.</p>
          <Link to="/membership" className="btn btn-primary btn-sm">
            See plans
          </Link>
        </div>
      )}

      {error ? (
        <div role="alert" className="card mt-10 grid place-items-center gap-4 p-10 text-center">
          <p className="text-muted">{error}</p>
          <button type="button" onClick={() => setAttempt((n) => n + 1)} className="btn btn-primary btn-sm">
            <RefreshCw className="h-3.5 w-3.5" /> Try again
          </button>
        </div>
      ) : meals === null ? (
        <div className="mt-8">
          <MealGridSkeleton count={4} />
        </div>
      ) : meals.length === 0 ? (
        <p className="card mt-10 p-12 text-center text-muted">Nothing new is planned right now. Check back soon.</p>
      ) : (
        <div className="mt-8">
          <MealGrid meals={meals} />
        </div>
      )}
    </div>
  );
}
