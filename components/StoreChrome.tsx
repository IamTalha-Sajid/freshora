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

/** Everything that floats over the page: header, bottom nav, drawers, toasts. */
export function StoreChrome({ categories, shipping, upsell }: { categories: PCategory[]; shipping: ShippingInfo; upsell: PProduct[] }) {
  const { sheet, closeSheet } = useStore();
  const roots = categories.filter((c) => !c.parent);

  return (
    <>
      <Header categories={categories} />
      <BottomNav />
      <CartDrawer shipping={shipping} upsell={upsell} />

      <Drawer open={sheet === "menu"} onClose={closeSheet} side="left" title="Menu">
        <nav className="p-3 text-base">
          <Link href="/shop" onClick={closeSheet} className="flex min-h-11 items-center rounded-lg px-3 font-bold hover:bg-surface-alt">
            All products
          </Link>
          <Link href="/shop?sale=1" onClick={closeSheet} className="flex min-h-11 items-center rounded-lg px-3 font-bold text-danger-fg hover:bg-sale-soft">
            Deals
          </Link>
          <Link href="/#bundles" onClick={closeSheet} className="flex min-h-11 items-center rounded-lg px-3 font-bold hover:bg-surface-alt">
            Bundles
          </Link>
          <p className="px-3 pb-1 pt-4 text-xs font-bold uppercase tracking-[0.08em] text-muted">By concern</p>
          {roots.map((c) => (
            <div key={c._id}>
              <Link href={`/category/${c.slug}`} onClick={closeSheet} className="flex min-h-11 items-center gap-3 rounded-lg px-3 font-semibold hover:bg-surface-alt">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-alt text-link">
                  <Icon name={c.icon || "tooth"} size={18} />
                </span>
                {c.name}
              </Link>
              {categories
                .filter((k) => k.parent === c._id)
                .map((k) => (
                  <Link key={k._id} href={`/category/${k.slug}`} onClick={closeSheet} className="flex min-h-10 items-center rounded-lg pl-14 pr-3 text-sm text-muted hover:bg-surface-alt">
                    {k.name}
                  </Link>
                ))}
            </div>
          ))}
          <div className="mt-4 flex items-center justify-between border-t border-line/70 px-3 pt-4">
            <Link href="/wishlist" onClick={closeSheet} className="font-semibold text-link">
              Wishlist
            </Link>
            <Link href="/track" onClick={closeSheet} className="font-semibold text-link">
              Track order
            </Link>
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
