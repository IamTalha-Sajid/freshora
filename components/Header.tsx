"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Logo } from "@/components/Brand";
import { Icon } from "@/components/Icon";
import { SearchBox } from "@/components/SearchBox";
import { useStore } from "@/components/StoreProvider";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Tip } from "@/components/Tooltip";
import type { PCategory } from "@/lib/data";

/** scrolled: past 80px. hidden: scrolling down. Header reappears on any upward scroll. */
function useScrollState() {
  const [state, setState] = useState({ scrolled: false, hidden: false });
  useEffect(() => {
    let last = window.scrollY;
    let raf = 0;
    const update = () => {
      raf = 0;
      const y = window.scrollY;
      const scrolled = y > 80;
      setState((s) => {
        let hidden = s.hidden;
        if (y > last + 4 && y > 140) hidden = true;
        else if (y < last - 4 || y <= 80) hidden = false;
        return s.scrolled === scrolled && s.hidden === hidden ? s : { scrolled, hidden };
      });
      last = y;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);
  return state;
}

function Badge({ n }: { n: number }) {
  if (n <= 0) return null;
  return (
    <span key={n} className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-mint px-1 text-xs font-semibold text-[#06141b]">
      {n > 99 ? "99+" : n}
    </span>
  );
}

export function Header({ categories, announcement }: { categories: PCategory[]; announcement: boolean }) {
  const pathname = usePathname();
  const { scrolled } = useScrollState();
  const { cartCount, wishlist, ready, openSheet } = useStore();
  const [mega, setMega] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const isHome = pathname === "/";
  const overHero = isHome && !scrolled && !mega;
  const top = scrolled || !announcement ? 10 : 48;
  const roots = categories.filter((c) => !c.parent);
  const childrenOf = (id: string) => categories.filter((c) => c.parent === id);

  useEffect(() => setMega(false), [pathname]);
  useEffect(() => {
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setMega(false);
    document.addEventListener("keydown", esc);
    return () => document.removeEventListener("keydown", esc);
  }, []);

  const openMega = () => {
    clearTimeout(closeTimer.current);
    setMega(true);
  };
  const closeMega = () => {
    clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setMega(false), 120);
  };

  // The pill is always dark navy glass with light text, so every control uses the same light hover.
  const iconBtn = "relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition duration-200 hover:bg-white/12";

  return (
    <header
      data-over-hero="true"
      style={{ top }}
      className="fixed inset-x-3 z-50"
    >
      <div
        className={`relative mx-auto max-w-[1920px] rounded-full border border-white/15 text-white backdrop-blur-[18px] backdrop-saturate-[1.6] transition-[background-color,box-shadow] duration-300 ${
          overHero ? "bg-white/[0.07]" : "bg-[#0d2b3a]/85 shadow-[0_8px_24px_rgb(6_20_27/0.18)]"
        }`}
        style={{ height: scrolled ? 60 : 68 }}
      >
        <div className="flex h-full items-center gap-2 pl-2 pr-2 sm:pl-3 lg:gap-5 lg:pl-6">
          {/* Mobile: menu button */}
          <button className={`${iconBtn} lg:hidden`} aria-label="Open menu" onClick={() => openSheet("menu")}>
            <Icon name="menu" />
          </button>

          <Logo className={scrolled ? "h-7" : "h-9"} />

          {/* Desktop nav */}
          <nav className="ml-2 hidden items-center gap-1 lg:flex" aria-label="Main">
            <div onMouseEnter={openMega} onMouseLeave={closeMega}>
              <button
                aria-expanded={mega}
                aria-haspopup="true"
                onClick={openMega}
                onFocus={openMega}
                className="flex h-11 items-center gap-1 rounded-full px-4 text-sm font-semibold transition hover:bg-white/12"
              >
                Shop <Icon name="chevron-down" size={16} className={`transition ${mega ? "rotate-180" : ""}`} />
              </button>
            </div>
            <Link href="/shop?sale=1" className="flex h-11 items-center rounded-full px-4 text-sm font-semibold transition hover:bg-white/12">
              Deals
            </Link>
          </nav>

          <div className="mx-auto hidden w-full max-w-sm lg:block xl:max-w-md">
            <SearchBox tone="on-hero" />
          </div>

          <div className="ml-auto flex items-center lg:ml-0">
            <Tip label="Track order" className="hidden sm:inline-flex">
              <Link href="/track" className={iconBtn} aria-label="Track order">
                <Icon name="track" />
              </Link>
            </Tip>
            <Tip label="Wishlist" className="hidden sm:inline-flex">
              <Link href="/wishlist" className={iconBtn} aria-label="Wishlist">
                <Icon name="heart" />
                {ready && <Badge n={wishlist.length} />}
              </Link>
            </Tip>
            <ThemeToggle className="hover:!bg-white/12" />
            <button
              className="ml-1 flex h-12 items-center gap-2 rounded-full bg-mint pl-3.5 pr-4 text-sm font-semibold text-[#06141b] transition duration-200 hover:bg-[#4fd3c4]"
              aria-label={`Open cart, ${cartCount} items`}
              onClick={() => openSheet("cart")}
            >
              <Icon name="cart" />
              <span className="hidden sm:inline">Cart</span>
              {ready && cartCount > 0 && (
                <span key={cartCount} className="tabular inline-block">
                  <span className="hidden sm:inline">· </span>
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mega-menu: same glass panel style */}
        {mega && (
          <div onMouseEnter={openMega} onMouseLeave={closeMega} className="absolute left-0 right-0 top-full hidden pt-3 lg:block">
            <div className="glass-strong animate-rise rounded-[28px] p-6 text-fg">
              <div className="grid grid-cols-4 gap-6">
                {roots.slice(0, 7).map((c) => (
                  <div key={c._id}>
                    <Link href={`/category/${c.slug}`} className="mb-2 flex items-center gap-3 font-display font-semibold hover:text-link">
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-link">
                        <Icon name={c.icon || "tooth"} />
                      </span>
                      {c.name}
                    </Link>
                    <ul className="space-y-0.5 pl-[52px] text-sm">
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
                <Link href="/shop" className="flex flex-col justify-between rounded-2xl bg-gradient-to-br from-navy via-teal to-mint p-5 text-white transition hover:brightness-110">
                  <span className="font-display text-xl font-semibold leading-tight">Shop everything</span>
                  <span className="text-sm">Browse all products →</span>
                </Link>
              </div>
              {roots.length === 0 && <p className="text-sm text-muted">Categories will appear here once added in the admin panel.</p>}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
