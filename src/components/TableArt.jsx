import { useEffect, useState } from "react";
import { Crown, Star } from "lucide-react";
import api from "../lib/api";
import { MealImage } from "./MealCard";

const spots = ["left-[8%] top-[16%]", "float-b left-[34%] top-[40%] z-10", "left-[58%] top-[14%]"];
const fallback = ["radial-gradient(circle at 35% 30%, #e3b55e, #94620f)", "radial-gradient(circle at 35% 30%, #4a6fa5, #1b2a41)", "radial-gradient(circle at 35% 30%, #c9a96b, #6b4a12)"];
const ring = "absolute aspect-square w-[34%] overflow-hidden rounded-full border-[6px] border-white/90 shadow-2xl";

/** A table of dishes for the sign-in screens, using photos of the most popular meals. Purely decorative. */
export default function TableArt({ className = "" }) {
  const [meals, setMeals] = useState(null);

  useEffect(() => {
    let cancelled = false;
    api
      .get("/meals/featured")
      .then((res) => !cancelled && setMeals(res.data.data.slice(0, 3)))
      .catch(() => !cancelled && setMeals([]));
    return () => {
      cancelled = true;
    };
  }, []);

  const photos = meals && meals.length === 3 ? meals : null;

  return (
    <div className={`grid-panel relative aspect-[5/4] overflow-hidden rounded-[28px] border border-line ${className}`} aria-hidden="true">
      {photos
        ? photos.map((m, i) => (
            <div key={m.id} className={`${ring} ${spots[i]}`}>
              <MealImage meal={m} eager className="h-full w-full" />
            </div>
          ))
        : fallback.map((tone, i) => <div key={tone} className={`${ring} ${spots[i]}`} style={{ background: tone }} />)}
      <div className="float-a absolute bottom-5 left-5 flex items-center gap-2 rounded-full bg-surface px-4 py-2 text-xs font-bold text-ink shadow-lg ring-1 ring-line">
        <Star className="h-3.5 w-3.5 fill-gold text-gold" /> Guest favorites
      </div>
      <div className="absolute bottom-5 right-5 hidden items-center gap-2 rounded-2xl bg-surface px-4 py-2.5 text-xs font-semibold text-muted shadow-lg ring-1 ring-line sm:flex">
        <Crown className="h-3.5 w-3.5 text-brand" /> Members dine better
      </div>
    </div>
  );
}
