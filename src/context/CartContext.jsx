import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api, { getErrorMessage } from "../lib/api";
import { useAuth } from "./AuthContext";

const CartContext = createContext(null);

/** The signed-in person's cart, shared by the navbar badge, the menu and the checkout page. */
export function CartProvider({ children }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [cart, setCart] = useState({ items: [], total: 0 });
  const [loaded, setLoaded] = useState(false);

  const refresh = useCallback(async () => {
    if (!user) {
      setCart({ items: [], total: 0 });
      setLoaded(true);
      return;
    }
    try {
      const res = await api.get("/cart");
      setCart(res.data.data);
    } catch {
      /* the badge simply stays as it was */
    }
    setLoaded(true);
  }, [user]);

  useEffect(() => {
    setLoaded(false);
    refresh();
  }, [refresh]);

  /** Adds a meal or plan. Signed-out visitors are sent to sign in first. */
  const add = useCallback(
    async (kind, refId, label) => {
      if (!user) {
        navigate(`/login?from=${encodeURIComponent(location.pathname + location.search)}`);
        return false;
      }
      try {
        const res = await api.post("/cart", { kind, refId });
        setCart(res.data.data);
        toast.success(label ? `${label} added to your cart` : "Added to your cart");
        return true;
      } catch (err) {
        toast.error(getErrorMessage(err, "Could not add that to your cart."));
        return false;
      }
    },
    [user, navigate, location]
  );

  const remove = useCallback(async (itemId) => {
    try {
      const res = await api.delete(`/cart/${itemId}`);
      setCart(res.data.data);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }, []);

  const value = useMemo(
    () => ({ ...cart, count: cart.items.length, loaded, add, remove, refresh, has: (kind, ref) => cart.items.some((i) => i.kind === kind && i.ref === ref) }),
    [cart, loaded, add, remove, refresh]
  );
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
};
