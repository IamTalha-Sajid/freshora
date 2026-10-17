"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";

export type CartLine = { kind: "product" | "bundle"; id: string; slug: string; name: string; price: number; image?: string; qty: number };
export type Toast = { id: number; message: string; tone: "info" | "success" | "error" };
export type Sheet = "cart" | "search" | "menu" | null;

type Store = {
  cart: CartLine[];
  addToCart: (line: Omit<CartLine, "qty">, qty?: number, opts?: { openDrawer?: boolean }) => void;
  setQty: (kind: CartLine["kind"], id: string, qty: number) => void;
  clearCart: () => void;
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
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200);
  }, []);

  const addToCart = useCallback<Store["addToCart"]>((line, qty = 1, opts) => {
    setCart((c) => {
      const i = c.findIndex((x) => x.kind === line.kind && x.id === line.id);
      if (i === -1) return [...c, { ...line, qty }];
      return c.map((x, j) => (j === i ? { ...x, price: line.price, qty: x.qty + qty } : x));
    });
    if (opts?.openDrawer !== false) setSheet("cart");
  }, []);
  const setQty = useCallback<Store["setQty"]>((kind, id, qty) => {
    setCart((c) => (qty <= 0 ? c.filter((x) => !(x.kind === kind && x.id === id)) : c.map((x) => (x.kind === kind && x.id === id ? { ...x, qty } : x))));
  }, []);
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
      cartCount: cart.reduce((n, l) => n + l.qty, 0),
      subtotal: cart.reduce((n, l) => n + l.price * l.qty, 0),
      wishlist,
      toggleWishlist,
      ready,
      sheet,
      openSheet,
      closeSheet,
      toasts,
      toast,
    }),
    [cart, wishlist, ready, sheet, toasts, addToCart, setQty, clearCart, toggleWishlist, openSheet, closeSheet, toast]
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const s = useContext(Ctx);
  if (!s) throw new Error("useStore must be used within StoreProvider");
  return s;
}
