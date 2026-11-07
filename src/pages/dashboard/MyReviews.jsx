import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, Pencil, RefreshCw, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import api, { getErrorMessage } from "../../lib/api";
import ConfirmDialog from "../../components/ConfirmDialog";
import { MealImage } from "../../components/MealCard";
import { Stars, StarInput } from "../../components/Stars";
import { formatDate } from "../../lib/format";
import { PageTitle } from "./DashboardLayout";

export default function MyReviews() {
  const [reviews, setReviews] = useState(null);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(null); // { id, rating, comment }
  const [saving, setSaving] = useState(false);
  const [removing, setRemoving] = useState(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const res = await api.get("/reviews/mine");
      setReviews(res.data.data);
    } catch (err) {
      setError(getErrorMessage(err, "Could not load your reviews."));
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const save = async (review) => {
    setSaving(true);
    try {
      await api.put(`/reviews/meal/${review.meal.id}`, { rating: editing.rating, comment: editing.comment });
      toast.success("Review updated");
      setEditing(null);
      await load();
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not save the review."));
    }
    setSaving(false);
  };

  const remove = async () => {
    setSaving(true);
    try {
      await api.delete(`/reviews/${removing.id}`);
      toast.success("Review deleted");
      setRemoving(null);
      await load();
    } catch (err) {
      toast.error(getErrorMessage(err));
      setRemoving(null);
    }
    setSaving(false);
  };

  return (
    <>
      <PageTitle title="My" accent="reviews" />
      {error ? (
        <div role="alert" className="card grid place-items-center gap-4 p-10 text-center">
          <p className="text-muted">{error}</p>
          <button type="button" onClick={load} className="btn btn-primary btn-sm">
            <RefreshCw className="h-3.5 w-3.5" /> Try again
          </button>
        </div>
      ) : !reviews ? (
        <div className="space-y-3" role="status" aria-label="Loading your reviews">
          {[1, 2].map((i) => (
            <div key={i} className="skeleton h-28" />
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="card grid place-items-center gap-4 p-14 text-center">
          <p className="text-lg font-bold">You have not reviewed anything yet</p>
          <p className="max-w-sm text-sm text-muted">Open a dish on the menu and tell others how it was.</p>
          <Link to="/meals" className="btn btn-primary btn-sm">
            Browse the menu
          </Link>
        </div>
      ) : (
        <ul className="space-y-4">
          {reviews.map((r) => (
            <li key={r.id} className="card flex flex-col gap-4 p-4 sm:flex-row">
              {r.meal && (
                <Link to={`/meals/${r.meal.id}`} className="block w-full shrink-0 overflow-hidden rounded-2xl sm:w-36" aria-label={r.meal.name}>
                  <MealImage meal={r.meal} className="aspect-[4/3]" />
                </Link>
              )}
              <div className="min-w-0 flex-1">
                <p className="font-bold">{r.meal ? <Link to={`/meals/${r.meal.id}`} className="hover:text-brand">{r.meal.name}</Link> : "Removed dish"}</p>
                {editing?.id === r.id ? (
                  <div className="mt-3 space-y-3">
                    <StarInput value={editing.rating} onChange={(rating) => setEditing({ ...editing, rating })} size={24} />
                    <label className="sr-only" htmlFor={`edit-${r.id}`}>
                      Review text
                    </label>
                    <textarea id={`edit-${r.id}`} value={editing.comment} onChange={(e) => setEditing({ ...editing, comment: e.target.value })} minLength={3} maxLength={500} rows={3} className="input resize-y" />
                    <div className="flex gap-2">
                      <button type="button" disabled={saving} onClick={() => save(r)} className="btn btn-primary btn-sm">
                        {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />} Save
                      </button>
                      <button type="button" onClick={() => setEditing(null)} className="btn btn-ghost btn-sm">
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="mt-1 flex items-center gap-3">
                      <Stars value={r.rating} />
                      <span className="text-xs text-muted">{formatDate(r.updatedAt)}</span>
                    </div>
                    <p className="mt-2 text-[15px] leading-relaxed">{r.comment}</p>
                  </>
                )}
              </div>
              {editing?.id !== r.id && (
                <div className="flex shrink-0 items-start gap-1">
                  <button type="button" onClick={() => setEditing({ id: r.id, rating: r.rating, comment: r.comment })} aria-label={`Edit your review of ${r.meal?.name}`} className="grid h-9 w-9 place-items-center rounded-full text-muted hover:bg-line hover:text-ink">
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button type="button" onClick={() => setRemoving(r)} aria-label={`Delete your review of ${r.meal?.name}`} className="grid h-9 w-9 place-items-center rounded-full text-muted hover:bg-[var(--danger-soft)] hover:text-danger">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
      {removing && <ConfirmDialog title="Delete this review?" message="It will be removed from the dish page and the dish's rating will be recalculated." busy={saving} onConfirm={remove} onCancel={() => setRemoving(null)} />}
    </>
  );
}
