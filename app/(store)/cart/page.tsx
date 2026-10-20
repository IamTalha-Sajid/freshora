"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Icon } from "@/components/Icon";
import { MAX_LINE_QTY, useStore } from "@/components/StoreProvider";
import { formatPKR } from "@/lib/pricing";

export default function CartPage() {
  const { cart, setQty, subtotal, ready, syncCart, toast } = useStore();
  useEffect(() => {
    if (ready) syncCart().then((msgs) => msgs.slice(0, 3).forEach((m) => toast(m, "info")));
  }, [ready, syncCart, toast]);
  if (!ready)
    return (
      <div className="container-x max-w-4xl py-8" aria-busy="true" aria-label="Loading cart">
        <div className="skeleton mb-6 h-12 w-48" />
        <div className="space-y-3">
          <div className="skeleton h-28" />
          <div className="skeleton h-28" />
        </div>
      </div>
    );
  if (cart.length === 0)
    return (
      <div className="container-x flex flex-col items-center gap-3 py-20 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-accent text-link">
          <Icon name="cart" size={28} />
        </span>
        <h1 className="text-3xl">Your cart is empty</h1>
        <Link href="/shop" className="btn mt-2">
          Browse products
        </Link>
      </div>
    );
  return (
    <div className="container-x max-w-4xl py-8">
      <h1 className="mb-6 title-page">Your cart</h1>
      <ul className="space-y-3">
        {cart.map((l) => (
          <li key={l.kind + l.id} className="card flex items-center gap-4 p-3 sm:p-4">
            <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-surface-alt">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {l.image && <img src={l.image} alt="" className="h-full w-full object-contain p-1" />}
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-semibold">
                <Link href={l.kind === "product" ? `/product/${l.slug}` : "/#bundles"} className="hover:text-link">
                  {l.name}
                </Link>{" "}
                {l.kind === "bundle" && <span className="chip">Bundle</span>}
              </div>
              <div className="tabular text-sm text-muted">{formatPKR(l.price)} each</div>
            </div>
            <div className="flex items-center rounded-full border border-line">
              <button className="flex h-11 w-11 items-center justify-center rounded-full hover:bg-accent" onClick={() => setQty(l.kind, l.id, l.qty - 1)} aria-label={`Decrease ${l.name}`}>
                <Icon name="minus" size={16} />
              </button>
              <span className="tabular w-8 text-center text-sm font-semibold">{l.qty}</span>
              <button className="flex h-11 w-11 items-center justify-center rounded-full hover:bg-accent disabled:opacity-40" disabled={l.qty >= Math.min(MAX_LINE_QTY, l.stock ?? MAX_LINE_QTY)} onClick={() => setQty(l.kind, l.id, l.qty + 1)} aria-label={`Increase ${l.name}`}>
                <Icon name="plus" size={16} />
              </button>
            </div>
            <div className="tabular hidden w-24 text-right font-semibold sm:block">{formatPKR(l.price * l.qty)}</div>
            <button className="flex h-11 w-11 items-center justify-center rounded-full text-muted hover:bg-accent hover:text-danger-fg" aria-label={`Remove ${l.name}`} onClick={() => setQty(l.kind, l.id, 0)}>
              <Icon name="close" size={18} />
            </button>
          </li>
        ))}
      </ul>
      <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xl">
            Subtotal: <span className="tabular font-semibold">{formatPKR(subtotal)}</span>
          </p>
          <p className="text-xs text-muted">Shipping is calculated at checkout</p>
        </div>
        <Link href="/checkout" className="btn !px-10 !py-3">
          Checkout
        </Link>
      </div>
    </div>
  );
}
