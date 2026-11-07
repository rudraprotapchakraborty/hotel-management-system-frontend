import { useState } from "react";
import { Star } from "lucide-react";

/** Read-only stars, with fractions rounded to the nearest half for the fill. */
export function Stars({ value, size = 16, className = "" }) {
  const rounded = Math.round((value ?? 0) * 2) / 2;
  return (
    <span className={`inline-flex items-center gap-0.5 ${className}`} role="img" aria-label={value ? `Rated ${value} out of 5` : "Not rated yet"}>
      {[1, 2, 3, 4, 5].map((i) => {
        const full = rounded >= i;
        const half = !full && rounded >= i - 0.5;
        return (
          <span key={i} className="relative inline-block" style={{ width: size, height: size }}>
            <Star width={size} height={size} className="absolute inset-0 text-line" />
            <span className="absolute inset-0 overflow-hidden" style={{ width: full ? "100%" : half ? "50%" : "0%" }}>
              <Star width={size} height={size} className="fill-gold text-gold" />
            </span>
          </span>
        );
      })}
    </span>
  );
}

/** Pick a rating from 1 to 5. */
export function StarInput({ value, onChange, size = 28 }) {
  const [hover, setHover] = useState(0);
  const shown = hover || value;
  return (
    <div role="radiogroup" aria-label="Your rating" className="inline-flex gap-1" onMouseLeave={() => setHover(0)}>
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          role="radio"
          aria-checked={value === i}
          aria-label={`${i} ${i === 1 ? "star" : "stars"}`}
          onMouseEnter={() => setHover(i)}
          onClick={() => onChange(i)}
          className="rounded p-0.5 transition-transform hover:scale-110"
        >
          <Star width={size} height={size} className={i <= shown ? "fill-gold text-gold" : "text-line"} />
        </button>
      ))}
    </div>
  );
}
