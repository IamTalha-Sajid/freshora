"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Countdown } from "@/components/Countdown";
import { Hero3D } from "@/components/Hero3D";
import { Icon } from "@/components/Icon";
import type { PProduct } from "@/lib/data";
import type { TrustItem } from "@/lib/models/Settings";
import { effectivePrice, formatPKR, isOnSale } from "@/lib/pricing";

type Slide = { _id: string; image: string; headline: string; subtext?: string; ctaLabel?: string; ctaLink?: string };

const AUTOPLAY_MS = 6500;

const FALLBACK: Slide = {
  _id: "fallback",
  image: "",
  headline: "Fresh breath. Calm, clinical care.",
  subtext: "Dental and oral-care essentials, picked with care and delivered to your door.",
  ctaLabel: "Shop now",
  ctaLink: "/shop",
};

/** Each slide recolours the 3D rim light, the bubbles and the background glow: mint, amber, sky. */
const TINTS = [
  { rim: 0x4fd3c4, bubble: 0xbff3ec, glow: "#2bc1b1" },
  { rim: 0xf3b562, bubble: 0xffe3b8, glow: "#e0a63b" },
  { rim: 0x6fb8ff, bubble: 0xc6e2ff, glow: "#4f9bff" },
];

/** Accent the second sentence of a headline ("Fresh breath. Calm, clinical care." -> mint "Calm, clinical care."). */
function Headline({ text }: { text: string }) {
  const cut = text.indexOf(". ");
  if (cut < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, cut + 1)} <span className="text-mint">{text.slice(cut + 2)}</span>
    </>
  );
}

const subscribeMotion = (cb: () => void) => {
  const m = window.matchMedia("(prefers-reduced-motion: reduce)");
  m.addEventListener("change", cb);
  return () => m.removeEventListener("change", cb);
};
const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

type Props = {
  slides: Slide[];
  featured?: PProduct | null;
  trust: TrustItem[];
  reviewStats?: { count: number; average: number };
  sale?: { maxDiscount: number; end: string | null } | null;
};

