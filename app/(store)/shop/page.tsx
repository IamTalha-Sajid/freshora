import Link from "next/link";
import { FilterShell } from "@/components/FilterShell";
import { Icon } from "@/components/Icon";
import { ProductCard } from "@/components/ProductCard";
import { getCategories, searchProducts, type PCategory } from "@/lib/data";
import { formatPKR } from "@/lib/pricing";

export const metadata = { title: "Shop", description: "Browse toothpaste, brushes, mouthwash and more dental and oral-care essentials." };

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
const num = (v?: string) => (v && !Number.isNaN(Number(v)) ? Number(v) : undefined);

function categoryOptions(all: PCategory[], parent: string | null = null, depth = 0): { slug: string; label: string }[] {
  return all
    .filter((c) => c.parent === parent)
    .flatMap((c) => [{ slug: c.slug, label: `${"— ".repeat(depth)}${c.name}` }, ...categoryOptions(all, c._id, depth + 1)]);
}

export default async function ShopPage({ searchParams }: PageProps<"/shop">) {
  const sp = await searchParams;
  const view = first(sp.view) === "list" ? "list" : "grid";
  const query = {
    q: first(sp.q),
    category: first(sp.category),
    min: num(first(sp.min)),
    max: num(first(sp.max)),
    sale: first(sp.sale) === "1",
    sort: first(sp.sort),
    page: num(first(sp.page)) ?? 1,
  };
  const [cats, { products, total, pages }] = await Promise.all([getCategories(), searchProducts(query)]);
  const catName = query.category ? cats.find((c) => c.slug === query.category)?.name : undefined;
  const heading = query.q ? `Results for “${query.q}”` : catName ?? (query.sale ? "Deals & Offers" : "All products");

  // Keep every other param when linking (toggle view, drop a filter, change page).
  const href = (patch: Record<string, string | null>) => {
    const p = new URLSearchParams();
    for (const [k, v] of Object.entries(sp)) if (v) p.set(k, String(first(v)));
    for (const [k, v] of Object.entries(patch)) {
      if (v === null) p.delete(k);
      else p.set(k, v);
    }
    return `/shop?${p}`;
  };

  const chips: { label: string; remove: string[] }[] = [];
  if (query.q) chips.push({ label: `“${query.q}”`, remove: ["q"] });
  if (catName) chips.push({ label: catName, remove: ["category"] });
  if (query.min != null) chips.push({ label: `Min ${formatPKR(query.min)}`, remove: ["min"] });
  if (query.max != null) chips.push({ label: `Max ${formatPKR(query.max)}`, remove: ["max"] });
  if (query.sale) chips.push({ label: "On sale", remove: ["sale"] });

  const toggle = "flex h-11 w-11 items-center justify-center rounded-full transition";

  return (
    <div className="container-x py-8">
      <nav aria-label="Breadcrumb" className="mb-3 text-sm text-muted">
        <Link href="/" className="-mx-2 -my-3 inline-block px-2 py-3 hover:text-link">Home</Link> / <span className="text-fg">Shop</span>
      </nav>
      <h1 className="title-page">{heading}</h1>
      <p className="mb-6 mt-1 text-sm text-muted">
        {total} product{total === 1 ? "" : "s"}
      </p>

      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <FilterShell activeCount={chips.length}>
          <FilterForm query={query} cats={cats} view={view} />
        </FilterShell>

        <div>
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              {chips.map((c) => (
                <Link key={c.label} href={href(Object.fromEntries([...c.remove.map((k) => [k, null]), ["page", null]]))} className="chip !py-1.5" aria-label={`Remove filter ${c.label}`}>
                  {c.label} <Icon name="close" size={14} />
                </Link>
              ))}
            </div>
            <ViewToggle view={view} href={href} toggle={toggle} />
          </div>

          {products.length === 0 ? (
            <div className="card flex flex-col items-center gap-3 p-12 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-accent text-link">
                <Icon name="search" size={26} />
              </span>
              <p className="font-display text-lg font-semibold">No products match your filters</p>
              <Link href="/shop" className="btn-outline">
                Reset filters
              </Link>
            </div>
          ) : view === "list" ? (
            <div className="space-y-3">
              {products.map((p) => (
                <ProductCard key={p._id} p={p} layout="list" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-3">
              {products.map((p) => (
                <ProductCard key={p._id} p={p} />
              ))}
            </div>
          )}

          {pages > 1 && (
            <nav aria-label="Pagination" className="mt-10 flex flex-wrap justify-center gap-2">
              {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
                <Link key={n} href={href({ page: String(n) })} aria-current={n === query.page ? "page" : undefined} className={`${n === query.page ? "btn" : "btn-outline"} !min-w-11 !px-0`}>
                  {n}
                </Link>
              ))}
            </nav>
          )}
        </div>
      </div>
    </div>
  );
}

function ViewToggle({ view, href, toggle }: { view: string; href: (p: Record<string, string | null>) => string; toggle: string }) {
  return (
    <div className="flex rounded-full border border-line p-0.5" role="group" aria-label="Layout">
      <Link href={href({ view: null })} aria-label="Grid view" aria-pressed={view === "grid"} className={`${toggle} ${view === "grid" ? "bg-accent text-link" : "text-muted"}`}>
        <Icon name="grid" size={18} />
      </Link>
      <Link href={href({ view: "list" })} aria-label="List view" aria-pressed={view === "list"} className={`${toggle} ${view === "list" ? "bg-accent text-link" : "text-muted"}`}>
        <Icon name="list" size={18} />
      </Link>
    </div>
  );
}

function FilterForm({ query, cats, view }: { query: { q?: string; category?: string; min?: number; max?: number; sale: boolean; sort?: string }; cats: PCategory[]; view: string }) {
  return (
    <form action="/shop" className="space-y-4">
      {view === "list" && <input type="hidden" name="view" value="list" />}
      <div>
        <label className="label" htmlFor="f-q">Search</label>
        <input id="f-q" name="q" defaultValue={query.q} className="input" placeholder="Name, tag or SKU" />
      </div>
      <div>
        <label className="label" htmlFor="f-cat">Category</label>
        <select id="f-cat" name="category" defaultValue={query.category ?? ""} className="input">
          <option value="">All categories</option>
          {categoryOptions(cats).map((o) => (
            <option key={o.slug} value={o.slug}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="label" htmlFor="f-min">Min Rs.</label>
          <input id="f-min" name="min" type="number" min={0} defaultValue={query.min} className="input" />
        </div>
        <div>
          <label className="label" htmlFor="f-max">Max Rs.</label>
          <input id="f-max" name="max" type="number" min={0} defaultValue={query.max} className="input" />
        </div>
      </div>
      <label className="flex min-h-11 items-center gap-2 text-sm">
        <input type="checkbox" name="sale" value="1" defaultChecked={query.sale} className="h-4 w-4 accent-[var(--mint)]" /> On sale only
      </label>
      <div>
        <label className="label" htmlFor="f-sort">Sort by</label>
        <select id="f-sort" name="sort" defaultValue={query.sort ?? ""} className="input">
          <option value="">Newest</option>
          <option value="price-asc">Price: low to high</option>
          <option value="price-desc">Price: high to low</option>
          <option value="rating">Top rated</option>
        </select>
      </div>
      <button className="btn w-full">Apply filters</button>
      <Link href="/shop" className="flex min-h-11 items-center justify-center text-sm text-muted hover:text-link">
        Reset filters
      </Link>
    </form>
  );
}
