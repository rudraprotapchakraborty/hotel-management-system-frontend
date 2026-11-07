import { Link } from "react-router-dom";

/** A serving cloche on a navy tile. */
export function LogoMark({ size = 34, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" className={className} aria-hidden="true" focusable="false">
      <rect width="48" height="48" rx="13" fill="#1b2a41" />
      <path d="M9 32a15 15 0 0 1 30 0z" fill="#e3b55e" />
      <rect x="6.5" y="32" width="35" height="3.6" rx="1.8" fill="#e3b55e" />
      <circle cx="24" cy="12.5" r="2.7" fill="#e3b55e" />
      <path d="M16 26.5a9 9 0 0 1 6-6.2" fill="none" stroke="#fff" strokeOpacity=".55" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export default function Brand({ className = "" }) {
  return (
    <Link to="/" aria-label="Hotel Dine home" className={`inline-flex w-fit items-center gap-2.5 ${className}`}>
      <LogoMark />
      <span className="whitespace-nowrap text-[20px] font-bold leading-none tracking-[-0.045em] text-ink sm:text-[22px]">
        Hotel<span className="accent text-[26px]">Dine</span>
      </span>
    </Link>
  );
}
