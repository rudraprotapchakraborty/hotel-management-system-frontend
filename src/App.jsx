import { Suspense, lazy, useEffect } from "react";
import { Navigate, Route, Routes, useLocation, useParams } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { GuestOnly, Protected } from "./components/RouteGuards";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";

const Meals = lazy(() => import("./pages/Meals"));
const MealDetails = lazy(() => import("./pages/MealDetails"));
const Upcoming = lazy(() => import("./pages/Upcoming"));
const Membership = lazy(() => import("./pages/Membership"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const VerifyEmail = lazy(() => import("./pages/VerifyEmail"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const Settings = lazy(() => import("./pages/Settings"));
const Legal = lazy(() => import("./pages/Legal"));
const DashboardLayout = lazy(() => import("./pages/dashboard/DashboardLayout"));
const Overview = lazy(() => import("./pages/dashboard/Overview"));
const Cart = lazy(() => import("./pages/dashboard/Cart"));
const Payments = lazy(() => import("./pages/dashboard/Payments"));
const MyReviews = lazy(() => import("./pages/dashboard/MyReviews"));
const MyRequests = lazy(() => import("./pages/dashboard/MyRequests"));
const AdminMeals = lazy(() => import("./pages/dashboard/AdminMeals"));
const MealForm = lazy(() => import("./pages/dashboard/MealForm"));
const AdminRequests = lazy(() => import("./pages/dashboard/AdminRequests"));
const AdminUsers = lazy(() => import("./pages/dashboard/AdminUsers"));
const AdminPayments = lazy(() => import("./pages/dashboard/AdminPayments"));

const AUTH_PATHS = /^\/(login|register|verify-email|forgot-password)$/;

const Loading = () => (
  <div role="status" className="frame grid gap-4 py-12">
    <span className="sr-only">Loading…</span>
    <div className="skeleton" style={{ height: 38, width: "38%" }} />
    <div className="skeleton" style={{ height: 150 }} />
    <div className="skeleton" style={{ height: 90, width: "70%" }} />
  </div>
);

// Addresses from the first version of the site keep working
const OldMealDetails = () => <Navigate to={`/meals/${useParams().id}`} replace />;
const OldUpdateItem = () => <Navigate to={`/dashboard/admin/meals/${useParams().id}/edit`} replace />;

/** Admin-only pages inside the dashboard. */
const AdminOnly = ({ children }) => <Protected role="ADMIN">{children}</Protected>;

export default function App() {
  const { pathname, hash } = useLocation();
  const bare = AUTH_PATHS.test(pathname); // auth screens bring their own header
  // The dashboard keeps its sidebar while pages change, so only its content fades in
  const pageKey = pathname.startsWith("/dashboard") ? "dashboard" : pathname;

  // Fade sections in as they scroll into view. Sections that only appear once their
  // data has loaded are picked up as they are added to the page.
  useEffect(() => {
    document.documentElement.classList.add("js");
    const pending = () => document.querySelectorAll("[data-reveal]:not(.in-view)");
    if (!("IntersectionObserver" in window)) {
      pending().forEach((el) => el.classList.add("in-view"));
      return;
    }
    const seen = new WeakSet();
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            io.unobserve(entry.target);
          }
        }),
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
    );
    const watch = () =>
      pending().forEach((el) => {
        if (!seen.has(el)) {
          seen.add(el);
          io.observe(el);
        }
      });
    watch();
    const mo = new MutationObserver(watch);
    mo.observe(document.getElementById("root"), { childList: true, subtree: true });
    return () => {
      mo.disconnect();
      io.disconnect();
    };
  }, [pathname]);

  // New pages start at the top; "/#how" style links scroll to their section
  useEffect(() => {
    if (hash) {
      const target = document.querySelector(hash);
      if (target) {
        target.scrollIntoView({ behavior: "smooth" });
        return;
      }
    }
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname, hash]);

  return (
    <div className="flex min-h-screen flex-col">
      {!bare && <Navbar />}
      <main className="flex-1">
        <Suspense fallback={<Loading />}>
          <div key={pageKey} className="page-enter">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/meals" element={<Meals />} />
              <Route path="/meals/:id" element={<MealDetails />} />
              <Route path="/upcoming" element={<Upcoming />} />
              <Route path="/membership" element={<Membership />} />
              <Route path="/login" element={<GuestOnly><Login /></GuestOnly>} />
              <Route path="/register" element={<GuestOnly><Register /></GuestOnly>} />
              <Route path="/verify-email" element={<GuestOnly><VerifyEmail /></GuestOnly>} />
              <Route path="/forgot-password" element={<GuestOnly><ForgotPassword /></GuestOnly>} />
              <Route path="/settings" element={<Protected><Settings /></Protected>} />
              <Route path="/dashboard" element={<Protected><DashboardLayout /></Protected>}>
                <Route index element={<Overview />} />
                <Route path="cart" element={<Cart />} />
                <Route path="payments" element={<Payments />} />
                <Route path="reviews" element={<MyReviews />} />
                <Route path="requests" element={<MyRequests />} />
                <Route path="admin/meals" element={<AdminOnly><AdminMeals /></AdminOnly>} />
                <Route path="admin/meals/new" element={<AdminOnly><MealForm /></AdminOnly>} />
                <Route path="admin/meals/:id/edit" element={<AdminOnly><MealForm /></AdminOnly>} />
                <Route path="admin/requests" element={<AdminOnly><AdminRequests /></AdminOnly>} />
                <Route path="admin/users" element={<AdminOnly><AdminUsers /></AdminOnly>} />
                <Route path="admin/payments" element={<AdminOnly><AdminPayments /></AdminOnly>} />
              </Route>
              <Route path="/privacy" element={<Legal page="privacy" />} />
              <Route path="/terms" element={<Legal page="terms" />} />
              {/* old addresses */}
              <Route path="/mealDetails/:id" element={<OldMealDetails />} />
              <Route path="/upcomingMeals" element={<Navigate to="/upcoming" replace />} />
              <Route path="/signup" element={<Navigate to="/register" replace />} />
              <Route path="/dashboard/userHome" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard/adminHome" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard/paymentHistory" element={<Navigate to="/dashboard/payments" replace />} />
              <Route path="/dashboard/myReviews" element={<Navigate to="/dashboard/reviews" replace />} />
              <Route path="/dashboard/requestedMeals" element={<Navigate to="/dashboard/requests" replace />} />
              <Route path="/dashboard/manageItems" element={<Navigate to="/dashboard/admin/meals" replace />} />
              <Route path="/dashboard/addItems" element={<Navigate to="/dashboard/admin/meals/new" replace />} />
              <Route path="/dashboard/updateItem/:id" element={<OldUpdateItem />} />
              <Route path="/dashboard/users" element={<Navigate to="/dashboard/admin/users" replace />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </Suspense>
      </main>
      {!bare && <Footer />}
      <Toaster
        position="top-right"
        toastOptions={{
          style: { background: "var(--surface)", color: "var(--ink)", border: "1px solid var(--line)", borderRadius: 14, fontSize: 14 },
        }}
      />
    </div>
  );
}
