"use client";

import { useEffect, useRef, useState } from "react";

const INTERVAL = 3000;
const SWIPE_MIN = 40; // px of horizontal travel that counts as a swipe

export function Gallery({ images, alt, badge }: { images: string[]; alt: string; badge?: string }) {
  const [i, setI] = useState(0);
  const [hover, setHover] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [tick, setTick] = useState(0); // bumps on manual changes so the 3s timer restarts
  const touch = useRef<{ x: number; y: number } | null>(null);
  const many = images.length > 1;

  const go = (n: number) => {
    setI(((n % images.length) + images.length) % images.length);
    setTick((t) => t + 1);
  };

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const on = () => setReduced(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);

  useEffect(() => {
    if (!many || hover || reduced) return;
    const id = setInterval(() => {
      if (!document.hidden) setI((n) => (n + 1) % images.length);
    }, INTERVAL);
    return () => clearInterval(id);
  }, [many, hover, reduced, tick, images.length]);

  function onTouchStart(e: React.TouchEvent) {
    const t = e.touches[0];
    touch.current = { x: t.clientX, y: t.clientY };
  }
  function onTouchEnd(e: React.TouchEvent) {
    const start = touch.current;
    touch.current = null;
    if (!start || !many) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - start.x;
    // Only a mostly-horizontal swipe changes the image, so vertical page scrolling still works.
    if (Math.abs(dx) >= SWIPE_MIN && Math.abs(dx) > Math.abs(t.clientY - start.y)) go(i + (dx < 0 ? 1 : -1));
  }

  return (
    <div className="flex w-full max-w-[640px] flex-col gap-3 md:grid md:grid-cols-[64px_minmax(0,1fr)] md:items-start">
      {many && (
        <div className="order-2 flex gap-2.5 overflow-x-auto md:order-none md:flex-col md:overflow-visible">
          {images.map((src, idx) => (
            <button
              key={src}
              type="button"
              onClick={() => go(idx)}
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
      <div
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        className={`relative aspect-square w-full max-w-[560px] touch-pan-y overflow-hidden rounded-2xl border border-line bg-surface-alt ${many ? "" : "md:col-span-2"}`}
      >
        {images.map((src, idx) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={src}
            src={src}
            alt={idx === i ? alt : ""}
            aria-hidden={idx !== i}
            draggable={false}
            className={`absolute inset-0 h-full w-full select-none object-cover transition-opacity duration-500 ${idx === i ? "opacity-100" : "opacity-0"}`}
          />
        ))}
        {badge && <span className="chip-sale absolute left-4 top-4 z-10 !px-2.5 !py-1 text-[13px]">{badge}</span>}
        {many && (
          <div className="absolute inset-x-0 bottom-3 z-10 flex justify-center gap-1.5 md:hidden" aria-hidden>
            {images.map((_, idx) => (
              <span key={idx} className={`h-1.5 rounded-full bg-white shadow transition-all ${idx === i ? "w-5 opacity-100" : "w-1.5 opacity-60"}`} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
