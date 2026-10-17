import Link from "next/link";
import { BundleCard } from "@/components/BundleCard";
import { Countdown } from "@/components/Countdown";
import { HeroCarousel } from "@/components/HeroCarousel";
import { Icon } from "@/components/Icon";
import { ProductCard } from "@/components/ProductCard";
import { ProductCarousel } from "@/components/ProductCarousel";
import { getBundles, getCategories, getFeaturedProducts, getHeroSlides, getLatestReviews, getSaleProducts } from "@/lib/data";
import { getSettings, type TrustItem } from "@/lib/models/Settings";
import { formatPKR } from "@/lib/pricing";

function Section({ title, href, linkLabel = "View all", children, extra, tint = false }: { title: string; href?: string; linkLabel?: string; children: React.ReactNode; extra?: React.ReactNode; tint?: boolean }) {
  return (
    <section className={tint ? "mt-16 bg-surface-alt py-14" : "container-x mt-16"}>
      <div className={tint ? "container-x" : ""}>
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <h2 className="text-2xl sm:text-3xl">{title}</h2>
          <div className="flex items-center gap-4">
            {extra}
            {href && (
              <Link href={href} className="inline-flex min-h-11 items-center text-sm font-semibold text-link hover:underline">
                {linkLabel} →
              </Link>
            )}
          </div>
        </div>
        {children}
      </div>
    </section>
  );
}

export default async function Home() {
  const [settings, slides, categories, featured, sale, bundles, reviews] = await Promise.all([
    getSettings(),
    getHeroSlides(),
    getCategories(),
    getFeaturedProducts(10),
    getSaleProducts(8),
    getBundles(),
    getLatestReviews(6),
  ]);
  const title = (id: string) => settings.homeSections.find((s) => s.id === id)?.title ?? id;
  const concerns = categories.filter((c) => c.featured);
  const countdownActive = settings.saleCountdownEnd && new Date(settings.saleCountdownEnd) > new Date();

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
        <Section title={title("categories")}>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {concerns.map((c) => (
              <Link key={c._id} href={`/category/${c.slug}`} className="card card-hover group flex flex-col items-center gap-3 p-5 text-center">
                <span className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-accent text-link transition group-hover:scale-105">
                  {c.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={c.image} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <Icon name={c.icon || "tooth"} size={30} />
                  )}
                </span>
                <span className="font-display font-bold leading-tight">{c.name}</span>
              </Link>
            ))}
          </div>
        </Section>
      ),
    featured:
      featured.length > 0 && (
        <Section title={title("featured")} href="/shop">
          <ProductCarousel>
            {featured.map((p) => (
              <ProductCard key={p._id} p={p} />
            ))}
          </ProductCarousel>
        </Section>
      ),
    sale:
      sale.length > 0 && (
        <Section title={title("sale")} href="/shop?sale=1" extra={countdownActive ? <Countdown end={settings.saleCountdownEnd as unknown as string} /> : null}>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {sale.map((p) => (
              <ProductCard key={p._id} p={p} />
            ))}
          </div>
        </Section>
      ),
    bundles:
      bundles.length > 0 && (
        <Section title={title("bundles")}>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {bundles.map((b) => (
              <BundleCard key={b._id} b={b} />
            ))}
          </div>
        </Section>
      ),
    trust: (
      <Section title={title("trust")} tint>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {trust.map((t, i) => (
            <div key={i} className="card flex items-start gap-4 p-5">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-accent text-link">
                <Icon name={t.icon} size={24} />
              </span>
              <div>
                <p className="font-display font-bold">{t.title}</p>
                {t.text && <p className="text-sm text-muted">{t.text}</p>}
              </div>
            </div>
          ))}
        </div>
      </Section>
    ),
    reviews:
      reviews.length > 0 && (
        <Section title={title("reviews")}>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {reviews.map((r) => (
              <figure key={r._id} className="card flex flex-col gap-3 p-5">
                <div className="flex gap-0.5 text-warning" aria-label={`${r.rating} out of 5 stars`}>
                  {Array.from({ length: r.rating }, (_, i) => (
                    <Icon key={i} name="star" size={16} fill="currentColor" />
                  ))}
                </div>
                <blockquote className="line-clamp-4 text-sm">“{r.comment}”</blockquote>
                <figcaption className="mt-auto text-sm">
                  <span className="font-semibold">{r.name}</span>
                  {r.product && (
                    <>
                      <span className="text-muted"> on </span>
                      <Link href={`/product/${r.product.slug}`} className="link">
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
      <HeroCarousel slides={slides} featured={featured[0] ?? sale[0] ?? null} />
      {settings.homeSections
        .filter((s) => s.enabled)
        .map((s) => (
          <div key={s.id}>{sections[s.id]}</div>
        ))}
    </>
  );
}
