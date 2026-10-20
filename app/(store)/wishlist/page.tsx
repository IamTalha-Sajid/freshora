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
      <h1 className="mb-6 title-page">Wishlist</h1>
      {products === null ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4" aria-busy="true" aria-label="Loading wishlist">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="skeleton h-72" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="card flex flex-col items-center gap-3 p-12 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-accent text-link">
            <Icon name="heart" size={26} />
          </span>
          <p className="font-display text-lg font-semibold">Nothing saved yet</p>
          <Link href="/shop" className="btn">
            Browse products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
          {products.filter((p) => wishlist.includes(p._id)).map((p) => (
            <ProductCard key={p._id} p={p} />
          ))}
        </div>
      )}
    </div>
  );
}
