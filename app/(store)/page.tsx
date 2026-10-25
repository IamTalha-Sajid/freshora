import Link from "next/link";
import { BundleCard } from "@/components/BundleCard";
import { Countdown } from "@/components/Countdown";
import { HeroCarousel } from "@/components/HeroCarousel";
import { Icon } from "@/components/Icon";
import { NewsletterForm } from "@/components/NewsletterForm";
import { ProductCard } from "@/components/ProductCard";
import { SaleCard } from "@/components/SaleCard";
import { getBundles, getCategories, getFeaturedProducts, getLatestReviews, getSaleProducts } from "@/lib/data";
import { getSettings, type TrustItem } from "@/lib/models/Settings";
import { formatPKR } from "@/lib/pricing";

function Section({ id, title, href, linkLabel = "View all", children }: { id?: string; title: string; href?: string; linkLabel?: string; children: React.ReactNode }) {
  return (
    <section id={id} className="container-x mt-[72px] scroll-mt-32">
      <div className="mb-5 flex flex-wrap items-baseline justify-between gap-4">
        <h2 className="title-section">{title}</h2>
        {href && (
          <Link href={href} className="inline-flex min-h-11 items-center text-sm font-bold text-link hover:underline">
            {linkLabel} →
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}

function Stars({ n, size = 16 }: { n: number; size?: number }) {
  return (
    <span className="flex gap-0.5" role="img" aria-label={`Rated ${n} out of 5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Icon key={i} name="star" size={size} fill="currentColor" stroke="none" className={i < Math.round(n) ? "text-warning" : "text-star-off"} />
      ))}
    </span>
  );
}

function WhyBlock({ title, text, right = false }: { title: string; text: string; right?: boolean }) {
  return (
    <div className={`flex items-start gap-3.5 ${right ? "min-[1025px]:flex-row-reverse min-[1025px]:text-right" : ""}`}>
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-surface-alt text-link">
        <Icon name="check" size={18} strokeWidth={2.6} />
      </span>
      <div className="flex flex-col gap-1.5">
        <h3 className="text-lg font-bold">{title}</h3>
        <p className="text-pretty text-sm text-fg-2">{text}</p>
      </div>
    </div>
  );
}

export default async function Home() {
  const [settings, categories, featured, sale, bundles, reviews] = await Promise.all([
    getSettings(),
    getCategories(),
    getFeaturedProducts(10),
    getSaleProducts(8),
    getBundles(),
    getLatestReviews(6),
  ]);
  const title = (id: string) => settings.homeSections.find((s) => s.id === id)?.title ?? id;
  const on = (id: string) => !!settings.homeSections.find((s) => s.id === id)?.enabled;
  const concerns = categories.filter((c) => c.featured);
  const countdownActive = settings.saleCountdownEnd && new Date(settings.saleCountdownEnd) > new Date();
  const half = Math.ceil(settings.whyItems.length / 2);
  const whyLeft = settings.whyItems.slice(0, half);
  const whyRight = settings.whyItems.slice(half);

  // Only things the store actually offers; admin can replace these in Settings.
  const trust: TrustItem[] = settings.trustItems.length
    ? settings.trustItems
    : [
        settings.freeShippingThreshold > 0
          ? { icon: "truck", title: "Free shipping", text: `On orders over ${formatPKR(settings.freeShippingThreshold)}` }
          : { icon: "truck", title: "Delivered to your door", text: "Across the country" },
        { icon: "cash", title: "Cash on delivery", text: "Pay when your order arrives" },
        { icon: "track", title: "Track your order", text: "Use your order number any time" },
      ];

  const sections: Record<string, React.ReactNode> = {
    categories:
      concerns.length > 0 && (
        <Section title={title("categories")} href="/shop" linkLabel="All products">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-[repeat(auto-fit,minmax(170px,1fr))]">
            {concerns.map((c) => (
              <Link key={c._id} href={`/category/${c.slug}`} className="card card-hover group flex flex-col gap-7 p-[18px] hover:!border-mint">
                <span className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-[10px] bg-surface-alt text-link">
                  {c.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={c.image} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <Icon name={c.icon || "tooth"} size={22} />
                  )}
                </span>
                <span className="flex items-center justify-between gap-2">
                  <span className="text-base font-bold">{c.name}</span>
                  <Icon name="chevron-right" size={18} className="shrink-0 text-muted transition-colors group-hover:text-link" />
                </span>
              </Link>
            ))}
          </div>
        </Section>
      ),
    featured:
      featured.length > 0 && (
        <Section title={title("featured")} href="/shop">
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-[repeat(auto-fill,minmax(250px,1fr))]">
            {featured.map((p) => (
              <ProductCard key={p._id} p={p} />
            ))}
          </div>
        </Section>
      ),
    why:
      settings.whyItems.length > 0 && (
        <section className="container-x mt-[88px]">
          <div className="mx-auto mb-10 flex max-w-[620px] flex-col gap-2.5 text-center">
            <h2 className="text-balance font-display text-[clamp(1.75rem,3vw,2.5rem)] font-bold">{title("why")}</h2>
          </div>
          <div className={`grid items-center gap-[clamp(24px,4vw,56px)] max-[1024px]:mx-auto max-[1024px]:max-w-[520px] ${settings.whyImage ? "min-[1025px]:grid-cols-[minmax(0,1fr)_minmax(240px,300px)_minmax(0,1fr)]" : "min-[1025px]:grid-cols-2"}`}>
            <div className="flex flex-col gap-9">
              {whyLeft.map((w, i) => (
                <WhyBlock key={i} {...w} />
              ))}
            </div>
            {settings.whyImage && (
              <div className="aspect-[9/16] overflow-hidden rounded-[20px] border border-line bg-surface-alt shadow-[0_24px_48px_rgb(6_20_27/0.14)] max-[1024px]:order-first max-[1024px]:aspect-[4/3]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={settings.whyImage} alt="" className="h-full w-full object-cover" loading="lazy" />
              </div>
            )}
            <div className="flex flex-col gap-9">
              {whyRight.map((w, i) => (
                <WhyBlock key={i} {...w} right />
              ))}
            </div>
          </div>
        </section>
      ),
    compare:
      settings.compareRows.length > 0 && (
        <section className="container-x mt-[88px]">
          <div className="mx-auto mb-8 flex max-w-[620px] flex-col gap-2.5 text-center">
            <h2 className="text-balance font-display text-[clamp(1.75rem,3vw,2.5rem)] font-bold">{title("compare")}</h2>
          </div>
          <div role="table" aria-label="Freshora compared with others" className="mx-auto max-w-[820px] overflow-hidden rounded-2xl border border-line bg-surface">
            <div role="row" className="grid grid-cols-[minmax(0,1.6fr)_minmax(96px,1fr)_minmax(96px,1fr)] text-[13px] font-bold uppercase tracking-[0.06em]">
              <span role="columnheader" className="px-[22px] py-[18px] text-muted">
                Features
              </span>
              <span role="columnheader" className="flex justify-center bg-[var(--btn-bg)] px-3 py-[18px] text-[var(--btn-fg)]">
                Freshora
              </span>
              <span role="columnheader" className="flex justify-center px-3 py-[18px] text-muted">
                Others
              </span>
            </div>
            {settings.compareRows.map((row, i) => (
              <div key={i} role="row" className="grid grid-cols-[minmax(0,1.6fr)_minmax(96px,1fr)_minmax(96px,1fr)] items-stretch border-t border-line-soft">
                <span role="cell" className="px-[22px] py-[18px] text-[15px] font-bold">
                  {row}
                </span>
                <span role="cell" aria-label="Yes" className="flex items-center justify-center bg-surface-alt">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--btn-bg)] text-[var(--btn-fg)]">
                    <Icon name="check" size={15} strokeWidth={3} />
                  </span>
                </span>
                <span role="cell" aria-label="No" className="flex items-center justify-center">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-line-soft text-muted">
                    <Icon name="close" size={13} strokeWidth={3} />
                  </span>
                </span>
              </div>
            ))}
          </div>
        </section>
      ),
    sale:
      sale.length > 0 && (
        <section className="container-x mt-[72px]">
          <div className="rounded-[20px] bg-navy p-[clamp(24px,3.5vw,44px)] text-white">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-5">
              <div className="flex flex-col gap-1.5">
                <h2 className="title-section">{title("sale")}</h2>
                <span className="text-sm text-[#cfe3e6]">{countdownActive ? "Prices valid until the timer runs out." : "Reduced prices while stock lasts."}</span>
              </div>
              <div className="flex flex-wrap items-center gap-5">
                {countdownActive && <Countdown end={settings.saleCountdownEnd as unknown as string} />}
                <Link href="/shop?sale=1" className="inline-flex min-h-11 items-center text-sm font-bold text-mint hover:underline">
                  View all →
                </Link>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-[repeat(auto-fill,minmax(260px,1fr))]">
              {sale.map((p) => (
                <SaleCard key={p._id} p={p} />
              ))}
            </div>
          </div>
        </section>
      ),
    bundles:
      bundles.length > 0 && (
        <Section id="bundles" title={title("bundles")} href="/shop" linkLabel="All products">
          <div className="grid gap-4 md:grid-cols-[repeat(auto-fit,minmax(300px,1fr))]">
            {bundles.map((b) => (
              <BundleCard key={b._id} b={b} />
            ))}
          </div>
        </Section>
      ),
    reviews:
      reviews.length > 0 && (
        <Section title={title("reviews")}>
          <div className="grid gap-4 md:grid-cols-[repeat(auto-fit,minmax(280px,1fr))]">
            {reviews.map((r) => (
              <figure key={r._id} className="flex flex-col gap-3.5 rounded-2xl border border-line bg-surface p-6">
                <Stars n={r.rating} />
                <blockquote className="line-clamp-5 text-pretty text-base font-medium leading-[1.55]">{r.comment}</blockquote>
                <figcaption className="mt-auto flex flex-col gap-0.5 border-t border-line-soft pt-3.5 text-[13px]">
                  <b className="text-sm">{r.name}</b>
                  {r.product && (
                    <span className="text-muted">
                      Reviewed{" "}
                      <Link href={`/product/${r.product.slug}`} className="link -my-3 inline-block py-3">
                        {r.product.name}
                      </Link>
                    </span>
                  )}
                </figcaption>
              </figure>
            ))}
          </div>
        </Section>
      ),
    newsletter: (
      <section className="container-x mt-[72px]">
        <div className="grid items-center gap-6 rounded-[20px] bg-surface-alt p-[clamp(24px,3.5vw,44px)] md:grid-cols-2">
          <div className="flex flex-col gap-2">
            <h2 className="title-section">{title("newsletter")}</h2>
            <p className="max-w-[460px] text-fg-2">New products and offers from Freshora, sent to your inbox.</p>
          </div>
          <NewsletterForm />
        </div>
      </section>
    ),
    // Rendered under the hero, whatever its position in the saved order.
    trust: null,
  };

  return (
    <>
      <HeroCarousel />
      {on("trust") && (
        <section className="container-x mt-4">
          <div className="grid overflow-hidden rounded-2xl border border-line bg-surface sm:grid-cols-[repeat(auto-fit,minmax(220px,1fr))]">
            {trust.map((t, i) => (
              <div key={i} className="-ml-px flex items-center gap-3.5 border-l border-line-soft px-[22px] py-[18px] max-sm:border-l-0 max-sm:border-t max-sm:first:border-t-0">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-surface-alt text-link">
                  <Icon name={t.icon} />
                </span>
                <div className="flex flex-col leading-snug">
                  <b className="text-sm">{t.title}</b>
                  {t.text && <span className="text-[13px] text-muted">{t.text}</span>}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
      {settings.homeSections
        .filter((s) => s.enabled)
        .map((s) => (
          <div key={s.id}>{sections[s.id]}</div>
        ))}
    </>
  );
}
