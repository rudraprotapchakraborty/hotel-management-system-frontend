import { Link } from "react-router-dom";
import Brand from "./Brand";

export default function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="frame flex flex-col items-start justify-between gap-5 py-9 sm:flex-row sm:items-center">
        <Brand />
        <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold text-muted">
          <Link to="/meals" className="hover:text-ink">Menu</Link>
          <Link to="/membership" className="hover:text-ink">Membership</Link>
          <Link to="/privacy" className="hover:text-ink">Privacy</Link>
          <Link to="/terms" className="hover:text-ink">Terms</Link>
          <a href="https://github.com/rudraprotapchakraborty/hotel-management-system-frontend" className="hover:text-ink">GitHub</a>
        </nav>
        <small className="max-w-[320px] text-muted">
          © {new Date().getFullYear()} Hotel Dine. Sample dish photos come from{" "}
          <a href="https://www.wikipedia.org/" className="underline underline-offset-2 hover:text-ink">Wikipedia</a> and Wikimedia Commons under their free licences.
        </small>
      </div>
    </footer>
  );
}
