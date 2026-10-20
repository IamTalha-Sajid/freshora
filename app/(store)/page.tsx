import Link from "next/link";
import { BundleCard } from "@/components/BundleCard";
import { Countdown } from "@/components/Countdown";
import { HeroCarousel } from "@/components/HeroCarousel";
import { Icon } from "@/components/Icon";
import { ProductCard } from "@/components/ProductCard";
import { ProductCarousel } from "@/components/ProductCarousel";
import { getBundles, getCategories, getFeaturedProducts, getHeroSlides, getLatestReviews, getReviewStats, getSaleProducts } from "@/lib/data";
import { getSettings, type TrustItem } from "@/lib/models/Settings";
import { effectivePrice, formatPKR } from "@/lib/pricing";

function Section({ id, eyebrow, title, href, linkLabel = "View all", children }: { id?: string; eyebrow: string; title: string; href?: string; linkLabel?: string; children: React.ReactNode }) {
  return (
    <section id={id} className="container-x mt-24 scroll-mt-28">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h2 className="title-section">{title}</h2>
        </div>
        {href && (
          <Link href={href} className="inline-flex min-h-11 items-center text-sm font-semibold text-link hover:underline">
            {linkLabel} →
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}

export default async function Home() {
  const [settings, slides, categories, featured, sale, bundles, reviews, reviewStats] = await Promise.all([
    getSettings(),
    getHeroSlides(),
    getCategories(),
    getFeaturedProducts(10),
    getSaleProducts(8),
    getBundles(),
    getLatestReviews(6),
    getReviewStats(),
  ]);
  const title = (id: string) => settings.homeSections.find((s) => s.id === id)?.title ?? id;
  const concerns = categories.filter((c) => c.featured);
  const countdownActive = settings.saleCountdownEnd && new Date(settings.saleCountdownEnd) > new Date();
  const maxDiscount = Math.round(Math.max(0, ...sale.map((p) => (p.price > 0 ? (1 - effectivePrice(p) / p.price) * 100 : 0))));

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
        <Section eyebrow="Categories" title={title("categories")} href="/shop" linkLabel="All products">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-[repeat(auto-fit,minmax(180px,1fr))]">
            {concerns.map((c) => (
              <Link
                key={c._id}
                href={`/category/${c.slug}`}
                className="card card-hover group flex min-h-[190px] flex-col justify-between p-6 hover:!border-mint"
              >
                <div className="flex items-start justify-between">
                  <span className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-[18px] bg-accent text-link">
                    {c.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={c.image} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <Icon name={c.icon || "tooth"} size={28} />
                    )}
                  </span>
                  <Icon name="arrow-up-right" size={20} className="text-muted transition group-hover:text-link" />
                </div>
                <span className="font-display text-[22px] font-semibold leading-[1.1] tracking-tight">{c.name}</span>
              </Link>
            ))}
          </div>
        </Section>
      ),
    featured:
      featured.length > 0 && (
        <Section eyebrow="Most loved" title={title("featured")} href="/shop">
          <ProductCarousel>
            {featured.map((p) => (
              <ProductCard key={p._id} p={p} />
            ))}
          </ProductCarousel>
        </Section>
      ),
    sale:
      sale.length > 0 && (
        <section className="container-x mt-24">
          <div className="relative overflow-hidden rounded-[36px] bg-gradient-to-br from-navy to-[#0d2b3a] p-[clamp(28px,4vw,56px)] text-white">
            <div aria-hidden className="pointer-events-none absolute -right-28 -top-28 h-[380px] w-[380px] rounded-full bg-mint opacity-25 blur-[70px]" />
            <div className="relative mb-8 flex flex-wrap items-end justify-between gap-6">
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.1em] text-mint">Limited time</p>
                <h2 className="title-section">{title("sale")}</h2>
              </div>
              <div className="flex flex-wrap items-center gap-5">
                {countdownActive && <Countdown end={settings.saleCountdownEnd as unknown as string} />}
                <Link href="/shop?sale=1" className="inline-flex min-h-11 items-center text-sm font-semibold text-mint hover:underline">
                  View all →
                </Link>
              </div>
            </div>
            <div className="relative grid grid-cols-2 gap-4 lg:grid-cols-[repeat(auto-fit,minmax(220px,1fr))]">
              {sale.map((p) => (
                <ProductCard key={p._id} p={p} />
              ))}
            </div>
          </div>
        </section>
      ),
    bundles:
      bundles.length > 0 && (
        <Section id="bundles" eyebrow="Better together" title={title("bundles")}>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {bundles.map((b) => (
              <BundleCard key={b._id} b={b} />
            ))}
          </div>
        </Section>
      ),
    // Trust points now live in the hero; the section id stays so saved admin layouts keep working.
    trust: null,
    reviews:
      reviews.length > 0 && (
        <Section eyebrow="Reviews" title={title("reviews")}>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {reviews.map((r) => (
              <figure key={r._id} className="flex flex-col gap-4 rounded-[28px] bg-surface-alt p-7">
                <span aria-hidden className="h-7 font-display text-[64px] leading-[0.6] text-mint">
                  “
                </span>
                <div className="flex gap-0.5 text-warning" aria-label={`${r.rating} out of 5 stars`}>
                  {Array.from({ length: r.rating }, (_, i) => (
                    <Icon key={i} name="star" size={16} fill="currentColor" />
                  ))}
                </div>
                <blockquote className="line-clamp-5 text-pretty text-lg font-normal leading-[1.5]">{r.comment}</blockquote>
                <figcaption className="mt-auto text-sm">
                  <span className="font-semibold">{r.name}</span>
                  {r.product && (
                    <>
                      <span className="text-muted"> on </span>
                      <Link href={`/product/${r.product.slug}`} className="link -my-3 inline-block py-3">
                        {r.product.name}
                      </Link>
                    </>
                  )}
                </figcaption>
              </figure>
            ))}
          </div>
        </Section>
      ),
  };

  return (
    <>
      <HeroCarousel
        slides={slides}
        featured={featured[0] ?? sale[0] ?? null}
        trust={trust}
        reviewStats={reviewStats}
        sale={sale.length > 0 ? { maxDiscount, end: countdownActive ? (settings.saleCountdownEnd as unknown as string) : null } : null}
      />
      {settings.homeSections
        .filter((s) => s.enabled)
        .map((s) => (
          <div key={s.id}>{sections[s.id]}</div>
        ))}
    </>
  );
}
