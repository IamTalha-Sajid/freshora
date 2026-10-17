"use client";

import Link from "next/link";
import { Drawer } from "@/components/Drawer";
import { Icon } from "@/components/Icon";
import { useStore } from "@/components/StoreProvider";
import type { PProduct } from "@/lib/data";
import { effectivePrice, formatPKR, shippingFor } from "@/lib/pricing";

export type ShippingInfo = { fee: number; threshold: number };

export function CartDrawer({ shipping, upsell }: { shipping: ShippingInfo; upsell: PProduct[] }) {
  const { cart, setQty, subtotal, sheet, closeSheet, addToCart, cartCount } = useStore();
  const open = sheet === "cart";
  const { fee, threshold } = shipping;
  const remaining = threshold > 0 ? Math.max(0, threshold - subtotal) : 0;
  const pct = threshold > 0 ? Math.min(100, (subtotal / threshold) * 100) : 0;
  const inCart = new Set(cart.filter((l) => l.kind === "product").map((l) => l.id));
  const suggestions = upsell.filter((p) => !inCart.has(p._id) && p.stock > 0).slice(0, 3);
  const ship = shippingFor(subtotal, fee, threshold);

  return (
    <Drawer
      open={open}
      onClose={closeSheet}
      title={`Your cart${cartCount ? ` (${cartCount})` : ""}`}
      footer={
        cart.length > 0 && (
          <div className="space-y-3">
            <div className="flex justify-between text-sm text-muted">
              <span>Subtotal</span>
              <span className="tabular font-semibold text-fg">{formatPKR(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm text-muted">
              <span>Shipping</span>
              <span className="tabular">{ship === 0 ? "Free" : formatPKR(ship)}</span>
            </div>
            <Link href="/checkout" onClick={closeSheet} className="btn w-full !py-3">
              Checkout · {formatPKR(subtotal + ship)}
            </Link>
            <Link href="/cart" onClick={closeSheet} className="block text-center text-sm font-semibold text-link hover:underline">
              View full cart
            </Link>
          </div>
        )
      }
    >
      {threshold > 0 && cart.length > 0 && (
        <div className="border-b border-line/70 px-5 py-4">
          <p className="mb-2 text-sm font-semibold">
            {remaining > 0 ? (
              <>
                Add <span className="tabular text-link">{formatPKR(remaining)}</span> more for free shipping
              </>
            ) : (
              <>🎉 You’ve unlocked free shipping!</>
            )}
          </p>
          <div className="h-2 overflow-hidden rounded-full bg-accent" role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100} aria-label="Progress to free shipping">
            <div className="h-full rounded-full bg-gradient-to-r from-teal to-mint transition-[width] duration-500" style={{ width: `${pct}%` }} />
          </div>
        </div>
      )}

      {cart.length === 0 ? (
        <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-accent text-link">
            <Icon name="cart" size={28} />
          </span>
          <p className="font-display text-lg font-bold">Your cart is empty</p>
          <p className="text-sm text-muted">Fresh finds are waiting.</p>
          <Link href="/shop" onClick={closeSheet} className="btn mt-2">
            Start shopping
          </Link>
        </div>
      ) : (
        <>
          <ul className="divide-y divide-line/70 px-5">
            {cart.map((l) => (
              <li key={l.kind + l.id} className="flex gap-3 py-4">
                <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-surface-alt">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {l.image && <img src={l.image} alt="" className="h-full w-full object-contain p-1" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-sm font-semibold">{l.name}</p>
                  {l.kind === "bundle" && <span className="chip mt-0.5">Bundle</span>}
                  <p className="tabular mt-0.5 text-sm text-muted">{formatPKR(l.price)}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <div className="flex items-center rounded-full border border-line">
                      <button className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-accent" onClick={() => setQty(l.kind, l.id, l.qty - 1)} aria-label={`Decrease ${l.name}`}>
                        <Icon name="minus" size={16} />
                      </button>
                      <span className="tabular w-7 text-center text-sm font-semibold" aria-live="polite">
                        {l.qty}
                      </span>
                      <button className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-accent" onClick={() => setQty(l.kind, l.id, l.qty + 1)} aria-label={`Increase ${l.name}`}>
                        <Icon name="plus" size={16} />
                      </button>
                    </div>
                    <button className="text-xs font-semibold text-muted underline-offset-2 hover:text-danger-fg hover:underline" onClick={() => setQty(l.kind, l.id, 0)}>
                      Remove
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          {suggestions.length > 0 && (
            <div className="border-t border-line/70 px-5 py-4">
              <p className="mb-3 text-sm font-bold">Complete your routine</p>
              <ul className="space-y-3">
                {suggestions.map((p) => (
                  <li key={p._id} className="flex items-center gap-3">
                    <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-surface-alt">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={p.images[0]} alt="" className="h-full w-full object-contain p-1" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{p.name}</p>
                      <p className="tabular text-sm text-muted">{formatPKR(effectivePrice(p))}</p>
                    </div>
                    <button
                      className="btn-outline !min-h-9 !px-3.5 !py-1"
                      onClick={() => addToCart({ kind: "product", id: p._id, slug: p.slug, name: p.name, price: effectivePrice(p), image: p.images[0] }, 1, { openDrawer: false })}
                    >
                      Add
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </Drawer>
  );
}
