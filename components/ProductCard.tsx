"use client";

import Link from "next/link";
import { useState } from "react";
import { Drawer } from "@/components/Drawer";
import { Icon } from "@/components/Icon";
import { PopButton } from "@/components/PopButton";
import { useStore } from "@/components/StoreProvider";
import type { PProduct } from "@/lib/data";
import { effectivePrice, formatPKR, isOnSale } from "@/lib/pricing";

export function WishlistButton({ id, className = "" }: { id: string; className?: string }) {
  const { wishlist, toggleWishlist } = useStore();
  const on = wishlist.includes(id);
  return (
    <button
      type="button"
      aria-label={on ? "Remove from wishlist" : "Add to wishlist"}
      aria-pressed={on}
      onClick={() => toggleWishlist(id)}
      className={`flex h-11 w-11 items-center justify-center rounded-full bg-surface/85 shadow-sm backdrop-blur transition hover:bg-surface ${on ? "text-danger" : "text-muted hover:text-fg"} ${className}`}
    >
      <Icon name="heart" size={20} fill={on ? "currentColor" : "none"} />
    </button>
  );
}

function Rating({ p }: { p: PProduct }) {
  if (!p.ratingCount) return null;
  return (
    <div className="flex items-center gap-1 text-xs">
      <Icon name="star" size={14} className="text-warning" fill="currentColor" />
      <span className="tabular font-semibold">{p.ratingAvg}</span>
      <span className="text-muted">({p.ratingCount})</span>
    </div>
  );
}

function Price({ p, large = false }: { p: PProduct; large?: boolean }) {
  const sale = isOnSale(p);
  return (
    <div className="flex items-baseline gap-2">
      <span className={`tabular font-bold ${large ? "text-xl" : "text-base"} ${sale ? "text-danger-fg" : ""}`}>{formatPKR(effectivePrice(p))}</span>
      {sale && <span className="tabular text-xs text-muted line-through">{formatPKR(p.price)}</span>}
    </div>
  );
}

export function ProductCard({ p, layout = "grid" }: { p: PProduct; layout?: "grid" | "list" }) {
  const { addToCart } = useStore();
  const [quick, setQuick] = useState(false);
  const sale = isOnSale(p);
  const price = effectivePrice(p);
  const out = p.stock <= 0;
  const low = !out && p.stock <= (p.lowStockThreshold ?? 5);
  const add = () => addToCart({ kind: "product", id: p._id, slug: p.slug, name: p.name, price, image: p.images[0] });
  const list = layout === "list";

  return (
    <>
      <article className={`card card-hover group relative overflow-hidden ${list ? "flex gap-4 p-3 sm:gap-6 sm:p-4" : "flex h-full flex-col"}`}>
        <Link href={`/product/${p.slug}`} className={`relative block shrink-0 overflow-hidden bg-surface-alt ${list ? "h-32 w-32 rounded-xl sm:h-44 sm:w-44" : "aspect-square"}`} aria-label={p.name}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={p.images[0]} alt="" className="h-full w-full object-contain p-3 transition duration-300 group-hover:scale-105" loading="lazy" />
          <div className="absolute left-2.5 top-2.5 flex flex-col items-start gap-1">
            {sale && <span className="chip-sale">-{Math.round((1 - price / p.price) * 100)}%</span>}
            {low && <span className="chip">Only {p.stock} left</span>}
          </div>
          {out && <span className="absolute inset-x-0 bottom-0 bg-[#06141b]/70 py-1.5 text-center text-xs font-semibold text-white">Out of stock</span>}
        </Link>
        <div className={`absolute flex flex-col gap-1 ${list ? "right-3 top-3" : "right-2.5 top-2.5"}`}>
          <WishlistButton id={p._id} />
          <button
            type="button"
            onClick={() => setQuick(true)}
            aria-label={`Quick view ${p.name}`}
            className="hidden h-11 w-11 items-center justify-center rounded-full bg-surface/85 text-muted opacity-0 shadow-sm backdrop-blur transition hover:bg-surface hover:text-fg focus:opacity-100 group-hover:opacity-100 md:flex"
          >
            <Icon name="eye" size={20} />
          </button>
        </div>

        <div className={`flex flex-1 flex-col gap-1.5 ${list ? "py-1 pr-10" : "p-4"}`}>
          <Rating p={p} />
          <Link href={`/product/${p.slug}`} className="line-clamp-2 font-semibold leading-snug hover:text-link">
            {p.name}
          </Link>
          {list && p.shortDescription && <p className="line-clamp-2 hidden text-sm text-muted sm:block">{p.shortDescription}</p>}
          <div className={`mt-auto pt-2 ${list ? "flex items-end justify-between gap-2" : "flex flex-col gap-3"}`}>
            <Price p={p} />
            <PopButton className={`btn !min-h-11 !px-4 ${list ? "" : "w-full"}`} disabled={out} onClick={add} aria-label={`Add ${p.name} to cart`}>
              <Icon name="plus" size={16} /> {out ? "Sold out" : "Add"}
            </PopButton>
          </div>
        </div>
      </article>

      <Drawer open={quick} onClose={() => setQuick(false)} side="center" title="Quick view" width="max-w-3xl">
        <div className="grid gap-6 p-5 md:grid-cols-2">
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
