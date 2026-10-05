import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { cartTotal, type CartLine, type Product } from "./menu";

interface CartContextValue {
  lines: CartLine[];
  note: string;
  count: number;
  total: number;
  open: boolean;
  setOpen: (v: boolean) => void;
  add: (p: Product, qty?: number) => void;
  setQuantity: (productId: string, qty: number) => void;
  remove: (productId: string) => void;
  setNote: (n: string) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);
const KEY = "koruja-cart-v1";

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [note, setNote] = useState("");
  const [open, setOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as { lines?: CartLine[]; note?: string };
        if (Array.isArray(parsed.lines)) setLines(parsed.lines);
        if (typeof parsed.note === "string") setNote(parsed.note);
      }
    } catch {
      /* ignore corrupt storage */
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) localStorage.setItem(KEY, JSON.stringify({ lines, note }));
  }, [lines, note, loaded]);

  const add = useCallback((p: Product, qty = 1) => {
    setLines((prev) => {
      const found = prev.find((l) => l.productId === p.id);
      if (found) return prev.map((l) => (l.productId === p.id ? { ...l, quantity: l.quantity + qty } : l));
      return [...prev, { productId: p.id, name: p.name, price: Number(p.price), quantity: qty }];
    });
  }, []);

  const setQuantity = useCallback((productId: string, qty: number) => {
    setLines((prev) =>
      qty <= 0 ? prev.filter((l) => l.productId !== productId) : prev.map((l) => (l.productId === productId ? { ...l, quantity: qty } : l)),
    );
  }, []);

  const remove = useCallback((productId: string) => setLines((prev) => prev.filter((l) => l.productId !== productId)), []);
  const clear = useCallback(() => {
    setLines([]);
    setNote("");
  }, []);

  const value = useMemo<CartContextValue>(
    () => ({
      lines, note, open, setOpen, add, setQuantity, remove, setNote, clear,
      count: lines.reduce((a, l) => a + l.quantity, 0),
      total: cartTotal(lines),
    }),
    [lines, note, open, add, setQuantity, remove, clear],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
