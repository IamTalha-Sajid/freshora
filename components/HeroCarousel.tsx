"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Icon } from "@/components/Icon";

const COUNT = 4;
const SLIDE = "relative grid min-h-[460px] flex-[0_0_100%] items-center gap-10 px-[clamp(28px,5vw,72px)] pb-[88px] pt-14 text-[#0d2b3a] max-[559px]:grid-cols-1 max-[559px]:px-6 max-[559px]:pb-[72px] max-[559px]:pt-8 min-[560px]:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]";
const TEXT = "relative z-[1] flex flex-col items-start gap-5";
const EYEBROW = "text-[13px] font-bold uppercase tracking-[0.08em]";
const H = "text-balance font-display text-[clamp(36px,4.6vw,64px)] font-extrabold leading-[1.1] text-[#0d2b3a]";
const P = "max-w-[440px] text-pretty text-lg";
const CTA = "mt-2 flex h-[50px] items-center gap-2.5 rounded-lg px-6 font-extrabold text-white transition-colors";
const PHOTO = "relative -mb-[88px] -mt-14 -mr-[clamp(28px,5vw,72px)] min-h-[460px] self-stretch max-[559px]:order-first max-[559px]:-mx-6 max-[559px]:-mt-8 max-[559px]:mb-0 max-[559px]:min-h-[260px]";
const PHOTO_IMG = "absolute inset-0 h-full w-full object-cover [-webkit-mask-image:linear-gradient(to_right,transparent_0,#000_22%)] [mask-image:linear-gradient(to_right,transparent_0,#000_22%)] max-[559px]:[-webkit-mask-image:linear-gradient(to_bottom,#000_70%,transparent)] max-[559px]:[mask-image:linear-gradient(to_bottom,#000_70%,transparent)]";
const CONTROL = "flex h-10 w-10 items-center justify-center rounded-lg border border-[#d3e8e5] bg-white text-[#0d2b3a] shadow-[0_1px_3px_rgba(13,43,58,.12)]";

function Cta({ href, className, children }: { href: string; className: string; children: string }) {
  return (
    <Link href={href} className={`${CTA} ${className}`}>
      {children} <Icon name="arrow-right" size={18} strokeWidth={2.4} />
    </Link>
  );
}

