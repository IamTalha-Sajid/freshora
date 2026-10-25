"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Icon } from "@/components/Icon";

const SLIDE = "grid min-h-[440px] flex-[0_0_100%] items-center gap-10 px-[clamp(28px,5vw,72px)] pb-[88px] pt-14 max-[559px]:grid-cols-1 max-[559px]:px-6 max-[559px]:pb-[72px] max-[559px]:pt-8 min-[560px]:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]";
const CTA = "mt-2 flex h-[50px] items-center gap-2.5 rounded-lg px-6 font-extrabold transition-colors";
const H = "text-balance font-display text-[clamp(36px,4.6vw,64px)] font-extrabold leading-[1.1]";
const P = "max-w-[440px] text-pretty text-lg";
const CONTROL = "flex h-10 w-10 items-center justify-center rounded-lg bg-white/90 text-[#0d2b3a] transition-colors hover:bg-white";

/** Home hero: three fixed promotional slides. */
export function HeroCarousel() {
  const [slide, setSlide] = useState(0);
  const [hover, setHover] = useState(false);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [tick, setTick] = useState(0);

  const go = useCallback((i: number) => {
    setSlide((i + 3) % 3);
    setTick((t) => t + 1);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const on = () => setReduced(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);

  const playing = !paused && !reduced;
  useEffect(() => {
    if (!playing || hover) return;
    const id = setInterval(() => {
      if (!document.hidden) setSlide((s) => (s + 1) % 3);
    }, 6000);
    return () => clearInterval(id);
  }, [playing, hover, tick]);

  return (
    <section className="container-x mt-6">
      <div aria-roledescription="carousel" aria-label="Promotions" onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} className="relative overflow-hidden rounded-[20px]">
        <div className="flex transition-transform duration-[600ms] ease-[cubic-bezier(.65,0,.35,1)]" style={{ transform: `translateX(-${slide * 100}%)` }}>
          <div role="group" aria-label="Slide 1 of 3" inert={slide !== 0} className={`${SLIDE} bg-navy text-white`}>
            <div className="flex flex-col items-start gap-5">
              <span className="text-[13px] font-bold uppercase tracking-[0.08em] text-[#7fe0d4]">The Freshora range</span>
              <h1 className={H}>Oral care under our own name.</h1>
              <p className={`${P} text-[#d6e6ea]`}>Toothpaste, brushes, floss and mouthwash, made for everyday routines and delivered to your door.</p>
              <Link href="/shop" className={`${CTA} bg-mint text-[#06141b] hover:bg-[#4fd3c4]`}>
                Shop Freshora <Icon name="arrow-right" size={18} strokeWidth={2.4} />
              </Link>
            </div>
            <div aria-hidden className="flex flex-col items-end text-right font-display text-[clamp(40px,5.4vw,84px)] font-extrabold leading-[0.98] tracking-[-0.04em] max-[559px]:hidden">
              <span className="text-white">Toothpaste</span>
              <span className="text-mint">Brushes</span>
              <span className="text-[#5b8aa0]">Floss</span>
              <span className="text-[#2f6683]">Mouthwash</span>
            </div>
          </div>

          <div role="group" aria-label="Slide 2 of 3" inert={slide !== 1} className={`${SLIDE} bg-mint text-[#06141b]`}>
            <div className="flex flex-col items-start gap-5">
              <span className="text-[13px] font-bold uppercase tracking-[0.08em]">Deals this week</span>
              <h2 className={H}>Up to 25% off our bestsellers.</h2>
              <p className={`${P} text-[#0d2b3a]`}>Whitening toothpaste, charcoal brushes and flosser tips at reduced prices while stock lasts.</p>
              <Link href="/shop?sale=1" className={`${CTA} bg-[#06141b] text-white hover:bg-navy`}>
                Shop deals <Icon name="arrow-right" size={18} strokeWidth={2.4} />
              </Link>
            </div>
            <div aria-hidden className="flex justify-end font-display text-[clamp(120px,17vw,260px)] font-extrabold leading-[0.85] tracking-[-0.06em] max-[559px]:hidden">
              25<span className="text-[0.45em] leading-[1.3]">%</span>
            </div>
          </div>

          <div role="group" aria-label="Slide 3 of 3" inert={slide !== 2} className={`${SLIDE} bg-surface-alt text-fg`}>
            <div className="flex flex-col items-start gap-5">
              <span className="text-[13px] font-bold uppercase tracking-[0.08em] text-link">Bundles</span>
              <h2 className={H}>Your whole routine in one order.</h2>
              <p className={`${P} text-fg-2`}>Ready-made kits for daily care, sensitive teeth and the whole family.</p>
              <Link href="/#bundles" className={`${CTA} bg-[var(--btn-bg)] text-[var(--btn-fg)] hover:bg-[var(--btn-bg-hover)]`}>
                Browse bundles <Icon name="arrow-right" size={18} strokeWidth={2.4} />
              </Link>
            </div>
            <div aria-hidden className="flex flex-col items-end gap-3 max-[559px]:hidden">
              <span className="text-sm font-bold uppercase tracking-[0.08em] text-link">Save up to</span>
              <span className="font-display text-[clamp(100px,14vw,200px)] font-extrabold leading-[0.85] tracking-[-0.06em] text-[var(--btn-bg)]">18%</span>
            </div>
          </div>
        </div>

        <div className="absolute bottom-6 left-[clamp(28px,5vw,72px)] right-[clamp(16px,3vw,32px)] flex items-center gap-4">
          <div className="flex gap-2">
            {[0, 1, 2].map((i) => (
              <button
                key={i}
                type="button"
                aria-label={`Go to slide ${i + 1}`}
                aria-current={i === slide}
                onClick={() => go(i)}
                className={`h-2 rounded-full p-0 transition-[width] duration-300 ${i === slide ? "w-7 bg-white" : "w-2 bg-white/55"}`}
              />
            ))}
          </div>
          <div className="ml-auto flex gap-2">
            {!reduced && (
              <button type="button" aria-label={playing ? "Pause carousel" : "Play carousel"} onClick={() => setPaused((p) => !p)} className={CONTROL}>
                <Icon name={playing ? "pause" : "play"} size={16} fill="currentColor" stroke="none" />
              </button>
            )}
            <button type="button" aria-label="Previous slide" onClick={() => go(slide - 1)} className={CONTROL}>
              <Icon name="chevron-left" size={18} strokeWidth={2.4} />
            </button>
            <button type="button" aria-label="Next slide" onClick={() => go(slide + 1)} className={CONTROL}>
              <Icon name="chevron-right" size={18} strokeWidth={2.4} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
