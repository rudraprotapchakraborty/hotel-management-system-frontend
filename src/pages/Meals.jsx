import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ChevronLeft, ChevronRight, RefreshCw, Search, X } from "lucide-react";
import api, { getErrorMessage } from "../lib/api";
import { TIME_LABELS, TYPE_LABELS } from "../lib/format";
import { MealGrid, MealGridSkeleton } from "../components/MealCard";

const SORTS = [
  ["newest", "Newest first"],
  ["popular", "Most liked"],
  ["rating", "Best rated"],
  ["price-asc", "Price: low to high"],
  ["price-desc", "Price: high to low"],
];

export default function Meals() {
  const [params, setParams] = useSearchParams();
  const q = params.get("q") ?? "";
  const type = params.get("type") ?? "";
  const mealTime = params.get("mealTime") ?? "";
  const sort = params.get("sort") ?? "newest";
  const minPrice = params.get("minPrice") ?? "";
  const maxPrice = params.get("maxPrice") ?? "";
  const page = Math.max(1, Number(params.get("page")) || 1);

  const [text, setText] = useState(q);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [attempt, setAttempt] = useState(0);
  const top = useRef(null);

  const update = (patch, { keepPage = false } = {}) => {
    const next = new URLSearchParams(params);
    for (const [k, v] of Object.entries(patch)) {
      if (v) next.set(k, v);
      else next.delete(k);
    }
    if (!keepPage) next.delete("page");
    setParams(next, { replace: true });
  };

  // Typing updates the search a moment after the last keystroke
  useEffect(() => {
    if (text.trim() === q) return;
    const id = setTimeout(() => update({ q: text.trim() }), 350);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);
  useEffect(() => setText(q), [q]);

  useEffect(() => {
    const controller = new AbortController();
    setError(null);
    api
      .get("/meals", { params: { q: q || undefined, type: type || undefined, mealTime: mealTime || undefined, minPrice: minPrice || undefined, maxPrice: maxPrice || undefined, sort, page, limit: 12 }, signal: controller.signal })
      .then((res) => setData(res.data.data))
      .catch((err) => !controller.signal.aborted && setError(getErrorMessage(err, "Could not load the menu.")));
    return () => controller.abort();
  }, [q, type, mealTime, minPrice, maxPrice, sort, page, attempt]);

  const go = (p) => {
    update({ page: p > 1 ? String(p) : "" }, { keepPage: true });
    top.current?.scrollIntoView({ behavior: "instant" });
  };

  const filtered = Boolean(q || type || mealTime || minPrice || maxPrice);

  return (
    <div className="frame pb-20 pt-10" ref={top}>
      <span className="eyeline">The menu</span>
      <h1 className="display mt-3 text-[clamp(32px,4.4vw,52px)]">
        Order from the <span className="accent">kitchen</span>
      </h1>

      <div className="mt-7 flex flex-wrap items-center gap-3">
        <div className="relative min-w-[220px] flex-1 sm:max-w-md">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input type="search" value={text} onChange={(e) => setText(e.target.value)} placeholder="Search by dish name" aria-label="Search the menu" className="input !rounded-full !py-2.5 pl-10" />
        </div>
        <label className="sr-only" htmlFor="mealTime">
          Meal time
        </label>
        <select id="mealTime" value={mealTime} onChange={(e) => update({ mealTime: e.target.value })} className="input !w-auto !rounded-full !py-2.5 pr-8 text-sm font-semibold">
          <option value="">Any time</option>
          {Object.entries(TIME_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <div className="flex items-center gap-2" role="group" aria-label="Price range">
          <input type="number" min="0" max="500" inputMode="decimal" value={minPrice} onChange={(e) => update({ minPrice: e.target.value })} placeholder="Min $" aria-label="Minimum price" className="input !w-24 !rounded-full !py-2.5 text-sm" />
          <span className="text-muted">to</span>
          <input type="number" min="0" max="500" inputMode="decimal" value={maxPrice} onChange={(e) => update({ maxPrice: e.target.value })} placeholder="Max $" aria-label="Maximum price" className="input !w-24 !rounded-full !py-2.5 text-sm" />
        </div>
        <label className="sr-only" htmlFor="sort">
          Sort
        </label>
        <select id="sort" value={sort} onChange={(e) => update({ sort: e.target.value === "newest" ? "" : e.target.value })} className="input !w-auto !rounded-full !py-2.5 pr-8 text-sm font-semibold">
          {SORTS.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        {filtered && (
          <button type="button" onClick={() => { setText(""); setParams(new URLSearchParams(), { replace: true }); }} className="inline-flex items-center gap-1 text-sm font-semibold text-brand hover:underline">
            <X className="h-3.5 w-3.5" /> Clear filters
          </button>
        )}
      </div>

      <div className="-mx-4 mt-5 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0" role="group" aria-label="Filter by dish type">
        <button type="button" aria-pressed={!type} onClick={() => update({ type: "" })} className={`btn btn-sm shrink-0 ${!type ? "btn-primary" : "btn-ghost"}`}>
          All
        </button>
        {Object.entries(TYPE_LABELS).map(([value, label]) => (
          <button key={value} type="button" aria-pressed={type === value} onClick={() => update({ type: type === value ? "" : value })} className={`btn btn-sm shrink-0 ${type === value ? "btn-primary" : "btn-ghost"}`}>
            {label}
          </button>
        ))}
      </div>

      {error ? (
        <div role="alert" className="card mt-10 grid place-items-center gap-4 p-10 text-center">
          <p className="text-muted">{error}</p>
          <button type="button" onClick={() => setAttempt((n) => n + 1)} className="btn btn-primary btn-sm">
            <RefreshCw className="h-3.5 w-3.5" /> Try again
          </button>
        </div>
      ) : !data ? (
        <div className="mt-8">
          <MealGridSkeleton />
        </div>
      ) : data.meals.length === 0 ? (
        <div className="card mt-10 grid place-items-center gap-3 p-12 text-center">
          <p className="text-lg font-bold">No dishes match that.</p>
          <p className="text-sm text-muted">Try other words or clear the filters.</p>
        </div>
      ) : (
        <>
          <p className="mt-6 text-sm font-semibold text-muted" aria-live="polite">
            {data.total.toLocaleString()} {data.total === 1 ? "dish" : "dishes"}
            {type ? ` in ${TYPE_LABELS[type] ?? type}` : ""}
            {q ? ` matching "${q}"` : ""}
          </p>
          <div className="mt-5">
            <MealGrid meals={data.meals} />
          </div>
          {data.pages > 1 && (
            <nav aria-label="Pagination" className="mt-12 flex items-center justify-center gap-3">
              <button type="button" disabled={page <= 1} onClick={() => go(page - 1)} className="btn btn-ghost btn-sm">
                <ChevronLeft className="h-4 w-4" /> Previous
              </button>
              <span className="text-sm text-muted tabular-nums">
                Page {data.page} of {data.pages}
              </span>
              <button type="button" disabled={page >= data.pages} onClick={() => go(page + 1)} className="btn btn-ghost btn-sm">
                Next <ChevronRight className="h-4 w-4" />
              </button>
            </nav>
          )}
        </>
      )}
      <p className="mt-10 text-center text-sm text-muted">
        Looking for what is next? <Link to="/upcoming" className="font-semibold text-brand underline underline-offset-2">See upcoming dishes</Link>
      </p>
    </div>
  );
}
