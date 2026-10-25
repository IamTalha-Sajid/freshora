"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/Icon";
import { PopButton } from "@/components/PopButton";
import { useStore } from "@/components/StoreProvider";
import { formatPKR, splitByOffers, usableOffers, type Offer } from "@/lib/pricing";

type Props = { id: string; slug: string; name: string; price: number; image?: string; stock: number; offers?: Offer[] };

export function ProductActions({ id, slug, name, price, image, stock, offers }: Props) {
  const router = useRouter();
  const { addToCart, wishlist, toggleWishlist } = useStore();
  const [qty, setQty] = useState(1);
  const [inView, setInView] = useState(true);
  const anchor = useRef<HTMLDivElement>(null);

  // Show the sticky mobile bar only after the main button scrolls out of view.
  useEffect(() => {
    const el = anchor.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { rootMargin: "0px 0px -90px 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  if (stock <= 0) return <div className="rounded-xl bg-danger/10 px-4 py-3 text-sm font-semibold text-danger-fg">Out of stock</div>;
  const item = { kind: "product" as const, id, slug, name, price, image, stock, offers };
  const add = (n = qty) => addToCart(item, n);
  const wished = wishlist.includes(id);
  const deals = usableOffers(price, offers).sort((a, b) => a.qty - b.qty);
  const packs = deals.length ? [{ qty: 1, price } as Offer, ...deals] : [];
  const total = splitByOffers(price, offers, qty).total;

  return (
    <>
      <div ref={anchor} className="flex flex-col gap-3">
        {packs.length > 0 && (
          <div role="radiogroup" aria-label="Choose a pack" className="flex flex-col gap-2">
            {packs.map((o) => {
              const on = qty === o.qty;
              const save = o.qty > 1 ? Math.round((1 - o.price / (price * o.qty)) * 100) : 0;
              return (
                <button
                  key={o.qty}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  disabled={o.qty > stock}
                  onClick={() => setQty(o.qty)}
                  className={`flex min-h-14 items-center gap-3 rounded-xl border-2 px-4 py-2.5 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${on ? "border-mint bg-accent" : "border-line bg-surface hover:border-link"}`}
                >
                  <span aria-hidden className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${on ? "border-mint" : "border-input-line"}`}>
                    {on && <span className="h-2.5 w-2.5 rounded-full bg-mint" />}
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col leading-snug">
                    <span className="flex flex-wrap items-center gap-2 font-bold">
                      {o.qty} for <span className="tabular">{formatPKR(o.price)}</span>
                      {o.best && <span className="rounded-md bg-mint px-2 py-0.5 text-[11px] font-extrabold uppercase tracking-[0.04em] text-[#06141b]">Best value</span>}
                      {o.label && <span className="chip">{o.label}</span>}
                    </span>
                    {o.qty > 1 && (
                      <span className="tabular text-xs text-muted">
                        {formatPKR(o.price / o.qty)} each{save > 0 ? ` · Save ${save}%` : ""}
                      </span>
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        )}
        <div className="flex flex-wrap gap-2.5">
          <div className="flex h-[52px] items-center rounded-lg border border-input-line bg-surface">
            <button type="button" className="flex h-[50px] w-[46px] items-center justify-center rounded-lg hover:bg-surface-alt" onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Decrease quantity">
              <Icon name="minus" size={16} strokeWidth={2.4} />
            </button>
            <span className="tabular min-w-8 text-center font-extrabold" aria-live="polite">
              {qty}
            </span>
            <button type="button" className="flex h-[50px] w-[46px] items-center justify-center rounded-lg hover:bg-surface-alt" onClick={() => setQty((q) => Math.min(stock, q + 1))} aria-label="Increase quantity">
              <Icon name="plus" size={16} strokeWidth={2.4} />
            </button>
          </div>
          <PopButton className="btn flex-[1_1_200px] !h-[52px] !text-[15px] !font-extrabold" onClick={() => add()}>
            <Icon name="plus" size={18} strokeWidth={2.4} />
            Add to cart · {formatPKR(total)}
          </PopButton>
          <button
            type="button"
            aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
            aria-pressed={wished}
            onClick={() => toggleWishlist(id)}
            className={`flex h-[52px] w-[52px] items-center justify-center rounded-lg border border-input-line bg-surface transition-colors hover:border-[#b3342f] hover:text-[#b3342f] ${wished ? "text-[#b3342f]" : "text-muted"}`}
          >
            <Icon name="heart" fill={wished ? "currentColor" : "none"} />
          </button>
        </div>
        <button
          type="button"
          className="h-[52px] rounded-lg border border-fg text-[15px] font-extrabold transition-colors hover:bg-surface-alt"
          onClick={() => {
            addToCart(item, qty, { openDrawer: false });
            router.push("/checkout");
          }}
        >
          Buy now
        </button>
      </div>

      {!inView && (
        <div className="fixed inset-x-0 bottom-[68px] z-30 flex items-center gap-3 border-t border-line bg-surface p-3 md:hidden">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{name}</p>
            <p className="tabular text-sm text-muted">{formatPKR(price)}</p>
          </div>
          <PopButton className="btn !px-6" onClick={() => add(1)}>
            Add to cart
          </PopButton>
        </div>
      )}
    </>
  );
}
