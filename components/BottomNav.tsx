"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/Icon";
import { useStore } from "@/components/StoreProvider";

export function BottomNav() {
  const pathname = usePathname();
  const { cartCount, ready, openSheet, sheet } = useStore();
  const item = "relative flex min-h-[52px] flex-1 flex-col items-center justify-center gap-0.5 rounded-2xl text-[11px] font-semibold transition";
  const on = (active: boolean) => (active ? "text-link" : "text-muted");

  return (
    <nav aria-label="Primary" className="glass fixed inset-x-3 bottom-3 z-40 flex rounded-[20px] p-1.5 md:hidden">
      <Link href="/" className={`${item} ${on(pathname === "/")}`}>
        <Icon name="home" /> Home
      </Link>
      <Link href="/shop" className={`${item} ${on(pathname.startsWith("/shop") || pathname.startsWith("/category") || pathname.startsWith("/product"))}`}>
        <Icon name="grid" /> Shop
      </Link>
      <button onClick={() => openSheet("search")} className={`${item} ${on(sheet === "search")}`}>
        <Icon name="search" /> Search
      </button>
      <button onClick={() => openSheet("cart")} className={`${item} ${on(sheet === "cart")}`}>
        <span className="relative">
          <Icon name="cart" />
          {ready && cartCount > 0 && (
            <span key={cartCount} className="absolute -right-2.5 -top-2 flex h-4 min-w-4 animate-bounce-once items-center justify-center rounded-full bg-mint px-1 text-[10px] font-bold text-[#06141b]">
              {cartCount}
            </span>
          )}
        </span>
        Cart
      </button>
      <Link href="/track" className={`${item} ${on(pathname.startsWith("/track") || pathname.startsWith("/order"))}`}>
        <Icon name="track" /> Track
      </Link>
    </nav>
  );
}
