"use client";

import Link from "next/link";
import { useState } from "react";
import { Drawer } from "@/components/Drawer";
import { Icon } from "@/components/Icon";
import { Tip } from "@/components/Tooltip";
import { PopButton } from "@/components/PopButton";
import { useStore } from "@/components/StoreProvider";
import type { PProduct } from "@/lib/data";
import { effectivePrice, formatPKR, isOnSale } from "@/lib/pricing";

export function WishlistButton({ id, className = "" }: { id: string; className?: string }) {
  const { wishlist, toggleWishlist } = useStore();
  const on = wishlist.includes(id);
  const label = on ? "Remove from wishlist" : "Add to wishlist";
  return (
    <Tip label={label} side="left">
    <button
      type="button"
      aria-label={label}
      aria-pressed={on}
      onClick={() => toggleWishlist(id)}
      className={`flex h-10 w-10 items-center justify-center rounded-full bg-surface shadow-[0_2px_8px_rgb(13_43_58/0.12)] transition-colors hover:text-danger-fg ${on ? "text-danger-fg" : "text-muted"} ${className}`}
    >
      <Icon name="heart" size={18} fill={on ? "currentColor" : "none"} />
    </button>
    </Tip>
  );
}

function Rating({ p }: { p: PProduct }) {
  if (!p.ratingCount) return null;
  return (
    <div className="flex items-center gap-1.5 text-[13px]" role="img" aria-label={`Rated ${p.ratingAvg} out of 5 from ${p.ratingCount} reviews`}>
      <span className="flex gap-px">
        {Array.from({ length: 5 }, (_, i) => (
          <Icon key={i} name="star" size={14} fill="currentColor" stroke="none" className={i < Math.round(p.ratingAvg) ? "text-warning" : "text-star-off"} />
        ))}
      </span>
      <b className="tabular">{p.ratingAvg}</b>
      <span className="text-muted">({p.ratingCount})</span>
    </div>
  );
}

function Price({ p, large = false }: { p: PProduct; large?: boolean }) {
  const sale = isOnSale(p);
  return (
    <div className="flex flex-wrap items-baseline gap-x-2">
      <span className={`tabular whitespace-nowrap font-display font-bold ${large ? "text-2xl" : "text-[22px]"}`}>{formatPKR(effectivePrice(p))}</span>
      {sale && <span className="tabular text-[13px] text-muted line-through">{formatPKR(p.price)}</span>}
    </div>
  );
}

function StockLine({ out, low, stock }: { out: boolean; low: boolean; stock: number }) {
  const tone = out ? "text-danger-fg" : low ? "text-warn-fg" : "text-success";
  return (
    <span className={`flex items-center gap-1.5 text-[13px] font-semibold ${tone}`}>
      <span aria-hidden className="h-[7px] w-[7px] rounded-full bg-current" />
      {out ? "Out of stock" : low ? `Only ${stock} left` : "In stock"}
    </span>
  );
}

export function ProductCard({ p, layout = "grid" }: { p: PProduct; layout?: "grid" | "list" }) {
  const { addToCart } = useStore();
  const [quick, setQuick] = useState(false);
  const sale = isOnSale(p);
  const price = effectivePrice(p);
  const out = p.stock <= 0;
  const low = !out && p.stock <= (p.lowStockThreshold ?? 5);
  const add = () => addToCart({ kind: "product", id: p._id, slug: p.slug, name: p.name, price, image: p.images[0], stock: p.stock, offers: p.offers });
  const list = layout === "list";

  return (
    <>
      <article className={`card card-hover group @container relative overflow-hidden ${list ? "flex gap-4 p-3 sm:gap-6 sm:p-4" : "flex h-full flex-col"}`}>
        <Link href={`/product/${p.slug}`} className={`relative block shrink-0 overflow-hidden bg-surface-alt ${list ? "h-32 w-32 rounded-xl sm:h-44 sm:w-44" : "aspect-square"}`} aria-label={p.name}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={p.images[0]} alt="" className="h-full w-full object-cover transition duration-300 group-hover:scale-105" loading="lazy" />
          {sale && <span className="chip-sale absolute left-3 top-3 tabular">-{Math.round((1 - price / p.price) * 100)}%</span>}
          {out && <span className="absolute inset-x-0 bottom-0 bg-[#06141b]/70 py-1.5 text-center text-xs font-semibold text-white">Out of stock</span>}
        </Link>
        <div className={`absolute flex flex-col gap-1 ${list ? "right-3 top-3" : "right-2.5 top-2.5"}`}>
          <WishlistButton id={p._id} />
          <button
            type="button"
            onClick={() => setQuick(true)}
            aria-label={`Quick view ${p.name}`}
            className="hidden h-10 w-10 items-center justify-center rounded-full bg-surface text-muted opacity-0 shadow-[0_2px_8px_rgb(13_43_58/0.12)] transition hover:text-fg focus:opacity-100 group-hover:opacity-100 md:flex"
          >
            <Icon name="eye" size={18} />
          </button>
        </div>

        <div className={`flex flex-1 flex-col gap-2.5 ${list ? "py-1 pr-10" : "p-4"}`}>
          <div className="flex flex-col gap-1">
            <span className="text-xs font-bold uppercase tracking-[0.08em] text-muted">Freshora</span>
            <Link href={`/product/${p.slug}`} className="-my-3 block py-3 text-[15px] font-bold leading-snug hover:text-link">
              <span className="line-clamp-2">{p.name}</span>
            </Link>
          </div>
          <Rating p={p} />
          {list && p.shortDescription && <p className="line-clamp-2 hidden text-sm text-muted sm:block">{p.shortDescription}</p>}
          <StockLine out={out} low={low} stock={p.stock} />
          <div className="mt-auto flex flex-col gap-2.5 pt-1.5">
            <Price p={p} />
            <PopButton className="btn w-full" disabled={out} onClick={add} aria-label={`Add ${p.name} to cart`}>
              <Icon name="plus" size={16} strokeWidth={2.4} /> {out ? "Sold out" : "Add to cart"}
            </PopButton>
          </div>
        </div>
      </article>

      <Drawer open={quick} onClose={() => setQuick(false)} side="right" title="Quick view" width="max-w-md">
        <div className="grid gap-6 p-5">
          <div className="aspect-square overflow-hidden rounded-2xl bg-surface-alt">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.images[0]} alt={p.name} className="h-full w-full object-contain p-4" />
          </div>
          <div className="space-y-3">
            <Rating p={p} />
            <h3 className="text-2xl">{p.name}</h3>
            <Price p={p} large />
            {(p.shortDescription || p.description) && <p className="line-clamp-5 text-sm text-muted">{p.shortDescription || p.description}</p>}
            <div className="flex flex-wrap gap-3 pt-2">
              <PopButton
                className="btn !px-6"
                disabled={out}
                onClick={() => {
                  add();
                  setQuick(false);
                }}
              >
                {out ? "Out of stock" : "Add to cart"}
              </PopButton>
              <Link href={`/product/${p.slug}`} className="btn-outline" onClick={() => setQuick(false)}>
                Full details
              </Link>
            </div>
          </div>
        </div>
      </Drawer>
    </>
  );
}
