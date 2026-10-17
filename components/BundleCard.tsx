"use client";

import { Icon } from "@/components/Icon";
import { PopButton } from "@/components/PopButton";
import { useStore } from "@/components/StoreProvider";
import type { PBundle } from "@/lib/data";
import { effectivePrice, formatPKR } from "@/lib/pricing";

export function BundleCard({ b }: { b: PBundle }) {
  const { addToCart } = useStore();
  const items = b.items.filter((i) => i.product);
  const regular = items.reduce((s, i) => s + effectivePrice(i.product) * i.qty, 0);
  const inStock = items.length > 0 && items.every((i) => i.product.stock >= i.qty);
  const image = b.image ?? items[0]?.product.images[0];
  const save = regular > b.price ? Math.round((1 - b.price / regular) * 100) : 0;
  return (
    <article className="card card-hover flex h-full flex-col overflow-hidden">
      <div className="relative aspect-[16/10] bg-surface-alt">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {image && <img src={image} alt="" className="h-full w-full object-contain p-4" loading="lazy" />}
        {save > 0 && <span className="chip-sale absolute left-3 top-3">Save {save}%</span>}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <h3 className="text-lg">{b.name}</h3>
        <ul className="space-y-1 text-sm text-muted">
          {items.map((i) => (
            <li key={i.product._id} className="flex items-center gap-2">
              <Icon name="check" size={14} className="shrink-0 text-success" />
              {i.qty} × {i.product.name}
            </li>
          ))}
        </ul>
        <div className="mt-auto flex items-end justify-between gap-3 pt-2">
          <div>
            <div className="tabular text-xl font-bold">{formatPKR(b.price)}</div>
            {save > 0 && <div className="tabular text-xs text-muted line-through">{formatPKR(regular)}</div>}
          </div>
          <PopButton className="btn" disabled={!inStock} onClick={() => addToCart({ kind: "bundle", id: b._id, slug: b.slug, name: b.name, price: b.price, image })}>
            {inStock ? "Add bundle" : "Unavailable"}
          </PopButton>
        </div>
      </div>
    </article>
  );
}
