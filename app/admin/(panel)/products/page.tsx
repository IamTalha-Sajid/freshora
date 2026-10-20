"use client";

import { useConfirm } from "@/components/ConfirmProvider";
import { useCallback, useEffect, useState } from "react";
import { adminFetch, Check, ErrorMsg, Field, fromLocalInput, ImageUpload, PageHeader, toLocalInput } from "@/components/admin/ui";
import { formatPKR, isOnSale } from "@/lib/pricing";

type Cat = { _id: string; name: string; parent: string | null };
type Product = {
  _id: string;
  name: string;
  slug: string;
  price: number;
  category: { _id: string; name: string } | string;
  images: string[];
  stock: number;
  sku?: string;
  description?: string;
  shortDescription?: string;
  compareAtPrice?: number;
  weight?: number;
  tags: string[];
  lowStockThreshold?: number;
  seoTitle?: string;
  seoDescription?: string;
  ingredients?: string;
  howToUse?: string;
  faq?: { q: string; a: string }[];
  featured: boolean;
  active: boolean;
  salePrice?: number;
  saleStart?: string;
  saleEnd?: string;
};

type Form = {
  name: string; price: string; category: string; images: string[]; stock: string;
  sku: string; shortDescription: string; description: string; compareAtPrice: string; weight: string; tags: string;
  lowStockThreshold: string; seoTitle: string; seoDescription: string; featured: boolean; active: boolean;
  salePrice: string; saleStart: string; saleEnd: string;
  ingredients: string; howToUse: string; faq: { q: string; a: string }[];
  /** Stock when the form was opened; the server applies the edit as a change against it. */
  stockBase: string;
};

const empty: Form = {
  name: "", price: "", category: "", images: [], stock: "0", sku: "", shortDescription: "", description: "", compareAtPrice: "", weight: "", tags: "",
  lowStockThreshold: "", seoTitle: "", seoDescription: "", featured: false, active: true, salePrice: "", saleStart: "", saleEnd: "",
  ingredients: "", howToUse: "", faq: [], stockBase: "",
};

const s = (v: unknown) => (v == null ? "" : String(v));
const catId = (c: Product["category"]) => (typeof c === "string" ? c : c._id);

function toForm(p: Product): Form {
  return {
    name: p.name, price: s(p.price), category: catId(p.category), images: p.images, stock: s(p.stock), sku: s(p.sku),
    shortDescription: s(p.shortDescription), description: s(p.description), compareAtPrice: s(p.compareAtPrice), weight: s(p.weight),
    tags: p.tags.join(", "), lowStockThreshold: s(p.lowStockThreshold), seoTitle: s(p.seoTitle), seoDescription: s(p.seoDescription),
    featured: p.featured, active: p.active, salePrice: s(p.salePrice), saleStart: toLocalInput(p.saleStart), saleEnd: toLocalInput(p.saleEnd),
    ingredients: s(p.ingredients), howToUse: s(p.howToUse), faq: p.faq ?? [], stockBase: s(p.stock),
  };
}

