import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ImageOff, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import api, { getErrorMessage } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import { TIME_LABELS, TYPE_LABELS } from "../../lib/format";
import { Field } from "../../components/auth/Field";
import { FormMessage } from "../../components/auth/AuthShell";
import NotFound from "../NotFound";

const empty = { name: "", description: "", type: "", mealTime: "", price: "", chef: "", image: "", ingredients: "", upcoming: false };

/** Add a meal, or edit one when an :id is in the address. */
export default function MealForm() {
  const { id } = useParams();
  const editing = Boolean(id);
  const navigate = useNavigate();
  const { user } = useAuth();
  const [form, setForm] = useState(empty);
  const [state, setState] = useState(editing ? "loading" : "ready"); // loading | ready | missing
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [imageFailed, setImageFailed] = useState(false);

  const set = (key) => (value) => setForm((f) => ({ ...f, [key]: value }));

  useEffect(() => {
    if (!editing) return;
    let cancelled = false;
    api
      .get(`/meals/${id}`)
      .then((res) => {
        if (cancelled) return;
        const m = res.data.data;
        setForm({ name: m.name, description: m.description, type: m.type, mealTime: m.mealTime, price: m.price, chef: m.chef, image: m.image, ingredients: m.ingredients.join(", "), upcoming: m.upcoming });
        setState("ready");
      })
      .catch(() => !cancelled && setState("missing"));
    return () => {
      cancelled = true;
    };
  }, [id, editing]);

  useEffect(() => setImageFailed(false), [form.image]);

  if (state === "missing") return <NotFound />;
  if (state === "loading") return <div className="skeleton h-[480px]" role="status" aria-label="Loading" />;

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!form.type || !form.mealTime) return setError("Please choose a dish type and a meal time.");
    setSaving(true);
    try {
      const body = {
        name: form.name.trim(),
        description: form.description.trim(),
        type: form.type,
        mealTime: form.mealTime,
        price: Number(form.price),
        chef: form.chef.trim(),
        image: form.image.trim(),
        ingredients: form.ingredients.split(",").map((s) => s.trim()).filter(Boolean),
        upcoming: form.upcoming,
      };
      const res = editing ? await api.patch(`/meals/${id}`, body) : await api.post("/meals", body);
      toast.success(editing ? "Meal updated" : "Meal added");
      navigate(`/meals/${res.data.data.id}`, { replace: true });
    } catch (err) {
      setError(getErrorMessage(err, "Could not save the meal."));
      setSaving(false);
    }
  };

  const showImage = form.image && !imageFailed;

  return (
    <>
      <Link to="/dashboard/admin/meals" className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-ink">
        <ArrowLeft className="h-4 w-4" /> Back to meals
      </Link>
      <h1 className="display mt-4 text-[clamp(28px,3.6vw,42px)]">
        {editing ? "Edit " : "Add a "}
        <span className="accent">meal</span>
      </h1>
      {user?.isDemo && !editing && (
        <p role="note" className="mt-4 rounded-2xl border border-brand/25 bg-brand-soft p-3.5 text-sm">
          <b>Test admin.</b> You can add up to 10 meals of your own and edit or delete those, but not the sample menu.
        </p>
      )}

      <form onSubmit={submit} className="mt-8 grid gap-10 xl:grid-cols-[1fr_320px]">
        <div className="space-y-5">
          <FormMessage error={error} />
          <Field label="Name" value={form.name} onChange={set("name")} required minLength={2} maxLength={80} placeholder="Truffle mushroom risotto" />

          <div className="space-y-1.5">
            <label htmlFor="description" className="flex justify-between text-sm font-semibold">
              Description <span className="font-normal text-muted tabular-nums">{form.description.length}/600</span>
            </label>
            <textarea id="description" value={form.description} onChange={(e) => set("description")(e.target.value)} required minLength={10} maxLength={600} rows={4} className="input resize-y" />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label htmlFor="type" className="text-sm font-semibold">
                Dish type
              </label>
              <select id="type" value={form.type} onChange={(e) => set("type")(e.target.value)} required className="input">
                <option value="" disabled>
                  Choose a type
                </option>
                {Object.entries(TYPE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label htmlFor="mealTime" className="text-sm font-semibold">
                Meal time
              </label>
              <select id="mealTime" value={form.mealTime} onChange={(e) => set("mealTime")(e.target.value)} required className="input">
                <option value="" disabled>
                  Choose a time
                </option>
                {Object.entries(TIME_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Price (USD)" type="number" value={String(form.price)} onChange={set("price")} required min={0.5} max={500} step="0.01" placeholder="12.50" />
            <Field label="Chef or kitchen" value={form.chef} onChange={set("chef")} required minLength={2} maxLength={60} placeholder="Napoli Oven" />
          </div>

          <Field label="Ingredients" value={form.ingredients} onChange={set("ingredients")} hint="Separate with commas." placeholder="Arborio rice, Mushrooms, Parmesan" />
          <Field label="Photo link" type="url" value={form.image} onChange={set("image")} required maxLength={800} placeholder="https://example.com/dish.jpg" hint="A direct link to an image (JPG, PNG or WebP)." />

          <label className="flex items-center gap-3 text-sm font-semibold">
            <input type="checkbox" checked={form.upcoming} onChange={(e) => set("upcoming")(e.target.checked)} className="h-4 w-4 accent-[var(--brand)]" />
            Upcoming dish (announced, but not orderable until published)
          </label>

          <div className="flex gap-3 pt-1">
            <button type="submit" disabled={saving} className="btn btn-primary">
              {saving && <Loader2 className="h-4 w-4 animate-spin" />} {editing ? "Save changes" : "Add meal"}
            </button>
            <Link to="/dashboard/admin/meals" className="btn btn-ghost">
              Cancel
            </Link>
          </div>
        </div>

        <aside aria-label="Photo preview" className="order-first xl:order-none">
          <p className="mb-2 text-sm font-semibold">Preview</p>
          <div className="relative aspect-[4/3] w-full max-w-[360px] overflow-hidden rounded-2xl border border-line bg-brand-soft shadow-[var(--shadow)]">
            {showImage ? (
              <img src={form.image} alt="Photo preview" referrerPolicy="no-referrer" onError={() => setImageFailed(true)} className="h-full w-full object-cover" />
            ) : (
              <div className="absolute inset-0 grid place-items-center gap-2 p-6 text-center text-sm text-muted">
                <ImageOff className="h-8 w-8" />
                {form.image ? "That link does not load as an image." : "Paste a photo link to see it here."}
              </div>
            )}
          </div>
        </aside>
      </form>
    </>
  );
}
