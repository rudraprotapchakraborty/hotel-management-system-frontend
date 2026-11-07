import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Check, ChefHat, Clock, ConciergeBell, ExternalLink, Loader2, ShoppingBag, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import api, { getErrorMessage } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import Avatar from "../components/Avatar";
import { LikeButton, MealImage } from "../components/MealCard";
import { Stars, StarInput } from "../components/Stars";
import { BADGE_LABELS, TIME_LABELS, TYPE_LABELS, formatDate, money } from "../lib/format";
import NotFound from "./NotFound";

function Reviews({ meal, onChange }) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await api.get(`/reviews/meal/${meal.id}`);
      setReviews(res.data.data);
    } catch {
      setReviews([]);
    }
  }, [meal.id]);

  useEffect(() => {
    load();
  }, [load]);

  const mine = user && reviews?.find((r) => r.user?.id === user.id);
  useEffect(() => {
    if (mine) {
      setRating(mine.rating);
      setComment(mine.comment);
    }
  }, [mine?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const submit = async (e) => {
    e.preventDefault();
    if (!rating) return toast.error("Choose a star rating first.");
    setSaving(true);
    try {
      await api.put(`/reviews/meal/${meal.id}`, { rating, comment });
      toast.success(mine ? "Review updated" : "Thanks for your review");
      await load();
      onChange();
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not save your review."));
    }
    setSaving(false);
  };

  const remove = async (id) => {
    try {
      await api.delete(`/reviews/${id}`);
      toast.success("Review deleted");
      setRating(0);
      setComment("");
      await load();
      onChange();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <section className="mt-14" aria-labelledby="reviews-title">
      <h2 id="reviews-title" className="text-2xl font-bold tracking-tight">
        Reviews {reviews && <span className="text-muted">({reviews.length})</span>}
      </h2>

      {meal.upcoming ? (
        <p className="mt-4 rounded-2xl bg-line/50 p-4 text-sm text-muted">This dish is not on the menu yet, so it cannot be reviewed.</p>
      ) : user ? (
        <form onSubmit={submit} className="card mt-5 space-y-4 p-5">
          <p className="font-bold">{mine ? "Your review" : "Write a review"}</p>
          <StarInput value={rating} onChange={setRating} />
          <label htmlFor="review-comment" className="sr-only">
            Your review
          </label>
          <textarea id="review-comment" value={comment} onChange={(e) => setComment(e.target.value)} required minLength={3} maxLength={500} rows={3} placeholder="How was it?" className="input resize-y" />
          <div className="flex items-center gap-3">
            <button type="submit" disabled={saving} className="btn btn-primary btn-sm">
              {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />} {mine ? "Update review" : "Post review"}
            </button>
            {mine && (
              <button type="button" onClick={() => remove(mine.id)} className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-danger">
                <Trash2 className="h-3.5 w-3.5" /> Delete
              </button>
            )}
          </div>
        </form>
      ) : (
        <p className="card mt-5 p-5 text-sm text-muted">
          <Link to={`/login?from=${encodeURIComponent(`/meals/${meal.id}`)}`} className="font-semibold text-brand underline underline-offset-2">
            Sign in
          </Link>{" "}
          to write a review.
        </p>
      )}

      {reviews === null ? (
        <div className="mt-6 space-y-3" role="status" aria-label="Loading reviews">
          {[1, 2].map((i) => (
            <div key={i} className="skeleton h-24" />
          ))}
        </div>
      ) : reviews.length === 0 ? (
        !meal.upcoming && <p className="mt-6 text-muted">No reviews yet. Be the first.</p>
      ) : (
        <ul className="mt-6 space-y-4">
          {reviews.map((r) => (
            <li key={r.id} className="card p-5">
              <div className="flex flex-wrap items-center gap-3">
                <Avatar name={r.user?.name} url={r.user?.image} size={38} />
                <div>
                  <p className="flex items-center gap-2 font-bold">
                    {r.user?.name ?? "Former guest"}
                    {r.user?.badge && r.user.badge !== "bronze" && <span className="chip bg-brand-soft text-brand">{BADGE_LABELS[r.user.badge]}</span>}
                  </p>
                  <p className="text-xs text-muted">{formatDate(r.updatedAt)}</p>
                </div>
                <Stars value={r.rating} className="ml-auto" />
              </div>
              <p className="mt-3 text-[15px] leading-relaxed">{r.comment}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default function MealDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const { add, has } = useCart();
  const [meal, setMeal] = useState(null);
  const [state, setState] = useState("loading"); // loading | ready | missing | error
  const [requesting, setRequesting] = useState(false);
  const [requested, setRequested] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await api.get(`/meals/${id}`);
      setMeal(res.data.data);
      setState("ready");
    } catch (err) {
      setState(err?.response?.status === 404 || err?.response?.status === 400 ? "missing" : "error");
    }
  }, [id]);

  useEffect(() => {
    setState("loading");
    setRequested(false);
    load();
  }, [load, user]);

  if (state === "missing") return <NotFound />;
  if (state === "error") {
    return (
      <div className="frame py-20 text-center" role="alert">
        <p className="text-muted">Could not load this dish.</p>
        <button type="button" onClick={load} className="btn btn-primary btn-sm mt-4">
          Try again
        </button>
      </div>
    );
  }
  if (state === "loading" || !meal) {
    return (
      <div className="frame grid gap-10 py-12 md:grid-cols-2" role="status" aria-label="Loading dish">
        <div className="skeleton aspect-[4/3] !rounded-3xl" />
        <div className="space-y-4">
          <div className="skeleton h-12 w-3/4" />
          <div className="skeleton h-6 w-1/2" />
          <div className="skeleton h-40" />
        </div>
      </div>
    );
  }

  const inCart = has("meal", meal.id);

  const request = async () => {
    if (!user) return window.location.assign(`/login?from=${encodeURIComponent(`/meals/${meal.id}`)}`);
    setRequesting(true);
    try {
      await api.post("/requests", { mealId: meal.id });
      setRequested(true);
      toast.success("Request sent to the kitchen");
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not send the request."));
    }
    setRequesting(false);
  };

  return (
    <div className="frame pb-20 pt-8">
      <Link to={meal.upcoming ? "/upcoming" : "/meals"} className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-ink">
        <ArrowLeft className="h-4 w-4" /> {meal.upcoming ? "Upcoming dishes" : "Menu"}
      </Link>

      <div className="mt-6 grid gap-10 md:grid-cols-[1.05fr_1fr] lg:gap-14">
        <div className="self-start overflow-hidden rounded-3xl border border-line shadow-[var(--shadow)]">
          <MealImage meal={meal} eager className="aspect-[4/3]" />
        </div>

        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="chip bg-brand-soft text-brand">{TYPE_LABELS[meal.type] ?? meal.type}</span>
            <span className="chip bg-line/60 text-muted">
              <Clock className="h-3 w-3" /> {TIME_LABELS[meal.mealTime]}
            </span>
            {meal.upcoming && <span className="chip bg-brand text-on-brand">Coming soon</span>}
          </div>
          <h1 className="display mt-4 text-[clamp(32px,4.6vw,56px)]">{meal.name}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
            <span className="flex items-center gap-2">
              <Stars value={meal.rating} />
              <span className="text-sm text-muted">{meal.rating ? `${meal.rating} (${meal.ratingCount} ${meal.ratingCount === 1 ? "review" : "reviews"})` : "No reviews yet"}</span>
            </span>
            <LikeButton meal={meal} className="!bg-line/50" />
          </div>
          <p className="mt-5 flex items-center gap-2 text-sm text-muted">
            <ChefHat className="h-4 w-4 text-brand" /> Prepared by <b className="text-ink">{meal.chef}</b>
          </p>
          <p className="mt-5 max-w-[60ch] text-[16px] leading-relaxed text-ink/90">{meal.description}</p>

          {meal.ingredients.length > 0 && (
            <>
              <h2 className="mt-7 text-sm font-bold uppercase tracking-wider text-muted">Ingredients</h2>
              <ul className="mt-3 flex flex-wrap gap-2">
                {meal.ingredients.map((i) => (
                  <li key={i} className="chip bg-surface text-ink ring-1 ring-line">
                    {i}
                  </li>
                ))}
              </ul>
            </>
          )}

          <p className="mt-8 text-4xl font-bold tracking-tight tabular-nums">{money(meal.price)}</p>

          {meal.upcoming ? (
            <p className="mt-5 rounded-2xl bg-brand-soft p-4 text-sm">
              This dish is not on the menu yet. Silver, Gold and Platinum members can like it to help it get there.{" "}
              <Link to="/membership" className="font-semibold text-brand underline underline-offset-2">
                See plans
              </Link>
            </p>
          ) : (
            <div className="mt-5 flex flex-wrap gap-3">
              <button type="button" onClick={() => !inCart && add("meal", meal.id, meal.name)} disabled={inCart} className={`btn ${inCart ? "btn-ghost" : "btn-primary"}`}>
                {inCart ? <Check className="h-4 w-4" /> : <ShoppingBag className="h-4 w-4" />} {inCart ? "In your cart" : "Add to cart"}
              </button>
              <button type="button" onClick={request} disabled={requesting || requested} className="btn btn-ghost">
                {requesting ? <Loader2 className="h-4 w-4 animate-spin" /> : requested ? <Check className="h-4 w-4" /> : <ConciergeBell className="h-4 w-4" />} {requested ? "Request sent" : "Request this meal"}
              </button>
              {inCart && (
                <Link to="/dashboard/cart" className="btn btn-ink">
                  Go to checkout
                </Link>
              )}
            </div>
          )}

          {meal.source && (
            <p className="mt-8 text-xs text-muted">
              <a href={meal.source} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 underline underline-offset-2 hover:text-ink">
                <ExternalLink className="h-3.5 w-3.5" /> Photo from Wikipedia
              </a>
            </p>
          )}
        </div>
      </div>

      <Reviews meal={meal} onChange={load} />
    </div>
  );
}
