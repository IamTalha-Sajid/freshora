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
export function StoreChrome({ categories, shipping, upsell, announcement }: { categories: PCategory[]; shipping: ShippingInfo; upsell: PProduct[]; announcement: boolean }) {
  const { sheet, closeSheet } = useStore();
  const roots = categories.filter((c) => !c.parent);

  return (
    <>
      <Header categories={categories} announcement={announcement} />
      <BottomNav />
      <CartDrawer shipping={shipping} upsell={upsell} />

      <Drawer open={sheet === "menu"} onClose={closeSheet} side="left" title="Menu">
        <nav className="p-3 text-base">
          <Link href="/shop" onClick={closeSheet} className="flex min-h-11 items-center rounded-xl px-3 font-semibold hover:bg-accent">
            All products
          </Link>
          <Link href="/shop?sale=1" onClick={closeSheet} className="flex min-h-11 items-center rounded-xl px-3 font-semibold hover:bg-accent">
            Deals
          </Link>
          <p className="px-3 pb-1 pt-4 text-xs font-semibold uppercase tracking-wide text-muted">Shop by need</p>
          {roots.map((c) => (
            <div key={c._id}>
              <Link href={`/category/${c.slug}`} onClick={closeSheet} className="flex min-h-11 items-center gap-3 rounded-xl px-3 font-semibold hover:bg-accent">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-link">
                  <Icon name={c.icon || "tooth"} size={18} />
                </span>
                {c.name}
              </Link>
              {categories
                .filter((k) => k.parent === c._id)
                .map((k) => (
                  <Link key={k._id} href={`/category/${k.slug}`} onClick={closeSheet} className="flex min-h-10 items-center rounded-xl pl-14 pr-3 text-sm text-muted hover:bg-accent">
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
