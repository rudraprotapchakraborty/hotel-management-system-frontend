import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Check, Heart, ShoppingBag, UtensilsCrossed } from "lucide-react";
import toast from "react-hot-toast";
import api, { getErrorMessage } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { TIME_LABELS, TYPE_LABELS, money } from "../lib/format";
import { Stars } from "./Stars";

/** Meal photo with a plate icon shown when the picture is missing or fails to load. */
export function MealImage({ meal, className = "", eager = false }) {
  const [failedUrl, setFailedUrl] = useState(null);
  const failed = failedUrl === meal.image;
  return (
    <div className={`relative overflow-hidden bg-brand-soft ${className}`}>
      {failed ? (
        <div className="absolute inset-0 grid place-items-center gap-2 p-4 text-center text-muted">
          <UtensilsCrossed className="h-8 w-8 text-brand" />
          <span className="text-sm font-semibold">{meal.name}</span>
        </div>
      ) : (
        <img src={meal.image} alt={meal.name} loading={eager ? "eager" : "lazy"} decoding="async" referrerPolicy="no-referrer" onError={() => setFailedUrl(meal.image)} className="h-full w-full object-cover" />
      )}
    </div>
  );
}

/** Like button for a meal. Keeps its own count so the card updates the moment it is tapped. */
export function LikeButton({ meal, className = "", withCount = false }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [state, setState] = useState({ liked: Boolean(meal.liked), likes: meal.likes });
  const [busy, setBusy] = useState(false);

  useEffect(() => setState({ liked: Boolean(meal.liked), likes: meal.likes }), [meal.id, meal.liked, meal.likes]);

  const toggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return navigate(`/login?from=${encodeURIComponent(location.pathname + location.search)}`);
    if (busy) return;
    setBusy(true);
    try {
      const res = await api.post(`/meals/${meal.id}/like`);
      setState(res.data.data);
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not update your like."));
    }
    setBusy(false);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={state.liked}
      aria-label={state.liked ? `Unlike ${meal.name}` : `Like ${meal.name}`}
      className={`inline-flex items-center gap-1.5 rounded-full bg-paper/90 px-2.5 py-1.5 text-xs font-bold text-ink shadow backdrop-blur transition hover:scale-105 ${className}`}
    >
      <Heart className={`h-4 w-4 ${state.liked ? "fill-danger text-danger" : ""}`} />
      {(withCount || true) && <span className="tabular-nums">{state.likes}</span>}
    </button>
  );
}

export default function MealCard({ meal, eager = false }) {
  const { has, add } = useCart();
  const inCart = has("meal", meal.id);

  return (
    <article className="group card flex h-full flex-col overflow-hidden transition duration-300 hover:-translate-y-1.5 hover:border-brand hover:shadow-xl">
      <div className="relative">
        <Link to={`/meals/${meal.id}`} aria-label={meal.name} className="block">
          <MealImage meal={meal} eager={eager} className="aspect-[4/3] transition duration-500 group-hover:scale-[1.03]" />
        </Link>
        <span className="chip absolute left-3 top-3 bg-paper/90 text-ink backdrop-blur">{TYPE_LABELS[meal.type] ?? meal.type}</span>
        <LikeButton meal={meal} className="absolute right-3 top-3" />
        {meal.upcoming && <span className="chip absolute bottom-3 left-3 bg-brand text-on-brand">Coming soon</span>}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="line-clamp-1 text-[16px] font-bold tracking-tight">
          <Link to={`/meals/${meal.id}`} className="hover:text-brand">
            {meal.name}
          </Link>
        </h3>
        <p className="mt-0.5 text-xs text-muted">
          {TIME_LABELS[meal.mealTime]} · {meal.chef}
        </p>
        <div className="mt-2 flex items-center gap-2">
          <Stars value={meal.rating} size={14} />
          <span className="text-xs text-muted">{meal.rating ? `${meal.rating} (${meal.ratingCount})` : "No reviews yet"}</span>
        </div>
        <div className="mt-auto flex items-center justify-between gap-2 pt-4">
          <span className="text-lg font-bold tabular-nums">{money(meal.price)}</span>
          {meal.upcoming ? (
            <Link to={`/meals/${meal.id}`} className="btn btn-ghost btn-sm">
              Details
            </Link>
          ) : (
            <button type="button" onClick={() => !inCart && add("meal", meal.id, meal.name)} disabled={inCart} className={`btn btn-sm ${inCart ? "btn-ghost" : "btn-primary"}`}>
              {inCart ? <Check className="h-3.5 w-3.5" /> : <ShoppingBag className="h-3.5 w-3.5" />} {inCart ? "In cart" : "Add"}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

export function MealGrid({ meals, eagerCount = 4 }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {meals.map((m, i) => (
        <MealCard key={m.id} meal={m} eager={i < eagerCount} />
      ))}
    </div>
  );
}

export function MealGridSkeleton({ count = 8 }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" role="status" aria-label="Loading the menu">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="card overflow-hidden">
          <div className="skeleton aspect-[4/3] !rounded-none" />
          <div className="space-y-2 p-4">
            <div className="skeleton h-4 w-3/4" />
            <div className="skeleton h-3 w-1/2" />
            <div className="skeleton h-8 w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}
