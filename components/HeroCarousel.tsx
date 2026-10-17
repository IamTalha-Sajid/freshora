"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Icon } from "@/components/Icon";
import type { PProduct } from "@/lib/data";
import { effectivePrice, formatPKR, isOnSale } from "@/lib/pricing";

type Slide = { _id: string; image: string; headline: string; subtext?: string; ctaLabel?: string; ctaLink?: string };

const FALLBACK: Slide = {
  _id: "fallback",
  image: "",
  headline: "Fresh breath. Calm, clinical care.",
  subtext: "Dental and oral-care essentials, picked with care and delivered to your door.",
  ctaLabel: "Shop now",
  ctaLink: "/shop",
};

export function HeroCarousel({ slides, featured }: { slides: Slide[]; featured?: PProduct | null }) {
  const list = slides.length ? slides : [FALLBACK];
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (list.length < 2 || paused) return;
    const t = setInterval(() => setI((n) => (n + 1) % list.length), 6500);
    return () => clearInterval(t);
  }, [list.length, paused]);

  const sale = featured && isOnSale(featured);

  return (
    <section
      className="relative -mt-[var(--hdr-pad)] overflow-hidden bg-navy text-white"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription="carousel"
      aria-label="Featured"
    >
      {/* Background: admin image under a navy → teal gradient, plus droplet shapes */}
      {list.map((s, idx) => (
        <div key={s._id} aria-hidden className={`absolute inset-0 transition-opacity duration-700 ${idx === i ? "opacity-100" : "opacity-0"}`}>
          {s.image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={s.image} alt="" className="h-full w-full object-cover" />
          )}
          <div className="absolute inset-0 bg-gradient-to-br from-navy/95 via-navy/75 to-teal/60" />
        </div>
      ))}
      <div aria-hidden className="pointer-events-none absolute -right-32 -top-24 h-[34rem] w-[34rem] animate-float rounded-full bg-gradient-to-br from-teal to-mint opacity-40 blur-2xl" />
      <div aria-hidden className="pointer-events-none absolute -bottom-40 -left-24 h-[26rem] w-[26rem] animate-float rounded-full bg-mint opacity-20 blur-3xl [animation-delay:-4s]" />

      <div className="container-x relative grid min-h-svh items-center gap-10 pb-24 pt-[calc(var(--hdr-pad)+24px)] md:pb-16 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="relative min-h-[260px]">
          {list.map((s, idx) => (
            <div key={s._id} className={`transition-all duration-700 ${idx === i ? "relative translate-y-0 opacity-100" : "pointer-events-none absolute inset-0 translate-y-3 opacity-0"}`} aria-hidden={idx !== i}>
              <span className="chip !bg-white/15 !text-white">Fresh · Clean · Confident</span>
              <h1 className="mt-4 max-w-xl text-4xl sm:text-5xl lg:text-5xl xl:text-5xl">{s.headline}</h1>
              {s.subtext && <p className="mt-4 max-w-lg text-lg text-white/85">{s.subtext}</p>}
              <div className="mt-7 flex flex-wrap gap-3">
                {s.ctaLabel && s.ctaLink && (
                  <Link href={s.ctaLink} className="btn-mint !px-7 !py-3 !text-base" tabIndex={idx === i ? 0 : -1}>
                    {s.ctaLabel}
                  </Link>
                )}
                <Link href="/shop?sale=1" className="inline-flex min-h-11 items-center rounded-full border border-white/40 px-6 py-3 text-base font-semibold text-white transition hover:bg-white/15" tabIndex={idx === i ? 0 : -1}>
                  See deals
                </Link>
              </div>
            </div>
          ))}

          {list.length > 1 && (
            <div className="mt-8 flex items-center gap-3">
              <button aria-label="Previous slide" onClick={() => setI((i - 1 + list.length) % list.length)} className="flex h-11 w-11 items-center justify-center rounded-full border border-white/30 hover:bg-white/15">
                <Icon name="chevron-left" />
              </button>
              <div className="flex gap-2">
                {list.map((s, idx) => (
                  <button key={s._id} aria-label={`Go to slide ${idx + 1}`} aria-current={idx === i} onClick={() => setI(idx)} className="flex h-6 items-center">
                    <span className={`block h-2 rounded-full transition-all duration-300 ${idx === i ? "w-7 bg-mint" : "w-2 bg-white/50"}`} />
                  </button>
                ))}
              </div>
              <button aria-label="Next slide" onClick={() => setI((i + 1) % list.length)} className="flex h-11 w-11 items-center justify-center rounded-full border border-white/30 hover:bg-white/15">
                <Icon name="chevron-right" />
              </button>
            </div>
          )}
        </div>

        {/* Featured product on a droplet backdrop, with a glass overlay card */}
        {featured && (
          <div className="relative mx-auto w-full max-w-md lg:max-w-none">
            <div className="relative mx-auto aspect-square w-full max-w-[460px] rounded-[48%_52%_55%_45%/50%_45%_55%_50%] bg-gradient-to-br from-navy via-teal to-mint p-8 shadow-[0_0_80px_rgb(43_193_177/0.35)]">
              <div aria-hidden className="absolute left-[12%] top-[8%] h-10 w-10 rounded-full bg-white/25 blur-[1px]" />
              <div aria-hidden className="absolute bottom-[14%] right-[6%] h-6 w-6 rounded-full bg-white/25" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={featured.images[0]} alt={featured.name} className="h-full w-full object-contain drop-shadow-[0_20px_30px_rgba(6,20,27,0.35)]" />
            </div>
            <div className="glass-strong mx-auto -mt-14 w-[88%] max-w-sm rounded-2xl p-4 text-fg">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">{sale ? "On sale now" : "Featured"}</p>
              <p className="mt-0.5 line-clamp-1 font-display text-lg font-bold">{featured.name}</p>
              <div className="mt-2 flex items-center justify-between gap-3">
                <div className="flex items-baseline gap-2">
                  <span className="tabular text-xl font-bold">{formatPKR(effectivePrice(featured))}</span>
                  {sale && <span className="tabular text-sm text-muted line-through">{formatPKR(featured.price)}</span>}
                </div>
                <Link href={`/product/${featured.slug}`} className="btn !px-5">
                  View
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
