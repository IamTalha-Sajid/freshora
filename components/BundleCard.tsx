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
  const bundleStock = items.length ? Math.min(...items.map((i) => Math.floor(i.product.stock / i.qty))) : 0;
  const image = b.image ?? items[0]?.product.images[0];
  const save = regular > b.price ? Math.round((1 - b.price / regular) * 100) : 0;
  return (
    <article className="card flex h-full flex-col overflow-hidden">
      <div className="relative aspect-video bg-surface-alt">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {image && <img src={image} alt="" className="h-full w-full object-contain p-4" loading="lazy" />}
        {save > 0 && <span className="chip-sale absolute left-3 top-3 !px-2 !py-[3px]">Save {save}%</span>}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <h3 className="text-xl font-bold">{b.name}</h3>
        <ul className="flex flex-col gap-1.5 text-sm text-fg-2">
          {items.map((i) => (
            <li key={i.product._id} className="flex items-center gap-2">
              <Icon name="check" size={14} strokeWidth={2.6} className="shrink-0 text-success" />
              {i.qty} × {i.product.name}
            </li>
          ))}
        </ul>
        <div className="mt-auto flex items-center justify-between gap-3 border-t border-line-soft pt-3">
          <div className="tabular flex items-baseline gap-2">
            <span className="font-display text-[22px] font-bold">{formatPKR(b.price)}</span>
            {save > 0 && <span className="text-[13px] text-muted line-through">{formatPKR(regular)}</span>}
          </div>
          <PopButton className="btn !px-[18px]" disabled={!inStock} onClick={() => addToCart({ kind: "bundle", id: b._id, slug: b.slug, name: b.name, price: b.price, image, stock: bundleStock })}>
            <Icon name="plus" size={16} strokeWidth={2.4} />
            {inStock ? "Add bundle" : "Unavailable"}
          </PopButton>
        </div>
      </div>
    </article>
  );
}
