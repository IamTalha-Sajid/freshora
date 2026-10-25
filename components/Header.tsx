"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Logo } from "@/components/Brand";
import { Icon } from "@/components/Icon";
import { SearchBox } from "@/components/SearchBox";
import { useStore } from "@/components/StoreProvider";
import { ThemeToggle } from "@/components/ThemeToggle";
import type { PCategory } from "@/lib/data";

function Badge({ n }: { n: number }) {
  if (n <= 0) return null;
  return (
    <span key={n} className="tabular absolute -right-2 -top-1.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-mint px-1 text-[11px] font-extrabold text-[#06141b]">
      {n > 99 ? "99+" : n}
    </span>
  );
}

export function Header({ categories }: { categories: PCategory[] }) {
  const pathname = usePathname();
  const { cartCount, wishlist, ready, openSheet } = useStore();
  const [scrolled, setScrolled] = useState(false);
  const [mega, setMega] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const roots = categories.filter((c) => !c.parent);
  const childrenOf = (id: string) => categories.filter((c) => c.parent === id);

  useEffect(() => setMega(false), [pathname]);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setMega(false);
    document.addEventListener("keydown", esc);
    return () => {
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("keydown", esc);
    };
  }, []);

  const openMega = () => {
    clearTimeout(closeTimer.current);
    setMega(true);
  };
  const closeMega = () => {
    clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setMega(false), 120);
  };

  const iconBtn = "relative flex h-[46px] shrink-0 items-center justify-center gap-2 rounded-lg px-3 text-sm font-semibold transition-colors hover:bg-surface-alt";
  const navLink = "flex h-9 shrink-0 items-center rounded-lg px-3 transition-colors hover:bg-surface-alt";

  return (
    <header
      onMouseLeave={closeMega}
      className={`sticky top-0 z-50 border-b border-line bg-surface transition-shadow duration-200 ${scrolled ? "shadow-[0_8px_24px_rgb(6_20_27/0.12)]" : ""}`}
    >
      <div className="container-x flex flex-wrap items-center gap-x-6 gap-y-2.5 py-2.5 min-[900px]:h-[76px] min-[900px]:flex-nowrap min-[900px]:py-0">
        <button className="-ml-2.5 flex h-11 w-11 items-center justify-center rounded-lg transition-colors hover:bg-surface-alt min-[900px]:hidden" aria-label="Open menu" onClick={() => openSheet("menu")}>
          <Icon name="menu" size={22} />
        </button>

        <Logo className="h-[34px]" />

        <div className="order-5 basis-full min-[900px]:order-none min-[900px]:mx-auto min-[900px]:max-w-[620px] min-[900px]:flex-1 min-[900px]:basis-auto">
          <SearchBox />
        </div>

        <div className="ml-auto flex items-center gap-1">
          <ThemeToggle />
          <Link href="/track" className={`${iconBtn} hidden sm:flex`} aria-label="Track order">
            <Icon name="track" />
            <span className="hidden min-[900px]:inline">Track order</span>
          </Link>
          <Link href="/wishlist" className={`${iconBtn} hidden sm:flex`} aria-label="Wishlist">
            <span className="relative flex">
              <Icon name="heart" />
              {ready && <Badge n={wishlist.length} />}
            </span>
            <span className="hidden min-[900px]:inline">Wishlist</span>
          </Link>
          <button
            className="flex h-[46px] items-center gap-2.5 rounded-lg bg-[var(--btn-bg)] pl-3.5 pr-4 text-sm font-bold text-[var(--btn-fg)] transition-colors hover:bg-[var(--btn-bg-hover)]"
            aria-label={`Open cart, ${cartCount} items`}
            onClick={() => openSheet("cart")}
          >
            <span className="relative flex">
              <Icon name="cart" />
              {ready && cartCount > 0 && (
                <span key={cartCount} className="tabular absolute -right-2 -top-1.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-mint px-1 text-[11px] font-extrabold text-[#06141b]">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </span>
            <span className="hidden min-[900px]:inline">Cart</span>
          </button>
        </div>
      </div>

      <nav aria-label="Main" className="hidden border-t border-line-soft min-[900px]:block">
        <div className="container-x scrollbar-none flex h-12 items-center gap-1 overflow-x-auto whitespace-nowrap text-sm font-semibold">
          <button
            aria-expanded={mega}
            aria-haspopup="true"
            onMouseEnter={openMega}
            onFocus={openMega}
            onClick={() => (mega ? setMega(false) : openMega())}
            className={`-ml-2.5 flex h-9 shrink-0 items-center gap-2 rounded-lg pl-2.5 pr-3.5 font-bold transition-colors hover:bg-surface-alt ${mega ? "bg-surface-alt" : ""}`}
          >
            <Icon name="menu" size={18} />
            All categories
            <Icon name="chevron-down" size={16} />
          </button>
          <span aria-hidden className="mx-2 h-5 w-px bg-line" />
          {roots.slice(0, 6).map((c) => (
            <Link key={c._id} href={`/category/${c.slug}`} className={`${navLink} max-[1100px]:hidden`}>
              {c.name}
            </Link>
          ))}
          <Link href="/shop?sale=1" className={`${navLink} ml-auto text-danger-fg hover:!bg-sale-soft`}>
            Deals
          </Link>
          <Link href="/#bundles" className={navLink}>
            Bundles
          </Link>
        </div>
      </nav>

      {mega && (
        <div onMouseEnter={openMega} onMouseLeave={closeMega} className="absolute inset-x-0 top-full hidden border-b border-line bg-surface shadow-[0_24px_48px_rgb(13_43_58/0.12)] min-[900px]:block">
          <div className="container-x grid grid-cols-[repeat(3,minmax(0,1fr))_minmax(0,1.2fr)] gap-8 pb-8 pt-7 text-sm">
            <div className="col-span-3 grid grid-cols-3 gap-x-8 gap-y-6">
              {roots.slice(0, 9).map((c) => (
                <div key={c._id}>
                  <Link href={`/category/${c.slug}`} className="flex items-center gap-2.5 py-1.5 font-bold hover:text-link">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-alt text-link">
                      <Icon name={c.icon || "tooth"} size={18} />
                    </span>
                    {c.name}
                  </Link>
                  <ul className="pl-[42px]">
                    {childrenOf(c._id).slice(0, 5).map((k) => (
                      <li key={k._id}>
                        <Link href={`/category/${k.slug}`} className="block py-1 text-muted hover:text-link">
                          {k.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              {roots.length === 0 && <p className="text-muted">Categories will appear here once added in the admin panel.</p>}
            </div>
            <Link href="/shop" className="flex min-h-[180px] flex-col justify-between gap-6 rounded-xl bg-navy p-6 text-white transition-colors hover:bg-[#0d2b3a]">
              <span className="text-xs font-bold uppercase tracking-[0.08em] text-[#7fe0d4]">Shop everything</span>
              <span className="font-display text-[26px] font-bold leading-[1.15]">Browse the full Freshora range</span>
              <span className="font-bold text-[#7fe0d4]">All products →</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
