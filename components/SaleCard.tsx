"use client";

import Link from "next/link";
import { Icon } from "@/components/Icon";
import { useStore } from "@/components/StoreProvider";
import type { PProduct } from "@/lib/data";
import { effectivePrice, formatPKR, isOnSale } from "@/lib/pricing";

/** Compact horizontal product row used inside the home page deals panel. */
export function SaleCard({ p }: { p: PProduct }) {
  const { addToCart } = useStore();
  const price = effectivePrice(p);
  const out = p.stock <= 0;
  return (
    <article className="flex items-center gap-3.5 rounded-xl bg-surface p-2.5 text-fg">
      <Link href={`/product/${p.slug}`} aria-label={p.name} className="h-[88px] w-[88px] shrink-0 overflow-hidden rounded-lg bg-surface-alt">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={p.images[0]} alt="" className="h-full w-full object-contain p-1.5" loading="lazy" />
      </Link>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        {isOnSale(p) && <span className="chip-sale self-start">-{Math.round((1 - price / p.price) * 100)}%</span>}
        <Link href={`/product/${p.slug}`} className="text-sm font-bold leading-snug hover:text-link">
          <span className="line-clamp-2">{p.name}</span>
        </Link>
        <div className="tabular flex items-baseline gap-1.5">
          <b>{formatPKR(price)}</b>
          {isOnSale(p) && <span className="text-xs text-muted line-through">{formatPKR(p.price)}</span>}
        </div>
      </div>
      <button
        type="button"
        disabled={out}
        aria-label={out ? `${p.name} is sold out` : `Add ${p.name} to cart`}
        onClick={() => addToCart({ kind: "product", id: p._id, slug: p.slug, name: p.name, price, image: p.images[0], stock: p.stock })}
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[var(--btn-bg)] text-[var(--btn-fg)] transition-colors hover:bg-[var(--btn-bg-hover)] disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Icon name="plus" size={18} strokeWidth={2.4} />
      </button>
    </article>
  );
}
