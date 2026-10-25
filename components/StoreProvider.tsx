"use client";

import { subscribeToasts } from "@/components/toast-bus";
import { lineTotal, type Offer } from "@/lib/pricing";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";

/** `price` is the unit price; `offers` (products only) lets the line total use quantity deals. */
export type CartLine = { kind: "product" | "bundle"; id: string; slug: string; name: string; price: number; image?: string; qty: number; stock?: number; offers?: Offer[] };
export const MAX_LINE_QTY = 100;
const cap = (l: { qty: number; stock?: number }) => Math.max(1, Math.min(l.qty, MAX_LINE_QTY, l.stock ?? MAX_LINE_QTY));
export type Toast = { id: number; message: string; tone: "info" | "success" | "error" };
export type Sheet = "cart" | "search" | "menu" | null;

type Store = {
  cart: CartLine[];
  addToCart: (line: Omit<CartLine, "qty">, qty?: number, opts?: { openDrawer?: boolean }) => void;
  setQty: (kind: CartLine["kind"], id: string, qty: number) => void;
  clearCart: () => void;
  /** Re-check prices and stock with the server; fixes the cart and returns the names of lines that changed. */
  syncCart: () => Promise<string[]>;
  cartCount: number;
  subtotal: number;
  wishlist: string[];
  toggleWishlist: (id: string) => void;
  ready: boolean;
  sheet: Sheet;
  openSheet: (s: Exclude<Sheet, null>) => void;
  closeSheet: () => void;
  toasts: Toast[];
  toast: (message: string, tone?: Toast["tone"]) => void;
  dismissToast: (id: number) => void;
};

const Ctx = createContext<Store | null>(null);

function load<T>(key: string, fallback: T): T {
  try {
    return JSON.parse(localStorage.getItem(key) ?? "") as T;
  } catch {
    return fallback;
  }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartLine[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [ready, setReady] = useState(false);
  const [sheet, setSheet] = useState<Sheet>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastId = useRef(0);

  useEffect(() => {
    // Hydrate from localStorage after mount to avoid SSR mismatches.
    setCart(load("freshora_cart", []));
    setWishlist(load("freshora_wishlist", []));
    setReady(true);
  }, []);
  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem("freshora_cart", JSON.stringify(cart));
      localStorage.setItem("freshora_wishlist", JSON.stringify(wishlist));
    } catch {}
  }, [cart, wishlist, ready]);

  const toast = useCallback<Store["toast"]>((message, tone = "info") => {
    const id = ++toastId.current;
    setToasts((t) => [...t.slice(-2), { id, message, tone }]);
    // Errors stay longer so they can be read.
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), tone === "error" ? 6000 : 3500);
  }, []);
  const dismissToast = useCallback((id: number) => setToasts((t) => t.filter((x) => x.id !== id)), []);
  useEffect(() => subscribeToasts((m, tone) => toast(m, tone)), [toast]);

  const addToCart = useCallback<Store["addToCart"]>((line, qty = 1, opts) => {
    setCart((c) => {
      const i = c.findIndex((x) => x.kind === line.kind && x.id === line.id);
      if (i === -1) return [...c, { ...line, qty: cap({ qty, stock: line.stock }) }];
      return c.map((x, j) => (j === i ? { ...x, price: line.price, offers: line.offers ?? x.offers, stock: line.stock ?? x.stock, qty: cap({ qty: x.qty + qty, stock: line.stock ?? x.stock }) } : x));
    });
    if (opts?.openDrawer !== false) setSheet("cart");
  }, []);
  const setQty = useCallback<Store["setQty"]>((kind, id, qty) => {
    setCart((c) => (qty <= 0 ? c.filter((x) => !(x.kind === kind && x.id === id)) : c.map((x) => (x.kind === kind && x.id === id ? { ...x, qty: cap({ qty, stock: x.stock }) } : x))));
  }, []);

  const cartRef = useRef(cart);
  useEffect(() => {
    cartRef.current = cart;
  }, [cart]);
  const syncing = useRef<Promise<string[]> | null>(null);
  const syncCart = useCallback<Store["syncCart"]>(() => {
    if (syncing.current) return syncing.current;
    const snapshot = cartRef.current;
    if (snapshot.length === 0) return Promise.resolve([]);
    const run = (async () => {
      try {
        const res = await fetch("/api/cart/check", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ items: snapshot.map((l) => ({ kind: l.kind, id: l.id })) }) });
        if (!res.ok) return [];
        const { lines } = (await res.json()) as { lines: { kind: CartLine["kind"]; id: string; available: boolean; price: number; stock: number; offers?: Offer[] }[] };
        const find = (l: CartLine) => lines.find((x) => x.kind === l.kind && x.id === l.id);
        const changed: string[] = [];
        for (const l of snapshot) {
          const x = find(l);
          if (!x) continue;
          if (!x.available) changed.push(`${l.name} is no longer available and was removed`);
          else if (cap({ qty: l.qty, stock: x.stock }) !== l.qty) changed.push(`Only ${x.stock} of ${l.name} in stock`);
          else if (x.price !== l.price) changed.push(`${l.name} price changed to Rs. ${Math.round(x.price).toLocaleString("en-PK")}`);
        }
        setCart((c) =>
          c.flatMap((l) => {
            const x = find(l);
            if (!x) return [l];
            if (!x.available) return [];
            return [{ ...l, price: x.price, offers: x.offers ?? l.offers, stock: x.stock, qty: cap({ qty: l.qty, stock: x.stock }) }];
          })
        );
        return changed;
      } catch {
        return []; // offline: keep what we have, the server re-checks at checkout anyway
      } finally {
        syncing.current = null;
      }
    })();
    syncing.current = run;
    return run;
  }, []);

  // Refresh prices/stock once the saved cart has loaded, and whenever the cart drawer opens.
  const firstSync = useRef(false);
  useEffect(() => {
    if (!ready) return;
    if (!firstSync.current || sheet === "cart") {
      firstSync.current = true;
      syncCart().then((msgs) => msgs.slice(0, 2).forEach((m) => toast(m, "info")));
    }
  }, [ready, sheet, syncCart, toast]);
  const clearCart = useCallback(() => setCart([]), []);
  const toggleWishlist = useCallback(
    (id: string) => {
      const has = wishlist.includes(id);
      setWishlist(has ? wishlist.filter((x) => x !== id) : [...wishlist, id]);
      toast(has ? "Removed from wishlist" : "Saved to wishlist", "success");
    },
    [wishlist, toast]
  );
  const openSheet = useCallback((s: Exclude<Sheet, null>) => setSheet(s), []);
  const closeSheet = useCallback(() => setSheet(null), []);

  const value = useMemo<Store>(
    () => ({
      cart,
      addToCart,
      setQty,
      clearCart,
      syncCart,
      cartCount: cart.reduce((n, l) => n + l.qty, 0),
      subtotal: cart.reduce((n, l) => n + lineTotal(l), 0),
      wishlist,
      toggleWishlist,
      ready,
      sheet,
      openSheet,
      closeSheet,
      toasts,
      toast,
      dismissToast,
    }),
    [cart, wishlist, ready, sheet, toasts, addToCart, setQty, clearCart, syncCart, toggleWishlist, openSheet, closeSheet, toast, dismissToast]
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const s = useContext(Ctx);
  if (!s) throw new Error("useStore must be used within StoreProvider");
  return s;
}