export default function ProductsAdmin() {
  const confirm = useConfirm();
  const [products, setProducts] = useState<Product[]>([]);
  const [cats, setCats] = useState<Cat[]>([]);
  const [editing, setEditing] = useState<string | "new" | null>(null);
  const [form, setForm] = useState<Form>(empty);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [filter, setFilter] = useState("");

  const load = useCallback(async () => {
    const [p, c] = await Promise.all([adminFetch<Product[]>("/api/admin/products"), adminFetch<Cat[]>("/api/admin/categories")]);
    setProducts(p);
    setCats(c);
  }, []);
  useEffect(() => {
    load().catch((e) => setError(e.message));
  }, [load]);

  const f = <K extends keyof Form>(k: K, v: Form[K]) => setForm((x) => ({ ...x, [k]: v }));
  const f2 = (i: number, patch: Partial<Form["faq"][number]>) => setForm((x) => ({ ...x, faq: x.faq.map((q, j) => (j === i ? { ...q, ...patch } : q)) }));
  const text = (k: keyof Form) => ({ className: "input", value: form[k] as string, onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => f(k, e.target.value as never) });

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const body = {
        ...form,
        tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
        faq: form.faq.filter((q) => q.q.trim() && q.a.trim()),
        saleStart: fromLocalInput(form.saleStart),
        saleEnd: fromLocalInput(form.saleEnd),
      };
      if (editing === "new") await adminFetch("/api/admin/products", "POST", body);
      else await adminFetch(`/api/admin/products/${editing}`, "PUT", body);
      setEditing(null);
      await load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function quick(p: Product, patch: Partial<Product>) {
    // Reuse the full-form PUT so zod validation stays in one place.
    await adminFetch(`/api/admin/products/${p._id}`, "PUT", { ...toForm(p), ...patch, tags: p.tags, faq: p.faq ?? [], saleStart: p.saleStart ?? "", saleEnd: p.saleEnd ?? "" }).catch((e) => setError(e.message));
    await load();
  }

  async function remove(p: Product) {
    if (!(await confirm({ title: `Delete "${p.name}"?`, message: "Its reviews are deleted and it is removed from any bundle. Existing orders keep their copy of the product.", confirmLabel: "Delete product", tone: "danger" }))) return;
    await adminFetch(`/api/admin/products/${p._id}`, "DELETE").catch((e) => setError(e.message));
    await load();
  }

  if (editing) {
    return (
      <form onSubmit={save} className="space-y-6">
        <PageHeader title={editing === "new" ? "New product" : "Edit product"}>
          <button type="button" className="btn-outline" onClick={() => { setEditing(null); setError(""); }}>Cancel</button>
          <button className="btn" disabled={busy}>{busy ? "Saving…" : "Save"}</button>
        </PageHeader>
        <ErrorMsg msg={error} />

        <section className="card space-y-4 p-5">
          <h2 className="font-semibold">Required</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Name *"><input required {...text("name")} /></Field>
            <Field label="Category *">
              <select required className="input" value={form.category} onChange={(e) => f("category", e.target.value)}>
                <option value="">Select…</option>
                {cats.map((c) => <option key={c._id} value={c._id}>{c.parent ? "— " : ""}{c.name}</option>)}
              </select>
            </Field>
            <Field label="Price (PKR) *"><input required type="number" min={0} step="any" {...text("price")} /></Field>
            <Field label="Stock *"><input required type="number" min={0} step={1} {...text("stock")} /></Field>
          </div>
          <Field label="Images * (first is the main image)">
            <ImageUpload multiple value={form.images} onChange={(v) => f("images", v)} />
          </Field>
        </section>

        <section className="card space-y-4 p-5">
          <h2 className="font-semibold">Sale <span className="text-sm font-normal text-muted">(optional, leave dates empty for an open-ended sale)</span></h2>
          <div className="grid gap-4 md:grid-cols-3">
            <Field label="Sale price"><input type="number" min={0} step="any" {...text("salePrice")} /></Field>
            <Field label="Starts"><input type="datetime-local" {...text("saleStart")} /></Field>
            <Field label="Ends"><input type="datetime-local" {...text("saleEnd")} /></Field>
          </div>
        </section>

        <section className="card space-y-4 p-5">
          <h2 className="font-semibold">Optional details</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <Field label="SKU"><input {...text("sku")} /></Field>
            <Field label="Compare-at price"><input type="number" min={0} step="any" {...text("compareAtPrice")} /></Field>
            <Field label="Weight (g)"><input type="number" min={0} step="any" {...text("weight")} /></Field>
            <Field label="Low-stock alert at" hint="Blank = store default"><input type="number" min={0} {...text("lowStockThreshold")} /></Field>
            <div className="md:col-span-2"><Field label="Tags (comma separated)"><input {...text("tags")} /></Field></div>
          </div>
          <Field label="Short description"><input {...text("shortDescription")} /></Field>
          <Field label="Description"><textarea rows={5} {...text("description")} /></Field>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Ingredients" hint="Shown in an accordion on the product page"><textarea rows={4} {...text("ingredients")} /></Field>
            <Field label="How to use"><textarea rows={4} {...text("howToUse")} /></Field>
          </div>
          <div>
            <label className="label">FAQ</label>
            <div className="space-y-2">
              {form.faq.map((f, i) => (
                <div key={i} className="flex gap-2">
                  <input className="input" placeholder="Question" value={f.q} onChange={(e) => f2(i, { q: e.target.value })} />
                  <input className="input" placeholder="Answer" value={f.a} onChange={(e) => f2(i, { a: e.target.value })} />
                  <button type="button" className="btn-danger" aria-label="Remove question" onClick={() => setForm((x) => ({ ...x, faq: x.faq.filter((_, j) => j !== i) }))}>✕</button>
                </div>
              ))}
            </div>
            <button type="button" className="btn-outline mt-2" onClick={() => setForm((x) => ({ ...x, faq: [...x.faq, { q: "", a: "" }] }))}>+ Add question</button>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="SEO title"><input {...text("seoTitle")} /></Field>
            <Field label="SEO description"><input {...text("seoDescription")} /></Field>
          </div>
          <div className="flex gap-6">
            <Check label="Featured on homepage" checked={form.featured} onChange={(v) => f("featured", v)} />
            <Check label="Active (visible in store)" checked={form.active} onChange={(v) => f("active", v)} />
          </div>
        </section>
      </form>
    );
  }

  const shown = products.filter((p) => !filter || `${p.name} ${p.sku ?? ""}`.toLowerCase().includes(filter.toLowerCase()));
  return (
    <>
      <PageHeader title="Products">
        <input className="input !w-56" placeholder="Filter by name or SKU" value={filter} onChange={(e) => setFilter(e.target.value)} />
        <button className="btn" onClick={() => { setForm(empty); setEditing("new"); setError(""); }}>+ New product</button>
      </PageHeader>
      <ErrorMsg msg={error} />
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-surface-alt text-left text-xs uppercase text-muted">
            <tr><th className="p-3">Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Featured</th><th>Active</th><th /></tr>
          </thead>
          <tbody>
            {shown.map((p) => (
              <tr key={p._id} className="border-t">
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.images[0]} alt="" className="h-10 w-10 rounded object-cover" />
                    <div>
                      <div className="font-semibold">{p.name}</div>
                      {p.sku && <div className="text-xs text-muted">{p.sku}</div>}
                    </div>
                  </div>
                </td>
                <td>{typeof p.category === "object" ? p.category?.name : ""}</td>
                <td>
                  {formatPKR(p.price)}
                  {isOnSale(p) && <span className="ml-1 rounded bg-danger/10 px-1 text-xs text-danger-fg">Sale {formatPKR(p.salePrice as number)}</span>}
                </td>
                <td className={p.stock === 0 ? "font-semibold text-danger-fg" : p.stock <= (p.lowStockThreshold ?? 5) ? "font-semibold text-warn-fg" : ""}>{p.stock}</td>
                <td><input type="checkbox" checked={p.featured} onChange={(e) => quick(p, { featured: e.target.checked })} aria-label="Featured" /></td>
                <td><input type="checkbox" checked={p.active} onChange={(e) => quick(p, { active: e.target.checked })} aria-label="Active" /></td>
                <td className="space-x-2 whitespace-nowrap p-3 text-right">
                  <button className="btn-outline !px-3 !py-1.5" onClick={() => { setForm(toForm(p)); setEditing(p._id); setError(""); }}>Edit</button>
                  <button className="btn-danger" onClick={() => remove(p)}>Delete</button>
                </td>
              </tr>
            ))}
            {shown.length === 0 && <tr><td colSpan={7} className="p-8 text-center text-muted">No products yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}
