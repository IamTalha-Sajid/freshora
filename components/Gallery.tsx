"use client";

import { useState } from "react";

export function Gallery({ images, alt, badge }: { images: string[]; alt: string; badge?: string }) {
  const [i, setI] = useState(0);
  return (
    <div className="mx-auto flex w-full max-w-[600px] flex-col gap-3 md:grid md:grid-cols-[64px_minmax(0,1fr)] md:items-start lg:sticky lg:top-40">
      {images.length > 1 && (
        <div className="order-2 flex gap-2.5 overflow-x-auto md:order-none md:flex-col md:overflow-visible">
          {images.map((src, idx) => (
            <button
              key={src}
              type="button"
              onClick={() => setI(idx)}
              aria-label={`Show image ${idx + 1}`}
              aria-pressed={idx === i}
              className={`h-16 w-16 shrink-0 overflow-hidden rounded-[10px] border-2 bg-surface-alt p-0 transition-colors ${idx === i ? "border-mint" : "border-transparent hover:border-line"}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="h-full w-full object-contain p-1.5" />
            </button>
          ))}
        </div>
      )}
      <div className={`relative mx-auto aspect-square max-h-[min(70vh,520px)] w-full overflow-hidden rounded-2xl border border-line bg-surface-alt ${images.length > 1 ? "" : "md:col-span-2"}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={images[i]} alt={alt} className="h-full w-full object-contain p-4" />
        {badge && <span className="chip-sale absolute left-4 top-4 !px-2.5 !py-1 text-[13px]">{badge}</span>}
      </div>
    </div>
  );
}
