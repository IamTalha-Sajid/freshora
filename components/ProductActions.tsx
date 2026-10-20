"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/Icon";
import { PopButton } from "@/components/PopButton";
import { WishlistButton } from "@/components/ProductCard";
import { useStore } from "@/components/StoreProvider";
import { formatPKR } from "@/lib/pricing";

type Props = { id: string; slug: string; name: string; price: number; image?: string; stock: number };

export function ProductActions({ id, slug, name, price, image, stock }: Props) {
  const { addToCart } = useStore();
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

  if (stock <= 0) return <div className="rounded-2xl bg-danger/10 px-4 py-3 text-sm font-semibold text-danger-fg">Out of stock</div>;
  const add = (n = qty) => addToCart({ kind: "product", id, slug, name, price, image, stock }, n);

  return (
    <>
      <div ref={anchor} className="flex flex-wrap items-center gap-3">
        <div className="flex items-center rounded-full border border-line bg-surface">
          <button type="button" className="flex h-11 w-11 items-center justify-center rounded-full hover:bg-accent" onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Decrease quantity">
            <Icon name="minus" size={18} />
          </button>
          <span className="tabular w-10 text-center font-semibold" aria-live="polite">
            {qty}
          </span>
          <button type="button" className="flex h-11 w-11 items-center justify-center rounded-full hover:bg-accent" onClick={() => setQty((q) => Math.min(stock, q + 1))} aria-label="Increase quantity">
            <Icon name="plus" size={18} />
          </button>
        </div>
        <PopButton className="btn flex-1 !py-3 sm:flex-none sm:!px-10" onClick={() => add()}>
          Add to cart · {formatPKR(price * qty)}
        </PopButton>
        <WishlistButton id={id} className="!border !border-line" />
      </div>

      {!inView && (
        <div className="glass fixed inset-x-3 bottom-[88px] z-30 flex items-center gap-3 rounded-2xl p-3 md:hidden">
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
