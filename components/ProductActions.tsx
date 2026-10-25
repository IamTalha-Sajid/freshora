"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/Icon";
import { PopButton } from "@/components/PopButton";
import { useStore } from "@/components/StoreProvider";
import { formatPKR } from "@/lib/pricing";

type Props = { id: string; slug: string; name: string; price: number; image?: string; stock: number };

export function ProductActions({ id, slug, name, price, image, stock }: Props) {
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
  const item = { kind: "product" as const, id, slug, name, price, image, stock };
  const add = (n = qty) => addToCart(item, n);
  const wished = wishlist.includes(id);

  return (
    <>
      <div ref={anchor} className="flex flex-col gap-3">
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
            Add to cart · {formatPKR(price * qty)}
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
