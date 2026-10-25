import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Countdown } from "@/components/Countdown";
import { Gallery } from "@/components/Gallery";
import { Icon } from "@/components/Icon";
import { ProductActions } from "@/components/ProductActions";
import { ProductCard } from "@/components/ProductCard";
import { ReviewForm } from "@/components/ReviewForm";
import { getApprovedReviews, getCategories, getProductBySlug, getRelatedProducts } from "@/lib/data";
import { getSettings } from "@/lib/models/Settings";
import { effectivePrice, formatPKR, isOnSale } from "@/lib/pricing";

export async function generateMetadata({ params }: PageProps<"/product/[slug]">): Promise<Metadata> {
  const p = await getProductBySlug((await params).slug);
  if (!p) return {};
  const title = p.seoTitle || p.name;
  const description = p.seoDescription || p.shortDescription;
  // Share the product's own photo; pages without one fall back to the site-wide logo image.
  const images = p.images[0] ? [p.images[0]] : undefined;
  return { title, description, openGraph: { title, description, images }, twitter: { title, description, images } };
}

function Accordion({ title, children, open = false }: { title: string; children: React.ReactNode; open?: boolean }) {
  return (
    <details open={open} className="group border-b border-line">
      <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between font-display text-lg font-bold [&::-webkit-details-marker]:hidden">
        {title}
        <Icon name="chevron-down" size={18} className="transition group-open:rotate-180" />
      </summary>
      <div className="pb-[18px] text-fg-2">{children}</div>
    </details>
  );
}

