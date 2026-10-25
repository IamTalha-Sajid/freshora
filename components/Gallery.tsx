"use client";

import { useState } from "react";

export function Gallery({ images, alt, badge }: { images: string[]; alt: string; badge?: string }) {
  const [i, setI] = useState(0);
  return (
    <div className="flex flex-col gap-3 md:grid md:grid-cols-[76px_minmax(0,1fr)] md:items-start lg:sticky lg:top-40">
      {images.length > 1 && (
        <div className="order-2 flex gap-2.5 overflow-x-auto md:order-none md:flex-col md:overflow-visible">
          {images.map((src, idx) => (
            <button
              key={src}
              type="button"
              onClick={() => setI(idx)}
              aria-label={`Show image ${idx + 1}`}
              aria-pressed={idx === i}
              className={`h-[76px] w-[76px] shrink-0 overflow-hidden rounded-[10px] border-2 bg-surface-alt p-0 transition-colors ${idx === i ? "border-mint" : "border-transparent hover:border-line"}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="h-full w-full object-contain p-1.5" />
            </button>
          ))}
        </div>
      )}
      <div className={`relative aspect-square overflow-hidden rounded-2xl border border-line bg-surface-alt ${images.length > 1 ? "" : "md:col-span-2"}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={images[i]} alt={alt} className="h-full w-full object-contain p-6" />
        {badge && <span className="chip-sale absolute left-4 top-4 !px-2.5 !py-1 text-[13px]">{badge}</span>}
      </div>
    </div>
  );
}
