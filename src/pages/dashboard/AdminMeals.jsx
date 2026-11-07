import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, Pencil, Plus, RefreshCw, Rocket, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import api, { getErrorMessage } from "../../lib/api";
import ConfirmDialog from "../../components/ConfirmDialog";
import { MealImage } from "../../components/MealCard";
import { TIME_LABELS, TYPE_LABELS, money } from "../../lib/format";
import { PageTitle } from "./DashboardLayout";

export default function AdminMeals() {
  const [tab, setTab] = useState("menu");
  const [page, setPage] = useState(1);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const [removing, setRemoving] = useState(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const res = await api.get("/meals", { params: { upcoming: tab === "upcoming" ? "true" : "false", page, limit: 12, sort: "newest" } });
      setData(res.data.data);
    } catch (err) {
      setError(getErrorMessage(err, "Could not load the meals."));
    }
  }, [tab, page]);

  useEffect(() => {
    setData(null);
    load();
  }, [load]);

  const publish = async (meal) => {
    setBusyId(meal.id);
    try {
      await api.post(`/meals/${meal.id}/publish`);
      toast.success(`${meal.name} is now on the menu`);
      await load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
    setBusyId(null);
  };

  const remove = async () => {
    setBusyId(removing.id);
    try {
      await api.delete(`/meals/${removing.id}`);
      toast.success("Meal deleted");
      setRemoving(null);
      await load();
    } catch (err) {
      toast.error(getErrorMessage(err));
      setRemoving(null);
    }
    setBusyId(null);
  };

  return (
    <>
      <PageTitle title="Manage" accent="meals">
        <Link to="/dashboard/admin/meals/new" className="btn btn-primary btn-sm">
          <Plus className="h-4 w-4" /> Add a meal
        </Link>
      </PageTitle>

      <div role="tablist" aria-label="Meals" className="mb-6 inline-flex rounded-full border border-line bg-surface p-1">
        {[
          ["menu", "On the menu"],
          ["upcoming", "Upcoming"],
        ].map(([id, label]) => (
          <button key={id} role="tab" aria-selected={tab === id} type="button" onClick={() => { setTab(id); setPage(1); }} className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${tab === id ? "bg-brand text-on-brand" : "text-muted hover:text-ink"}`}>
            {label}
          </button>
        ))}
      </div>

      {error ? (
        <div role="alert" className="card grid place-items-center gap-4 p-10 text-center">
          <p className="text-muted">{error}</p>
          <button type="button" onClick={load} className="btn btn-primary btn-sm">
            <RefreshCw className="h-3.5 w-3.5" /> Try again
          </button>
        </div>
      ) : !data ? (
        <div className="space-y-3" role="status" aria-label="Loading meals">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton h-24" />
          ))}
        </div>
      ) : data.meals.length === 0 ? (
        <p className="card p-12 text-center text-muted">Nothing here yet.</p>
      ) : (
        <>
          <ul className="space-y-3">
            {data.meals.map((m) => (
              <li key={m.id} className="card flex flex-wrap items-center gap-4 p-4">
                <Link to={`/meals/${m.id}`} className="block w-24 shrink-0 overflow-hidden rounded-xl" aria-label={m.name}>
                  <MealImage meal={m} className="aspect-[4/3]" />
                </Link>
                <div className="min-w-0 flex-1 basis-48">
                  <p className="truncate font-bold">{m.name}</p>
                  <p className="text-xs text-muted">
                    {TYPE_LABELS[m.type]} · {TIME_LABELS[m.mealTime]} · {m.chef}
                  </p>
                  <p className="mt-1 text-sm">
                    <b className="tabular-nums">{money(m.price)}</b> <span className="text-muted">· {m.likes} likes</span>
                    {m.isSeed && <span className="chip ml-2 bg-line/60 text-muted">Sample</span>}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {m.upcoming && (
                    <button type="button" disabled={busyId === m.id} onClick={() => publish(m)} className="btn btn-primary btn-sm">
                      <Rocket className="h-3.5 w-3.5" /> Publish
                    </button>
                  )}
                  <Link to={`/dashboard/admin/meals/${m.id}/edit`} className="btn btn-ghost btn-sm">
                    <Pencil className="h-3.5 w-3.5" /> Edit
                  </Link>
                  <button type="button" onClick={() => setRemoving(m)} aria-label={`Delete ${m.name}`} className="grid h-9 w-9 place-items-center rounded-full text-muted hover:bg-[var(--danger-soft)] hover:text-danger">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
          {data.pages > 1 && (
            <nav aria-label="Pagination" className="mt-8 flex items-center justify-center gap-3">
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

      {removing && <ConfirmDialog title="Delete this meal?" message={`"${removing.name}" will be removed from the menu together with its likes, reviews, requests and cart entries. This cannot be undone.`} busy={busyId === removing.id} onConfirm={remove} onCancel={() => setRemoving(null)} />}
    </>
  );
}