function Stars({ n, size = 16 }: { n: number; size?: number }) {
  return (
    <span className="flex gap-px" role="img" aria-label={`Rated ${n} out of 5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Icon key={i} name="star" size={size} fill="currentColor" stroke="none" className={i < Math.round(n) ? "text-warning" : "text-star-off"} />
      ))}
    </span>
  );
}

export default async function ProductPage({ params }: PageProps<"/product/[slug]">) {
  const p = await getProductBySlug((await params).slug);
  if (!p) notFound();
  const [reviews, related, categories, settings] = await Promise.all([getApprovedReviews(p._id), getRelatedProducts(p._id, p.category), getCategories(), getSettings()]);
  const sale = isOnSale(p);
  const price = effectivePrice(p);
  const off = sale ? Math.round((1 - price / p.price) * 100) : 0;
  const out = p.stock <= 0;
  const low = !out && p.stock <= (p.lowStockThreshold ?? 5);
  const category = categories.find((c) => c._id === p.category);
  const saleEnds = sale && p.saleEnd && new Date(p.saleEnd) > new Date() ? p.saleEnd : null;
  const dist = [5, 4, 3, 2, 1].map((star) => ({ star, n: reviews.filter((r) => r.rating === star).length }));
  const perks = [
    { icon: "truck", title: "Delivered to your door", sub: settings.freeShippingThreshold > 0 ? `Free over ${formatPKR(settings.freeShippingThreshold)}` : "Across the country" },
    { icon: "cash", title: "Cash on delivery", sub: "Pay when it arrives" },
    { icon: "clock", title: "Track your order", sub: "From dispatch to door" },
  ];

  return (
    <div className="container-x pt-5">
      <nav aria-label="Breadcrumb" className="mb-5 flex flex-wrap items-center gap-x-2 text-[13px] text-muted">
        <Link href="/" className="-mx-2 -my-3 inline-block px-2 py-3 hover:text-link">Home</Link>
        <span>/</span>
        <Link href="/shop" className="-mx-2 -my-3 inline-block px-2 py-3 hover:text-link">Shop</Link>
        {category && (
          <>
            <span>/</span>
            <Link href={`/category/${category.slug}`} className="-mx-2 -my-3 inline-block px-2 py-3 hover:text-link">{category.name}</Link>
          </>
        )}
        <span>/</span>
        <span className="text-fg">{p.name}</span>
      </nav>

      <div className="grid items-start gap-[clamp(24px,4vw,64px)] lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
        <Gallery images={p.images} alt={p.name} badge={off ? `-${off}%` : undefined} />
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2.5">
            <span className="text-xs font-bold uppercase tracking-[0.08em] text-link">Freshora{category ? ` · ${category.name}` : ""}</span>
            <h1 className="text-balance font-display text-[clamp(1.75rem,3vw,2.5rem)] font-bold">{p.name}</h1>
            {p.ratingCount > 0 && (
              <a href="#reviews" className="flex w-fit items-center gap-2 text-sm hover:text-link">
                <Stars n={p.ratingAvg} />
                <b className="tabular">{p.ratingAvg}</b>
                <span className="text-muted underline underline-offset-[3px]">
                  {p.ratingCount} review{p.ratingCount === 1 ? "" : "s"}
                </span>
              </a>
            )}
          </div>

          <div className="tabular flex flex-wrap items-center gap-3">
            <span className={`font-display text-4xl font-bold ${sale ? "text-danger-fg" : ""}`}>{formatPKR(price)}</span>
            {sale && <span className="text-lg text-muted line-through">{formatPKR(p.price)}</span>}
            {sale && <span className="rounded-full bg-sale-soft px-2.5 py-[3px] text-[13px] font-extrabold text-danger-fg">Save {off}%</span>}
          </div>
          {saleEnds ? (
            <div className="-mt-2 flex items-center gap-2.5 text-sm font-semibold text-danger-fg">
              <Icon name="clock" size={16} />
              Sale ends in <Countdown end={saleEnds} compact />
            </div>
          ) : null}
          {p.shortDescription && <p className="text-pretty text-base text-fg-2">{p.shortDescription}</p>}

          <div className="flex flex-col gap-3 border-t border-line-soft pt-5">
            <span className={`flex items-center gap-2 text-sm font-bold ${out ? "text-danger-fg" : low ? "text-warn-fg" : "text-success"}`}>
              <span aria-hidden className="h-2 w-2 rounded-full bg-current" />
              {out ? "Out of stock" : low ? `Only ${p.stock} left` : "In stock"}
            </span>
            <ProductActions id={p._id} slug={p.slug} name={p.name} price={price} image={p.images[0]} stock={p.stock} />
          </div>

          <div className="grid overflow-hidden rounded-xl border border-line bg-surface sm:grid-cols-[repeat(auto-fit,minmax(200px,1fr))]">
            {perks.map((k) => (
              <div key={k.title} className="-ml-px flex items-center gap-3 border-l border-line-soft px-4 py-3.5 max-sm:border-l-0 max-sm:border-t max-sm:first:border-t-0">
                <Icon name={k.icon} className="shrink-0 text-link" />
                <div className="flex flex-col leading-snug">
                  <b className="text-[13px]">{k.title}</b>
                  <span className="text-xs text-muted">{k.sub}</span>
                </div>
              </div>
            ))}
          </div>
          {p.sku && <span className="text-xs text-muted">SKU: {p.sku}</span>}

          <div className="border-t border-line">
            {p.description && (
              <Accordion title="Description" open>
                <p className="whitespace-pre-line text-pretty">{p.description}</p>
              </Accordion>
            )}
            {p.ingredients && (
              <Accordion title="Ingredients">
                <p className="whitespace-pre-line text-pretty">{p.ingredients}</p>
              </Accordion>
            )}
            {p.howToUse && (
              <Accordion title="How to use">
                <p className="whitespace-pre-line text-pretty">{p.howToUse}</p>
              </Accordion>
            )}
            {p.faq?.length > 0 && (
              <Accordion title="FAQ">
                <dl className="space-y-3">
                  {p.faq.map((f, i) => (
                    <div key={i}>
                      <dt className="font-semibold text-fg">{f.q}</dt>
                      <dd>{f.a}</dd>
                    </div>
                  ))}
                </dl>
              </Accordion>
            )}
          </div>
        </div>
      </div>

      <section id="reviews" className="mt-20 scroll-mt-40">
        <h2 className="title-section mb-6">Customer reviews</h2>
        <div className="grid items-start gap-[clamp(24px,4vw,56px)] md:grid-cols-[minmax(260px,340px)_minmax(0,1fr)]">
          <div className="flex flex-col gap-5 md:sticky md:top-40">
            {p.ratingCount > 0 && (
              <>
                <div className="flex items-center gap-4">
                  <span className="tabular font-display text-6xl font-extrabold leading-none">{p.ratingAvg}</span>
                  <div className="flex flex-col gap-1">
                    <Stars n={p.ratingAvg} size={18} />
                    <span className="text-[13px] text-muted">
                      Based on {p.ratingCount} review{p.ratingCount === 1 ? "" : "s"}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  {dist.map((d) => (
                    <div key={d.star} className="tabular grid grid-cols-[28px_minmax(0,1fr)_36px] items-center gap-2.5 text-[13px]">
                      <span className="font-bold">{d.star}★</span>
                      <span className="h-2 overflow-hidden rounded-full bg-line-soft">
                        <span className="block h-full bg-warning" style={{ width: `${reviews.length ? (d.n / reviews.length) * 100 : 0}%` }} />
                      </span>
                      <span className="text-right text-muted">{d.n}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
            <ReviewForm productId={p._id} />
          </div>

          <div className="flex flex-col">
            {reviews.length === 0 ? (
              <p className="border-t border-line py-6 text-muted">No reviews yet. Be the first!</p>
            ) : (
              reviews.map((r) => (
                <article key={r._id} className="flex flex-col gap-2.5 border-t border-line py-[22px]">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span aria-hidden className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-alt font-extrabold text-link">
                        {r.name.trim().charAt(0).toUpperCase()}
                      </span>
                      <div className="flex flex-col leading-snug">
                        <b className="text-[15px]">{r.name}</b>
                        <span className="text-xs text-muted">{new Date(r.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span>
                      </div>
                    </div>
                    <Stars n={r.rating} size={15} />
                  </div>
                  <p className="text-pretty text-[15px] leading-relaxed">{r.comment}</p>
                  {r.images?.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {r.images.map((src) => (
                        <a key={src} href={src} target="_blank" rel="noopener noreferrer" className="block h-16 w-16 overflow-hidden rounded-lg border border-line">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={src} alt={`Photo from ${r.name}`} loading="lazy" className="h-full w-full object-cover" />
                        </a>
                      ))}
                    </div>
                  )}
                </article>
              ))
            )}
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="mt-20">
          <div className="mb-5 flex flex-wrap items-baseline justify-between gap-4">
            <h2 className="title-section">You may also like</h2>
            <Link href="/shop" className="inline-flex min-h-11 items-center text-sm font-bold text-link hover:underline">
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-[repeat(auto-fill,minmax(240px,1fr))]">
            {related.map((r) => (
              <ProductCard key={r._id} p={r} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