/** Home hero: four fixed product slides. */
export function HeroCarousel() {
  const [slide, setSlide] = useState(0);
  const [hover, setHover] = useState(false);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [tick, setTick] = useState(0);

  const go = useCallback((i: number) => {
    setSlide((i + COUNT) % COUNT);
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
      if (!document.hidden) setSlide((s) => (s + 1) % COUNT);
    }, 6000);
    return () => clearInterval(id);
  }, [playing, hover, tick]);

  return (
    <section className="container-x mt-6">
      <div aria-roledescription="carousel" aria-label="Promotions" onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} className="relative overflow-hidden rounded-[20px]">
        <div className="flex transition-transform duration-[600ms] ease-[cubic-bezier(.65,0,.35,1)]" style={{ transform: `translateX(-${slide * 100}%)` }}>
          <div role="group" aria-label="Slide 1 of 4" inert={slide !== 0} className={`${SLIDE} bg-[#f5f4fa]`}>
            <div className={TEXT}>
              <span className={`${EYEBROW} text-[#5b34b0]`}>New · V34 focus</span>
              <h1 className={H}>Teeth Whitening Powder</h1>
              <p className={`${P} text-[#36505d]`}>A brighter smile, every day. Purple whitening powder in a 30g jar.</p>
              <Cta href="/shop" className="bg-[#5b34b0] hover:bg-[#45278a]">Shop whitening</Cta>
            </div>
            <div className={PHOTO}>
              <img src="/hero/d.jpeg" alt="Freshora focus Teeth Whitening Powder, box and open jar" className={`${PHOTO_IMG} object-[center_55%]`} />
            </div>
          </div>

          <div role="group" aria-label="Slide 2 of 4" inert={slide !== 1} className={`${SLIDE} bg-[#fefefe]`}>
            <div className={TEXT}>
              <span className={`${EYEBROW} text-[#0f6f78]`}>Breath spray · 10ml</span>
              <h2 className={H}>Fresh breath in three flavours.</h2>
              <p className={`${P} text-[#36505d]`}>Grapes, Mint and Strawberry. Pocket-size spray for after coffee, meals and meetings.</p>
              <Cta href="/shop" className="bg-[#12435c] hover:bg-[#0d2b3a]">Shop breath sprays</Cta>
            </div>
            <div className="isolate -mb-[88px] -mt-14 flex items-center justify-center self-stretch max-[559px]:order-first max-[559px]:-mt-4 max-[559px]:mb-0">
              <img src="/hero/a.jpeg" alt="Freshora Grapes breath spray" className="relative z-[1] aspect-square w-[52%] object-cover mix-blend-multiply" />
              <img src="/hero/b.jpeg" alt="Freshora Mint breath spray" className="relative z-[2] mx-[-22%] aspect-square w-[60%] object-cover mix-blend-multiply" />
              <img src="/hero/c.jpeg" alt="Freshora Strawberry breath spray" className="relative z-[1] aspect-square w-[52%] object-cover mix-blend-multiply" />
            </div>
          </div>

          <div role="group" aria-label="Slide 3 of 4" inert={slide !== 2} className={`${SLIDE} bg-[#efe9df]`}>
            <div className={TEXT}>
              <span className={`${EYEBROW} text-[#7a5428]`}>Bamboo Toothbrush</span>
              <h2 className={H}>A brush with a bamboo handle.</h2>
              <p className={`${P} text-[#4a3b2a]`}>Charcoal-grey bristles on a natural bamboo handle, packed in a kraft paper box.</p>
              <Cta href="/shop" className="bg-[#12435c] hover:bg-[#0d2b3a]">Shop brushes</Cta>
            </div>
            <div className={PHOTO}>
              <img src="/hero/e.jpeg" alt="Freshora Bamboo Toothbrush with kraft box on stone" className={`${PHOTO_IMG} object-[center_50%]`} />
            </div>
          </div>

          <div role="group" aria-label="Slide 4 of 4" inert={slide !== 3} className={`${SLIDE} gap-6 overflow-hidden bg-white`}>
            <div className={`${TEXT} !z-[2]`}>
              <span className={`${EYEBROW} tracking-[0.14em] text-[#4a2ab0]`}>Purple whitening range</span>
              <h2 className="text-balance font-display text-[clamp(40px,5.2vw,76px)] font-extrabold leading-[0.98] tracking-[-0.035em] text-[#0d2b3a]">
                Whiter teeth.<br />
                <span className="text-[#4a2ab0]">Brighter you.</span>
              </h2>
              <div className="flex flex-wrap gap-2">
                {["Safe", "Effective", "Enamel friendly"].map((t) => (
                  <span key={t} className="flex h-8 items-center rounded-full border border-[#d9d0f5] bg-[#f6f3fe] px-3.5 text-[13px] font-bold text-[#38208a]">
                    {t}
                  </span>
                ))}
              </div>
              <Cta href="/shop" className="bg-[#4a2ab0] hover:bg-[#38208a]">Shop whitening</Cta>
            </div>
            <div role="img" aria-label="Freshora Purple Whitening Strips and Purple Teeth Whitening Foam" className={PHOTO}>
              <div aria-hidden className="absolute bottom-[13%] left-[6%] right-[4%] z-0 h-[30px] rounded-[50%] bg-[radial-gradient(closest-side,rgba(40,20,110,.22),rgba(40,20,110,0))]" />
              <img src="/hero/foam-cut.png" alt="" className="absolute bottom-[15%] right-[3%] z-[1] h-[78%] w-auto drop-shadow-[0_14px_20px_rgba(40,20,110,.14)]" />
              <img src="/hero/strips-box.png" alt="" className="absolute bottom-[13%] left-[4%] z-[2] h-[60%] w-auto drop-shadow-[0_16px_22px_rgba(40,20,110,.2)]" />
            </div>
          </div>
        </div>

        <div className="absolute bottom-6 left-[clamp(28px,5vw,72px)] right-[clamp(16px,3vw,32px)] flex items-center gap-4">
          <div className="flex gap-2">
            {Array.from({ length: COUNT }, (_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Go to slide ${i + 1}`}
                aria-current={i === slide}
                onClick={() => go(i)}
                className={`h-2 rounded-full p-0 transition-[width] duration-300 ${i === slide ? "w-7 bg-[#0d2b3a]" : "w-2 bg-[#0d2b3a]/25"}`}
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
