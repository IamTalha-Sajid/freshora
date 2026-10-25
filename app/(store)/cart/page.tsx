"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Icon } from "@/components/Icon";
import { MAX_LINE_QTY, useStore } from "@/components/StoreProvider";
import { formatPKR, shippingFor } from "@/lib/pricing";

type Pub = { shippingFee: number; freeShippingThreshold: number };

export default function CartPage() {
  const { cart, setQty, subtotal, ready, syncCart, toast } = useStore();
  const [pub, setPub] = useState<Pub | null>(null);
  useEffect(() => {
    if (ready) syncCart().then((msgs) => msgs.slice(0, 3).forEach((m) => toast(m, "info")));
  }, [ready, syncCart, toast]);
  useEffect(() => {
    fetch("/api/settings").then((r) => r.json()).then(setPub).catch(() => {});
  }, []);
  if (!ready)
    return (
      <div className="container-x py-8" aria-busy="true" aria-label="Loading cart">
        <div className="skeleton mb-6 h-12 w-48" />
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
          <div className="skeleton h-56" />
          <div className="skeleton h-64" />
        </div>
      </div>
    );
  if (cart.length === 0)
    return (
      <div className="container-x flex flex-col items-center gap-3.5 px-6 py-[72px] text-center">
        <span className="flex h-[72px] w-[72px] items-center justify-center rounded-full bg-surface-alt text-link">
          <Icon name="cart" size={30} />
        </span>
        <h1 className="text-[32px] font-bold">Your cart is empty</h1>
        <p className="text-muted">Add a few essentials and they&apos;ll show up here.</p>
        <Link href="/shop" className="btn mt-1.5 !h-[50px] !px-7">
          Browse products
        </Link>
      </div>
    );

  const shipping = pub ? shippingFor(subtotal, pub.shippingFee, pub.freeShippingThreshold) : null;
  const threshold = pub?.freeShippingThreshold ?? 0;
  const remaining = Math.max(0, threshold - subtotal);
  const items = cart.reduce((n, l) => n + l.qty, 0);

  return (
    <div className="container-x py-8">
      <div className="mb-6 flex flex-wrap items-baseline gap-x-3.5">
        <h1 className="title-page">Your cart</h1>
        <span className="text-sm text-muted">
          {items} item{items === 1 ? "" : "s"}
        </span>
      </div>
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start">
        <ul className="overflow-hidden rounded-2xl border border-line bg-surface">
          {cart.map((l) => (
            <li key={l.kind + l.id} className="flex items-center gap-3 border-t border-line-soft p-4 first:border-t-0 sm:gap-4 sm:px-5">
              <div className="h-[72px] w-[72px] shrink-0 overflow-hidden rounded-[10px] bg-surface-alt sm:h-[88px] sm:w-[88px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {l.image && <img src={l.image} alt="" className="h-full w-full object-contain p-1" />}
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-bold">
                  <Link href={l.kind === "product" ? `/product/${l.slug}` : "/#bundles"} className="hover:text-link">
                    {l.name}
                  </Link>{" "}
                  {l.kind === "bundle" && <span className="chip">Bundle</span>}
                </div>
                <div className="tabular text-[13px] text-muted">{formatPKR(l.price)} each</div>
              </div>
              <div className="flex h-11 items-center rounded-lg border border-input-line">
                <button className="flex h-10 w-10 items-center justify-center rounded-lg hover:bg-surface-alt" onClick={() => setQty(l.kind, l.id, l.qty - 1)} aria-label={`Decrease ${l.name}`}>
                  <Icon name="minus" size={14} strokeWidth={2.6} />
                </button>
                <span className="tabular min-w-7 text-center text-sm font-extrabold">{l.qty}</span>
                <button className="flex h-10 w-10 items-center justify-center rounded-lg hover:bg-surface-alt disabled:opacity-40" disabled={l.qty >= Math.min(MAX_LINE_QTY, l.stock ?? MAX_LINE_QTY)} onClick={() => setQty(l.kind, l.id, l.qty + 1)} aria-label={`Increase ${l.name}`}>
                  <Icon name="plus" size={14} strokeWidth={2.6} />
                </button>
              </div>
              <div className="tabular hidden min-w-24 text-right font-extrabold sm:block">{formatPKR(l.price * l.qty)}</div>
              <button className="flex h-11 w-11 items-center justify-center rounded-lg text-muted transition-colors hover:bg-sale-soft hover:text-danger-fg" aria-label={`Remove ${l.name}`} onClick={() => setQty(l.kind, l.id, 0)}>
                <Icon name="trash" size={18} />
              </button>
            </li>
          ))}
        </ul>

        <aside className="flex flex-col gap-4 rounded-2xl border border-line bg-surface p-6 lg:sticky lg:top-40">
          <h2 className="text-xl font-bold">Order summary</h2>
          <div className="tabular flex flex-col gap-2.5 text-sm">
            <div className="flex justify-between">
              <span className="text-muted">Subtotal</span>
              <span>{formatPKR(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Shipping</span>
              <span>{shipping === null ? "Calculated at checkout" : shipping === 0 ? "Free" : formatPKR(shipping)}</span>
            </div>
          </div>
          {threshold > 0 && (
            <div className="flex flex-col gap-2 rounded-[10px] bg-surface-alt px-3.5 py-3 text-[13px] font-semibold">
              <span>{remaining > 0 ? `Add ${formatPKR(remaining)} more for free shipping` : "You’ve unlocked free shipping"}</span>
              <span className="h-1.5 overflow-hidden rounded-full bg-line" role="progressbar" aria-valuenow={Math.round(Math.min(100, (subtotal / threshold) * 100))} aria-valuemin={0} aria-valuemax={100} aria-label="Progress to free shipping">
                <span className="block h-full bg-mint transition-[width] duration-300" style={{ width: `${Math.min(100, (subtotal / threshold) * 100)}%` }} />
              </span>
            </div>
          )}
          {shipping !== null && (
            <div className="flex items-baseline justify-between border-t border-line-soft pt-3.5">
              <b className="text-base">Total</b>
              <span className="tabular font-display text-2xl font-bold">{formatPKR(subtotal + shipping)}</span>
            </div>
          )}
          <Link href="/checkout" className="btn !h-[52px] !text-[15px] !font-extrabold">
            Checkout <Icon name="arrow-right" size={18} strokeWidth={2.4} />
          </Link>
          <Link href="/shop" className="flex h-11 items-center justify-center rounded-lg text-sm font-bold text-link transition-colors hover:bg-surface-alt">
            Continue shopping
          </Link>
          <span className="flex items-center justify-center gap-2 text-xs text-muted">
            <Icon name="lock" size={14} />
            Cash on delivery &amp; bank transfer accepted
          </span>
        </aside>
      </div>
    </div>
  );
}
