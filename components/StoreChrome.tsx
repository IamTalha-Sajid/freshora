"use client";

import Link from "next/link";
import { BottomNav } from "@/components/BottomNav";
import { CartDrawer, type ShippingInfo } from "@/components/CartDrawer";
import { Drawer } from "@/components/Drawer";
import { Header } from "@/components/Header";
import { Icon } from "@/components/Icon";
import { SearchBox } from "@/components/SearchBox";
import { useStore } from "@/components/StoreProvider";
import { ThemeToggle } from "@/components/ThemeToggle";
import type { PCategory, PProduct } from "@/lib/data";

const tile = "flex min-h-[64px] flex-col justify-center gap-1.5 rounded-xl border border-line bg-surface p-3 text-sm font-bold transition-colors active:bg-surface-alt";

/** Everything that floats over the page: header, bottom nav, drawers, toasts. */
export function StoreChrome({ categories, shipping, upsell }: { categories: PCategory[]; shipping: ShippingInfo; upsell: PProduct[] }) {
  const { sheet, closeSheet, wishlist, ready } = useStore();
  const roots = categories.filter((c) => !c.parent);

  return (
    <>
      <Header categories={categories} />
      <BottomNav />
      <CartDrawer shipping={shipping} upsell={upsell} />

      <Drawer open={sheet === "menu"} onClose={closeSheet} side="left" title="Menu">
        <nav aria-label="Menu" className="flex min-h-full flex-col">
          <div className="grid grid-cols-2 gap-2.5 p-4">
            <Link href="/shop" onClick={closeSheet} className={tile}>
              <Icon name="grid" className="text-link" />
              All products
            </Link>
            <Link href="/shop?sale=1" onClick={closeSheet} className={`${tile} !border-transparent bg-sale-soft text-danger-fg`}>
              <Icon name="tag" />
              Deals
            </Link>
            <Link href="/#bundles" onClick={closeSheet} className={tile}>
              <Icon name="gift" className="text-link" />
              Bundles
            </Link>
            <Link href="/wishlist" onClick={closeSheet} className={tile}>
              <Icon name="heart" className="text-link" />
              <span>
                Wishlist
                {ready && wishlist.length > 0 && <span className="tabular ml-1.5 rounded-full bg-mint px-1.5 py-px text-[11px] font-extrabold text-[#06141b]">{wishlist.length}</span>}
              </span>
            </Link>
          </div>

          <Link href="/track" onClick={closeSheet} className="mx-4 flex min-h-12 items-center gap-3 rounded-xl bg-surface-alt px-3.5 text-sm font-bold">
            <Icon name="track" className="text-link" />
            Track your order
            <Icon name="chevron-right" size={18} className="ml-auto text-muted" />
          </Link>

          {roots.length > 0 && (
            <div className="px-4 pb-2 pt-6">
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.08em] text-muted">By concern</p>
              <ul className="divide-y divide-line-soft overflow-hidden rounded-xl border border-line">
                {roots.map((c) => {
                  const kids = categories.filter((k) => k.parent === c._id);
                  return (
                    <li key={c._id}>
                      <Link href={`/category/${c.slug}`} onClick={closeSheet} className="flex min-h-12 items-center gap-3 px-3 font-semibold active:bg-surface-alt">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-alt text-link">
                          <Icon name={c.icon || "tooth"} size={18} />
                        </span>
                        {c.name}
                        <Icon name="chevron-right" size={16} className="ml-auto text-muted" />
                      </Link>
                      {kids.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 px-3 pb-3 pl-[56px]">
                          {kids.map((k) => (
                            <Link key={k._id} href={`/category/${k.slug}`} onClick={closeSheet} className="flex min-h-9 items-center rounded-full border border-line px-3 text-[13px] text-fg-2 active:bg-surface-alt">
                              {k.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          <div className="mt-auto flex items-center justify-between border-t border-line-soft px-4 py-3">
            <span className="text-sm font-semibold">Dark mode</span>
            <ThemeToggle />
          </div>
        </nav>
      </Drawer>

      <Drawer open={sheet === "search"} onClose={closeSheet} side="center" title="Search" width="max-w-lg">
        <div className="min-h-[320px] p-4">
          <SearchBox autoFocus onDone={closeSheet} />
        </div>
      </Drawer>
    </>
  );
}
