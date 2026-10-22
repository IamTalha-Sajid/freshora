import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Gallery } from "@/components/Gallery";
import { Icon } from "@/components/Icon";
import { ProductActions } from "@/components/ProductActions";
import { ReviewForm } from "@/components/ReviewForm";
import { getApprovedReviews, getProductBySlug } from "@/lib/data";
import { effectivePrice, formatPKR, isOnSale } from "@/lib/pricing";

export async function generateMetadata({ params }: PageProps<"/product/[slug]">): Promise<Metadata> {
  const p = await getProductBySlug((await params).slug);
  if (!p) return {};
  return { title: p.seoTitle || p.name, description: p.seoDescription || p.shortDescription };
}

function Accordion({ title, children, open = false }: { title: string; children: React.ReactNode; open?: boolean }) {
  return (
    <details open={open} className="group border-b border-line py-1">
      <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between font-display text-lg font-semibold [&::-webkit-details-marker]:hidden">
        {title}
        <Icon name="chevron-down" className="transition group-open:rotate-180" />
      </summary>
      <div className="pb-4 text-muted">{children}</div>
    </details>
  );
}

export default async function ProductPage({ params }: PageProps<"/product/[slug]">) {
  const p = await getProductBySlug((await params).slug);
  if (!p) notFound();
  const reviews = await getApprovedReviews(p._id);
  const sale = isOnSale(p);
  const price = effectivePrice(p);
  const low = p.stock > 0 && p.stock <= (p.lowStockThreshold ?? 5);

  return (
    <div className="container-x py-8">
      <nav aria-label="Breadcrumb" className="mb-4 text-sm text-muted">
        <Link href="/" className="-mx-2 -my-3 inline-block px-2 py-3 hover:text-link">Home</Link> / <Link href="/shop" className="-mx-2 -my-3 inline-block px-2 py-3 hover:text-link">Shop</Link> / <span className="text-fg">{p.name}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-2 lg:gap-14">
        <Gallery images={p.images} alt={p.name} />
        <div className="space-y-5">
          <h1 className="title-page">{p.name}</h1>
          {p.ratingCount > 0 && (
            <a href="#reviews" className="inline-flex items-center gap-1.5 text-sm">
              <Icon name="star" size={18} className="text-warning" fill="currentColor" />
              <span className="tabular font-semibold">{p.ratingAvg}</span>
              <span className="text-muted underline-offset-2 hover:underline">
                ({p.ratingCount} review{p.ratingCount === 1 ? "" : "s"})
              </span>
            </a>
          )}
          <div className="flex flex-wrap items-baseline gap-3">
            <span className={`tabular font-display text-3xl font-semibold ${sale ? "text-danger-fg" : ""}`}>{formatPKR(price)}</span>
            {sale && <span className="tabular text-lg text-muted line-through">{formatPKR(p.price)}</span>}
            {sale && <span className="chip-sale">Save {Math.round((1 - price / p.price) * 100)}%</span>}
          </div>
          {sale && p.saleEnd && <p className="text-sm text-danger-fg">Sale ends {new Date(p.saleEnd).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</p>}
          {p.shortDescription && <p className="text-muted">{p.shortDescription}</p>}
          {low && <p className="text-sm font-semibold text-warning" style={{ color: "color-mix(in srgb, var(--warning) 70%, var(--fg))" }}>Only {p.stock} left in stock</p>}
          <ProductActions id={p._id} slug={p.slug} name={p.name} price={price} image={p.images[0]} stock={p.stock} />
          {p.sku && <p className="text-xs text-muted">SKU: {p.sku}</p>}

          <div className="border-t border-line pt-2">
            {p.description && (
              <Accordion title="Description" open>
                <p className="whitespace-pre-line">{p.description}</p>
              </Accordion>
            )}
            {p.ingredients && (
              <Accordion title="Ingredients">
                <p className="whitespace-pre-line">{p.ingredients}</p>
              </Accordion>
            )}
            {p.howToUse && (
              <Accordion title="How to use">
                <p className="whitespace-pre-line">{p.howToUse}</p>
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

      <section id="reviews" className="mt-14 grid scroll-mt-28 gap-8 md:grid-cols-2">
        <div>
          <h2 className="mb-4 text-2xl">Customer reviews</h2>
          {reviews.length === 0 ? (
            <p className="text-muted">No reviews yet. Be the first!</p>
          ) : (
            <ul className="space-y-3">
              {reviews.map((r) => (
                <li key={r._id} className="card p-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold">{r.name}</span>
                    <span className="flex text-warning" aria-label={`${r.rating} out of 5`}>
                      {Array.from({ length: r.rating }, (_, i) => (
                        <Icon key={i} name="star" size={14} fill="currentColor" />
                      ))}
                    </span>
                  </div>
                  <p className="mt-1 text-sm">{r.comment}</p>
                  {r.images?.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {r.images.map((src) => (
                        <a key={src} href={src} target="_blank" rel="noopener noreferrer" className="block h-16 w-16 overflow-hidden rounded-lg border border-line/70">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={src} alt={`Photo from ${r.name}`} loading="lazy" className="h-full w-full object-cover" />
                        </a>
                      ))}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
        <ReviewForm productId={p._id} />
      </section>
    </div>
  );
}
