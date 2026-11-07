import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, ChefHat, Crown, Search, Sparkles, Star, UtensilsCrossed } from "lucide-react";
import api from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { TYPE_LABELS } from "../lib/format";
import { MealGrid, MealGridSkeleton, MealImage } from "../components/MealCard";
import PlanCard, { PlanGridSkeleton } from "../components/PlanCard";
import { Stars } from "../components/Stars";

const steps = [
  [UtensilsCrossed, "Browse the menu", "Search by dish, meal time or price. Every dish shows its chef, ingredients and what guests thought."],
  [ChefHat, "Order or request", "Add dishes to your cart and pay by card, or ask the kitchen to prepare something specific."],
  [Crown, "Join a plan", "Upgrade your tier to like and vote on upcoming dishes before they reach the menu."],
];

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [featured, setFeatured] = useState(null);
  const [types, setTypes] = useState([]);
  const [plans, setPlans] = useState(null);
  const [testimonials, setTestimonials] = useState([]);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get("/meals/featured").then((r) => setFeatured(r.data.data)).catch(() => setFeatured([]));
    api.get("/meals/types").then((r) => setTypes(r.data.data)).catch(() => {});
    api.get("/public/plans").then((r) => setPlans(r.data.data)).catch(() => setPlans([]));
    api.get("/reviews/testimonials").then((r) => setTestimonials(r.data.data)).catch(() => {});
    api.get("/public/stats").then((r) => setStats(r.data.data)).catch(() => {});
  }, []);

  const search = (e) => {
    e.preventDefault();
    navigate(query.trim() ? `/meals?q=${encodeURIComponent(query.trim())}` : "/meals");
  };

  const hero = (featured ?? []).slice(0, 3);

  return (
    <>
      <section className="frame grid items-center gap-12 pb-16 pt-12 lg:grid-cols-[1.1fr_1fr] lg:gap-16 lg:pt-20">
        <div className="hero-stagger">
          <span className="eyeline">Hotel management system</span>
          <h1 className="display mt-5 text-[clamp(42px,6.4vw,84px)]">
            Dining worth <span className="accent">staying</span> for.
          </h1>
          <p className="mt-6 max-w-[520px] text-[17px] leading-relaxed text-muted">
            Browse the hotel menu, preview dishes before they launch, order in a few taps and join a plan for members-only perks.
          </p>
          <form onSubmit={search} className="mt-8 flex max-w-[520px] items-center gap-2 rounded-full border border-line bg-surface p-1.5 shadow-[var(--shadow)] focus-within:border-brand">
            <Search className="ml-3 h-5 w-5 shrink-0 text-muted" />
            <label className="sr-only" htmlFor="hero-search">
              Search the menu
            </label>
            <input id="hero-search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Pizza, pancakes, tiramisu..." className="min-w-0 flex-1 bg-transparent px-1 py-2.5 text-[15px] outline-none placeholder:text-muted/70" />
            <button type="submit" className="btn btn-primary btn-sm">
              Search
            </button>
          </form>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link to="/meals" className="btn btn-ink">
              Explore the menu <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/membership" className="btn btn-ghost">
              See plans
            </Link>
            {!user && (
              <Link to="/login" className="btn btn-ghost">
                Try a test account
              </Link>
            )}
          </div>
          {stats && stats.meals > 0 && (
            <dl className="mt-10 flex flex-wrap gap-x-9 gap-y-4">
              {[
                ["Dishes on the menu", stats.meals],
                ["Coming soon", stats.upcoming],
                ["Members", stats.members],
              ].map(([label, value]) => (
                <div key={label}>
                  <dd className="text-3xl font-bold tracking-tight tabular-nums">{value.toLocaleString()}</dd>
                  <dt className="text-xs font-semibold uppercase tracking-wider text-muted">{label}</dt>
                </div>
              ))}
            </dl>
          )}
        </div>

        <div className="grid-panel relative mx-auto aspect-[5/4] w-full max-w-[560px] overflow-hidden rounded-[28px] border border-line" aria-hidden={hero.length === 0}>
          {hero.length === 3 ? (
            hero.map((m, i) => (
              <Link
                key={m.id}
                to={`/meals/${m.id}`}
                tabIndex={i === 1 ? 0 : -1}
                aria-label={m.name}
                className={`absolute aspect-square w-[34%] overflow-hidden rounded-full border-[6px] border-surface shadow-2xl transition hover:z-20 hover:scale-105 ${["left-[8%] top-[16%]", "float-b left-[34%] top-[40%] z-10", "left-[58%] top-[14%]"][i]}`}
              >
                <MealImage meal={m} eager className="h-full w-full" />
              </Link>
            ))
          ) : (
            <div className="grid h-full place-items-center">
              <UtensilsCrossed className="h-10 w-10 text-brand/60" />
            </div>
          )}
          <div className="float-a absolute bottom-5 left-5 flex items-center gap-2 rounded-full bg-surface px-4 py-2 text-xs font-bold text-ink shadow-lg ring-1 ring-line">
            <Star className="h-3.5 w-3.5 fill-gold text-gold" /> Most loved by guests
          </div>
        </div>
      </section>

      <section className="border-t border-line py-16" data-reveal>
        <div className="frame">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="eyeline">Guest favorites</span>
              <h2 className="display mt-4 text-[clamp(28px,4vw,46px)]">
                The <span className="accent">most-liked</span> dishes
              </h2>
            </div>
            <Link to="/meals?sort=popular" className="btn btn-ghost btn-sm">
              See all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="mt-8">{featured === null ? <MealGridSkeleton count={4} /> : <MealGrid meals={featured} />}</div>
        </div>
      </section>

      {types.length > 0 && (
        <section className="pb-16" data-reveal>
          <div className="frame">
            <span className="eyeline">Browse</span>
            <h2 className="display mt-4 text-[clamp(28px,4vw,46px)]">
              What are you in the <span className="accent">mood</span> for?
            </h2>
            <ul className="mt-8 flex flex-wrap gap-2.5">
              {types.map((t) => (
                <li key={t.type}>
                  <Link to={`/meals?type=${t.type}`} className="btn btn-ghost btn-sm">
                    {TYPE_LABELS[t.type] ?? t.type} <span className="text-muted">{t.count}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <section id="how" className="border-t border-line bg-surface/40 py-20" data-reveal>
        <div className="frame">
          <span className="eyeline">How it works</span>
          <h2 className="display mt-4 max-w-[640px] text-[clamp(30px,4.4vw,52px)]">
            From the menu to your <span className="accent">table</span>.
          </h2>
          <ol className="mt-12 grid gap-5 md:grid-cols-3">
            {steps.map(([Icon, title, text], i) => (
              <li key={title} className="card p-7 transition-all hover:-translate-y-1 hover:border-brand hover:shadow-[var(--shadow)]">
                <div className="flex items-center justify-between">
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-soft text-brand">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="font-serif text-5xl italic leading-none text-brand/40">{i + 1}</span>
                </div>
                <h3 className="mt-5 text-lg font-bold tracking-tight">{title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-muted">{text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="py-20" data-reveal>
        <div className="frame">
          <span className="eyeline">Membership</span>
          <h2 className="display mt-4 max-w-[640px] text-[clamp(30px,4.4vw,52px)]">
            Pick the <span className="accent">plan</span> that suits you.
          </h2>
          <div className="mt-10 pt-3">
            {plans === null ? (
              <PlanGridSkeleton />
            ) : (
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                {plans.map((p) => (
                  <PlanCard key={p.id} plan={p} highlight={p.badge === "gold"} />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {testimonials.length > 0 && (
        <section className="border-t border-line bg-surface/40 py-20" data-reveal>
          <div className="frame">
            <span className="eyeline">Guest book</span>
            <h2 className="display mt-4 text-[clamp(30px,4.4vw,52px)]">
              What guests <span className="accent">say</span>
            </h2>
            <ul className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {testimonials.map((t) => (
                <li key={t.id} className="card p-6">
                  <Stars value={t.rating} />
                  <p className="mt-4 text-[15px] leading-relaxed">&ldquo;{t.details}&rdquo;</p>
                  <p className="mt-4 text-sm font-bold">{t.name}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <section className="frame py-20" data-reveal>
        <div className="grid-panel rounded-[32px] border border-line px-6 py-14 text-center sm:px-12">
          <Sparkles className="mx-auto h-7 w-7 text-brand" />
          <h2 className="display mx-auto mt-4 max-w-[640px] text-[clamp(30px,4vw,48px)]">
            A table is <span className="accent">waiting</span>.
          </h2>
          <p className="mx-auto mt-4 max-w-[480px] text-muted">Create a free account to like dishes, write reviews and order from the menu.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to={user ? "/meals" : "/register"} className="btn btn-primary">
              {user ? "Order now" : "Create an account"} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
