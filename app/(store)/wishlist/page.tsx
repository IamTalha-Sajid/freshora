"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Icon } from "@/components/Icon";
import { ProductCard } from "@/components/ProductCard";
import { useStore } from "@/components/StoreProvider";
import type { PProduct } from "@/lib/data";

export default function WishlistPage() {
  const { wishlist, ready } = useStore();
  const [products, setProducts] = useState<PProduct[] | null>(null);

  useEffect(() => {
    if (!ready) return;
    if (wishlist.length === 0) return setProducts([]);
    fetch(`/api/products?ids=${wishlist.join(",")}`)
      .then((r) => r.json())
      .then(setProducts);
  }, [ready, wishlist]);

  return (
    <div className="container-x py-8">
      <div className="mb-6 flex flex-wrap items-baseline gap-x-3.5">
        <h1 className="title-page">Wishlist</h1>
        {products && products.length > 0 && (
          <span className="text-sm text-muted">
            {products.length} saved item{products.length === 1 ? "" : "s"}
          </span>
        )}
      </div>
      {products === null ? (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-[repeat(auto-fill,minmax(240px,1fr))]" aria-busy="true" aria-label="Loading wishlist">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="skeleton h-72" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-line px-6 py-16 text-center">
          <span className="flex h-[60px] w-[60px] items-center justify-center rounded-full bg-surface-alt text-link">
            <Icon name="heart" size={26} />
          </span>
          <p className="text-lg font-bold">Nothing saved yet</p>
          <p className="text-sm text-muted">Tap the heart on any product to save it here.</p>
          <Link href="/shop" className="btn mt-1.5 !h-12 !px-6">
            Browse products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-[repeat(auto-fill,minmax(240px,1fr))]">
          {products.filter((p) => wishlist.includes(p._id)).map((p) => (
            <ProductCard key={p._id} p={p} />
          ))}
        </div>
      )}
    </div>
  );
}