export function HeroCarousel({ slides, featured, trust, reviewStats, sale }: Props) {
  const list = slides.length ? slides : [FALLBACK];
  const [i, setI] = useState(0);
  const [hover, setHover] = useState(false);
  const [focus, setFocus] = useState(false);
  const [hint, setHint] = useState(true);
  const stage = useRef<HTMLDivElement>(null);
  const reduce = useSyncExternalStore(subscribeMotion, reducedMotion, () => false);

  const paused = hover || focus;
  const autoplay = list.length > 1 && !reduce;
  const tint = TINTS[i % TINTS.length];
  const onSale = featured && isOnSale(featured);

  useEffect(() => {
    const t = setTimeout(() => setHint(false), 5000);
    return () => clearTimeout(t);
  }, []);

  const next = () => setI((n) => (n + 1) % list.length);
  const prev = () => setI((n) => (n - 1 + list.length) % list.length);

  // Chips drift against the pointer so they feel like they float in front of the tooth.
  const onStageMove = (e: React.PointerEvent) => {
    const el = stage.current;
    if (!el || e.pointerType !== "mouse") return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--px", String(((e.clientX - r.left) / r.width - 0.5) * 2));
    el.style.setProperty("--py", String(((e.clientY - r.top) / r.height - 0.5) * 2));
  };
  const onStageLeave = () => {
    stage.current?.style.setProperty("--px", "0");
    stage.current?.style.setProperty("--py", "0");
  };

  const showDiscount = !!sale && sale.maxDiscount > 0;
  const chipTrust = trust.slice(0, showDiscount ? 1 : 2);
  const stripTrust = trust.slice(0, 4);

  const glassCard =
    "absolute bottom-7 left-0 hidden w-[300px] max-w-[80%] items-center gap-4 rounded-[22px] bg-white/90 p-4 text-[#0d2b3a] shadow-[0_12px_32px_rgb(6_20_27/0.25)] backdrop-blur-xl transition hover:-translate-y-0.5 sm:flex";

  return (
    <section
      className="relative -mt-[var(--hdr-pad)] overflow-hidden text-white [background:radial-gradient(120%_90%_at_75%_40%,#158c96_0%,#12435c_45%,#06141b_100%)]"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onFocus={() => setFocus(true)}
      onBlur={() => setFocus(false)}
      aria-roledescription="carousel"
      aria-label="Featured"
    >
      {TINTS.map((t, n) => (
        <div
          key={t.glow}
          aria-hidden
          style={{ backgroundColor: t.glow }}
          className={`pointer-events-none absolute right-[6%] top-[18%] h-[520px] w-[520px] rounded-full blur-[90px] transition-opacity duration-300 ${n === i % TINTS.length ? "opacity-[0.28]" : "opacity-0"}`}
        />
      ))}

      <div className="relative mx-auto grid min-h-[min(720px,100svh)] max-w-[1920px] items-center gap-4 px-4 pb-16 pt-[calc(var(--hdr-pad)+16px)] sm:gap-6 sm:px-[clamp(16px,4vw,56px)] sm:pt-[calc(var(--hdr-pad)+36px)] lg:grid-cols-2">
        <div className="relative z-[2] flex flex-col gap-5">
          {sale ? (
            <Link
              href="/shop?sale=1"
              className="inline-flex min-h-11 items-center gap-2.5 self-start rounded-full border border-white/20 bg-white/10 px-4 text-sm font-semibold text-white transition hover:bg-white/15"
            >
              <span className="h-2 w-2 rounded-full bg-[#f3b562]" />
              <span>{showDiscount ? `Up to ${sale.maxDiscount}% off` : "Deals on now"}</span>
              {sale.end && (
                <>
                  <span aria-hidden className="text-white/40">
                    ·
                  </span>
                  <span className="text-white/80">
                    ends in <Countdown end={sale.end} compact />
                  </span>
                </>
              )}
            </Link>
          ) : (
            <p className="flex min-h-11 items-center gap-2 self-start text-sm font-semibold text-white/80">
              <span className="h-2 w-2 rounded-full bg-mint" />
              Fresh · Clean · Confident
            </p>
          )}

          <div className="relative">
            {list.map((s, idx) => (
              <div key={s._id} className={`transition-[opacity,transform] duration-300 ${idx === i ? "relative translate-y-0 opacity-100" : "pointer-events-none absolute inset-0 translate-y-3 opacity-0"}`} aria-hidden={idx !== i}>
                <h1 className="text-balance text-[clamp(2.25rem,6vw,5rem)] font-semibold">
                  <Headline text={s.headline} />
                </h1>
                {s.subtext && <p className="mt-5 max-w-[480px] text-pretty text-[19px] leading-[1.55] text-white/80">{s.subtext}</p>}
                <div className="mt-6 flex flex-wrap gap-3">
                  {s.ctaLabel && s.ctaLink && (
                    <Link href={s.ctaLink} className="btn-arrow" tabIndex={idx === i ? 0 : -1}>
                      {s.ctaLabel}
                      <span className="nub">
                        <Icon name="chevron-right" size={16} strokeWidth={2.4} />
                      </span>
                    </Link>
                  )}
                  <Link href="/shop?sale=1" className="inline-flex min-h-11 items-center rounded-full border border-white/35 px-6 py-3.5 text-base font-semibold text-white transition hover:bg-white/10" tabIndex={idx === i ? 0 : -1}>
                    See deals
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Social proof on the left, slide controls on the right */}
          <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
            {reviewStats && reviewStats.count > 0 ? (
              <p className="flex items-center gap-2.5 text-sm text-white/80">
                <span className="flex gap-0.5 text-warning" aria-hidden>
                  {Array.from({ length: 5 }, (_, n) => (
                    <Icon key={n} name="star" size={16} fill="currentColor" />
                  ))}
                </span>
                <span>
                  <b className="tabular font-semibold text-white">{reviewStats.average.toFixed(1)}</b> from {reviewStats.count} {reviewStats.count === 1 ? "review" : "reviews"}
                </span>
              </p>
            ) : (
              <span />
            )}

            {list.length > 1 && (
              <div className="flex items-center rounded-full border border-white/25 p-0.5">
                <button aria-label="Previous slide" onClick={prev} className="flex h-11 w-11 items-center justify-center rounded-full transition hover:bg-white/10">
                  <Icon name="chevron-left" />
                </button>
                <div className="flex px-1">
                  {list.map((s, idx) => (
                    <button key={s._id} aria-label={`Go to slide ${idx + 1}`} aria-current={idx === i} onClick={() => setI(idx)} className="flex h-11 min-w-6 items-center justify-center px-1">
                      <span className={`relative block h-2 overflow-hidden rounded-full ${idx === i ? "w-9 bg-white/30" : "w-2 bg-white/50"}`}>
                        {idx === i && (
                          <span
                            key={i}
                            className="absolute inset-0 origin-left bg-mint"
                            style={autoplay ? { animation: `hero-fill ${AUTOPLAY_MS}ms linear forwards`, animationPlayState: paused ? "paused" : "running" } : undefined}
                            onAnimationEnd={next}
                          />
                        )}
                      </span>
                    </button>
                  ))}
                </div>
                <button aria-label="Next slide" onClick={next} className="flex h-11 w-11 items-center justify-center rounded-full transition hover:bg-white/10">
                  <Icon name="chevron-right" />
                </button>
              </div>
            )}
          </div>

          {stripTrust.length > 0 && (
            <ul className={`flex flex-wrap gap-x-7 gap-y-3 border-t border-white/10 pt-5 text-sm text-white/80 ${trust.length <= chipTrust.length ? "lg:hidden" : ""}`}>
              {stripTrust.map((t, n) => (
                <li key={n} className={`flex items-center gap-2 ${n < chipTrust.length ? "lg:hidden" : ""}`}>
                  <Icon name={t.icon} size={18} className="text-mint" />
                  {t.title}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* 3D stage: draggable tooth with bubbles, floating chips, and a glass card for the featured product */}
        <div ref={stage} onPointerMove={onStageMove} onPointerLeave={onStageLeave} className="relative order-first h-[240px] sm:h-[clamp(360px,52vw,620px)] lg:order-none">
          <Hero3D tint={tint} className="absolute -inset-x-[60px] top-0 block h-full w-[calc(100%+120px)] max-w-none sm:h-[calc(100%-96px)] lg:-top-10 lg:h-[calc(100%+60px)]" />

          <div aria-hidden className="pointer-events-none absolute inset-0 hidden lg:block">
            {showDiscount && (
              <Chip className="left-[2%] top-[14%]" delay="0s">
                <Icon name="tag" size={16} className="text-[#f3b562]" />
                Up to {sale.maxDiscount}% off
              </Chip>
            )}
            {chipTrust.map((t, n) => (
              <Chip key={n} className={n === 0 && !showDiscount ? "left-[2%] top-[14%]" : "right-[2%] top-[34%]"} delay={n === 0 && !showDiscount ? "0s" : "-2s"}>
                <Icon name={t.icon} size={16} className="text-mint" />
                {t.title}
              </Chip>
            ))}
          </div>

          {featured ? (
            <Link href={`/product/${featured.slug}`} className={glassCard}>
              <span className="h-16 w-16 shrink-0 overflow-hidden rounded-[14px] bg-[#e3f6f3]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {featured.images[0] && <img src={featured.images[0]} alt="" className="h-full w-full object-contain" />}
              </span>
              <span className="min-w-0 flex-1">
                <span className={`block text-xs font-semibold uppercase tracking-[0.08em] ${onSale ? "text-[#b3342f]" : "text-[#4a6573]"}`}>{onSale ? "On sale now" : "Featured"}</span>
                <span className="line-clamp-1 block font-display text-base font-semibold leading-tight">{featured.name}</span>
                <span className="tabular flex items-baseline gap-1.5">
                  <b className="text-base">{formatPKR(effectivePrice(featured))}</b>
                  {onSale && <span className="text-xs text-[#4a6573] line-through">{formatPKR(featured.price)}</span>}
                </span>
              </span>
              <ArrowNub />
            </Link>
          ) : (
            <Link href="/shop" className={glassCard}>
              <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[14px] bg-[#e3f6f3] text-[#158c96]">
                <Icon name="tooth" size={30} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-xs font-semibold uppercase tracking-[0.08em] text-[#4a6573]">Explore</span>
                <span className="block font-display text-base font-semibold leading-tight">Browse the range</span>
                <span className="block text-xs text-[#4a6573]">Shop by category</span>
              </span>
              <ArrowNub />
            </Link>
          )}

          <span className={`pointer-events-none absolute bottom-9 right-2 hidden items-center gap-2 text-xs font-semibold uppercase tracking-[0.06em] text-white transition-opacity duration-300 sm:flex ${hint ? "opacity-100" : "opacity-60"}`}>
            <span className="h-px w-6 bg-white/60" />
            Drag to spin
          </span>
        </div>
      </div>

      {/* Soft curved edge into the page below */}
      <div aria-hidden className="absolute inset-x-0 -bottom-px z-[3] h-8 rounded-t-[40px] bg-page" />
    </section>
  );
}

function ArrowNub() {
  return (
    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-navy text-white">
      <Icon name="chevron-right" size={18} strokeWidth={2.2} />
    </span>
  );
}

/** Glass pill that floats near the tooth and drifts slightly against the pointer. */
function Chip({ className, delay, children }: { className: string; delay: string; children: React.ReactNode }) {
  return (
    <span
      className={`absolute transition-transform duration-300 ease-out ${className}`}
      style={{ transform: "translate3d(calc(var(--px, 0) * -16px), calc(var(--py, 0) * -12px), 0)" }}
    >
      <span
        className="flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur-md"
        style={{ animation: "hero-float 5s ease-in-out infinite", animationDelay: delay }}
      >
        {children}
      </span>
    </span>
  );
}
