import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { DISH_BY_ID } from "@/data/dishes";

interface CartState {
  lines: Record<string, number>;
  count: number;
  subtotal: number;
  add: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clear: () => void;
  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  checkoutOpen: boolean;
  setCheckoutOpen: (open: boolean) => void;
}

const CartContext = createContext<CartState | null>(null);
const STORAGE_KEY = "fc_cart";
export const LAST_ORDER_KEY = "fc_last_order";

function loadCart(): Record<string, number> {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}") as Record<string, number>;
    return Object.fromEntries(Object.entries(raw).filter(([id, q]) => DISH_BY_ID[id] && q > 0));
  } catch {
    return {};
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<Record<string, number>>(loadCart);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  }, [lines]);

  const add = useCallback((id: string) => setLines((l) => ({ ...l, [id]: Math.min((l[id] ?? 0) + 1, 20) })), []);
  const setQty = useCallback((id: string, qty: number) => setLines((l) => {
    const next = { ...l };
    if (qty <= 0) delete next[id];
    else next[id] = Math.min(qty, 20);
    return next;
  }), []);
  const clear = useCallback(() => setLines({}), []);

  const value = useMemo<CartState>(() => {
    const entries = Object.entries(lines);
    return {
      lines,
      count: entries.reduce((s, [, q]) => s + q, 0),
      subtotal: entries.reduce((s, [id, q]) => s + (DISH_BY_ID[id]?.price ?? 0) * q, 0),
      add,
      setQty,
      clear,
      cartOpen,
      setCartOpen,
      checkoutOpen,
      setCheckoutOpen,
    };
  }, [lines, add, setQty, clear, cartOpen, checkoutOpen]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartState {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
