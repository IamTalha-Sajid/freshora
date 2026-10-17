"use client";

import { useRef, type ReactNode } from "react";
import { Icon } from "@/components/Icon";

/** Scroll-snap carousel with arrow buttons (arrows hidden on touch, where swiping is natural). */
export function ProductCarousel({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const by = (dir: 1 | -1) => ref.current?.scrollBy({ left: dir * (ref.current.clientWidth * 0.8), behavior: "smooth" });
  const arrow = "absolute top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full glass md:flex hover:brightness-105";
  return (
    <div className="relative">
      <button aria-label="Scroll left" onClick={() => by(-1)} className={`${arrow} -left-4`}>
        <Icon name="chevron-left" />
      </button>
      <div ref={ref} className="scrollbar-none -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:px-6">
        {Array.isArray(children) ? children.map((c, i) => <div key={i} className="w-[220px] shrink-0 snap-start sm:w-[250px]">{c}</div>) : children}
      </div>
      <button aria-label="Scroll right" onClick={() => by(1)} className={`${arrow} -right-4`}>
        <Icon name="chevron-right" />
      </button>
    </div>
  );
}
