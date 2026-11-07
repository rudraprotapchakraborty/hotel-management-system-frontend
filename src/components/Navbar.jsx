import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { ArrowUpRight, LogOut, Menu, ShoppingBag, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import Brand from "./Brand";
import Avatar from "./Avatar";
import ThemeToggle from "./ThemeToggle";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const { pathname } = useLocation();
  const [menuAt, setMenuAt] = useState(null);
  const headerRef = useRef(null);
  // The menu closes on navigation because it remembers the page it was opened on
  const open = menuAt === pathname;
  const close = () => setMenuAt(null);

  const links = [["/", "Home"], ["/meals", "Menu"], ["/upcoming", "Upcoming"], ["/membership", "Membership"], ...(user ? [["/dashboard", "Dashboard"]] : [])];

  // Escape or a tap outside the header closes the phone menu
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && close();
    const onPointer = (e) => headerRef.current && !headerRef.current.contains(e.target) && close();
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [open]);

  const linkClass = ({ isActive }) =>
    `rounded-full px-3.5 py-2 text-sm font-semibold transition-colors ${
      isActive ? "bg-brand-soft text-brand" : "text-muted hover:text-ink"
    }`;

  return (
    <header
      ref={headerRef}
      className="sticky top-0 z-30 border-b border-line bg-paper/85 backdrop-blur-md"
    >
      <div className="frame flex min-h-[68px] items-center justify-between gap-4">
        <Brand />

        <nav aria-label="Main navigation" className="hidden items-center gap-1 md:flex">
          {links.map(([to, label]) =>
            to.includes("#") ? (
              <a key={to} href={to} className="rounded-full px-3.5 py-2 text-sm font-semibold text-muted transition-colors hover:text-ink">
                {label}
              </a>
            ) : (
              <NavLink key={to} to={to} end={to === "/" || to === "/meals"} className={linkClass}>
                {label}
              </NavLink>
            )
          )}
        </nav>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <ThemeToggle />
          {user && (
            <Link to="/dashboard/cart" aria-label={`Cart, ${count} ${count === 1 ? "item" : "items"}`} className="relative grid h-10 w-10 place-items-center rounded-full text-muted transition-colors hover:bg-line hover:text-ink">
              <ShoppingBag className="h-[18px] w-[18px]" />
              {count > 0 && <span className="absolute -right-0.5 -top-0.5 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-brand px-1 text-[10px] font-bold text-on-brand">{count}</span>}
            </Link>
          )}
          {user ? (
            <>
              <Link to="/settings" aria-label="Account settings" title="Account settings" className="rounded-full">
                <Avatar name={user.fullName} url={user.profileImageUrl} size={34} />
              </Link>
              <button type="button" onClick={logout} className="btn btn-ghost btn-sm hidden md:inline-flex">
                <LogOut className="h-3.5 w-3.5" /> Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="hidden px-3 text-sm font-semibold text-ink hover:text-brand md:block">
                Log in
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm hidden md:inline-flex">
                Get started <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </>
          )}
          <button
            type="button"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label="Toggle menu"
            onClick={() => setMenuAt(open ? null : pathname)}
            className="grid h-10 w-10 place-items-center rounded-full text-ink transition-colors hover:bg-line md:hidden"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <nav id="mobile-nav" aria-label="Mobile navigation" className="site-nav-panel border-t border-line bg-paper md:hidden">
          <div className="frame grid gap-1 py-3">
            {links.map(([to, label]) =>
              to.includes("#") ? (
                <a key={to} href={to} onClick={close} className="border-b border-line py-4 text-[17px] font-semibold text-ink">
                  {label}
                </a>
              ) : (
                <NavLink
                  key={to}
                  to={to}
                  end={to === "/" || to === "/meals"}
                  onClick={close}
                  className={({ isActive }) =>
                    `border-b border-line py-4 text-[17px] font-semibold ${isActive ? "text-brand" : "text-ink"}`
                  }
                >
                  {label}
                </NavLink>
              )
            )}
            <div className="grid grid-cols-2 gap-3 pt-4">
              {user ? (
                <>
                  <Link to="/dashboard" onClick={close} className="btn btn-primary">
                    Dashboard <ArrowUpRight className="h-4 w-4" />
                  </Link>
                  <button type="button" onClick={() => { close(); logout(); }} className="btn btn-ghost">
                    <LogOut className="h-4 w-4" /> Log out
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={close} className="btn btn-ghost">
                    Log in
                  </Link>
                  <Link to="/register" onClick={close} className="btn btn-primary">
                    Get started
                  </Link>
                </>
              )}
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}
