"use client";

import { useState } from "react";

export function Gallery({ images, alt }: { images: string[]; alt: string }) {
  const [i, setI] = useState(0);
  return (
    <div>
      <div className="aspect-square overflow-hidden rounded-3xl border border-line bg-surface-alt">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={images[i]} alt={alt} className="h-full w-full object-contain p-6" />
      </div>
      {images.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto">
          {images.map((src, idx) => (
            <button key={src} onClick={() => setI(idx)} aria-label={`Show image ${idx + 1}`} aria-current={idx === i} className={`h-[72px] w-[72px] shrink-0 overflow-hidden rounded-2xl border-2 bg-surface-alt transition ${idx === i ? "border-mint" : "border-transparent hover:border-line"}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="h-full w-full object-contain p-1.5" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
