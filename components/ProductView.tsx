import Link from "next/link";
import { Countdown } from "@/components/Countdown";
import { Gallery } from "@/components/Gallery";
import { Icon } from "@/components/Icon";
import { ProductActions } from "@/components/ProductActions";
import { ProductCard } from "@/components/ProductCard";
import { ReviewForm } from "@/components/ReviewForm";
import type { PCategory, PProduct } from "@/lib/data";
import type { IReview } from "@/lib/models/Review";
import { effectivePrice, formatPKR, isOnSale } from "@/lib/pricing";

type PReview = Omit<IReview, "_id" | "product"> & { _id: string };

function Accordion({ title, children, open = false }: { title: string; children: React.ReactNode; open?: boolean }) {
  return (
    <details open={open} className="group">
      <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 px-5 font-display text-lg font-bold transition-colors hover:bg-surface-alt group-open:bg-surface-alt [&::-webkit-details-marker]:hidden">
        {title}
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-surface-alt text-link transition group-open:rotate-180 group-open:bg-surface">
          <Icon name="chevron-down" size={16} strokeWidth={2.4} />
        </span>
      </summary>
      <div className="px-5 pb-5 pt-3 leading-relaxed text-fg-2">{children}</div>
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

export function ProductView({ p, reviews, related, category, freeShippingThreshold }: { p: PProduct; reviews: PReview[]; related: PProduct[]; category?: PCategory; freeShippingThreshold: number }) {
  const sale = isOnSale(p);
  const price = effectivePrice(p);
  const off = sale ? Math.round((1 - price / p.price) * 100) : 0;
  const out = p.stock <= 0;
  const low = !out && p.stock <= (p.lowStockThreshold ?? 5);
  const saleEnds = sale && p.saleEnd && new Date(p.saleEnd) > new Date() ? p.saleEnd : null;
  const dist = [5, 4, 3, 2, 1].map((star) => ({ star, n: reviews.filter((r) => r.rating === star).length }));
  const perks = [
    { icon: "truck", title: "Delivered to your door", sub: freeShippingThreshold > 0 ? `Free over ${formatPKR(freeShippingThreshold)}` : "Across the country" },
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

      <div className="grid items-start gap-[clamp(24px,4vw,64px)] lg:grid-cols-[minmax(0,640px)_minmax(0,1fr)]">
        <Gallery images={p.images} alt={p.name} badge={off ? `-${off}%` : undefined} />
        <div className="flex max-w-[760px] flex-col gap-5 lg:col-start-2 lg:row-span-2 lg:row-start-1">
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
            <ProductActions id={p._id} slug={p.slug} name={p.name} price={price} image={p.images[0]} stock={p.stock} offers={p.offers} />
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

          {p.description && (
            <div className="flex flex-col gap-2 border-t border-line-soft pt-5">
              <h2 className="font-display text-lg font-bold">Description</h2>
              <p className="whitespace-pre-line text-pretty leading-relaxed text-fg-2">{p.description}</p>
            </div>
          )}

          <div className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface empty:hidden">
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

      <section id="reviews" className="scroll-mt-40 lg:col-start-1 lg:row-start-2">
        <div className="mb-5 flex flex-wrap items-baseline gap-x-3 border-b border-line pb-3">
          <h2 className="font-display text-2xl font-bold">Customer reviews</h2>
          <span className="text-sm text-muted">{p.ratingCount > 0 ? `${p.ratingCount} review${p.ratingCount === 1 ? "" : "s"}` : "No reviews yet"}</span>
        </div>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-5">
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
              <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-line px-6 py-12 text-center">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-alt text-link">
                  <Icon name="star" size={22} />
                </span>
                <p className="font-bold">No reviews yet</p>
                <p className="text-sm text-muted">Be the first to share how this product worked for you.</p>
              </div>
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
      </div>

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
