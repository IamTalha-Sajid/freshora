"use client";

import { useCallback, useEffect, useState } from "react";
import { adminFetch, Check, ErrorMsg, Field, ImageUpload, PageHeader } from "@/components/admin/ui";
import { formatPKR } from "@/lib/pricing";

type Prod = { _id: string; name: string; price: number };
type Bundle = { _id: string; name: string; image?: string; price: number; active: boolean; items: { product: Prod | null; qty: number }[] };
type Form = { name: string; image: string; price: string; active: boolean; items: { product: string; qty: number }[] };
const empty: Form = { name: "", image: "", price: "", active: true, items: [{ product: "", qty: 1 }] };

export default function BundlesAdmin() {
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [products, setProducts] = useState<Prod[]>([]);
  const [editing, setEditing] = useState<string | "new" | null>(null);
  const [form, setForm] = useState(empty);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const [b, p] = await Promise.all([adminFetch<Bundle[]>("/api/admin/bundles"), adminFetch<Prod[]>("/api/admin/products")]);
    setBundles(b);
    setProducts(p);
  }, []);
  useEffect(() => {
    load().catch((e) => setError(e.message));
  }, [load]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      const body = { ...form, items: form.items.filter((i) => i.product) };
      if (editing === "new") await adminFetch("/api/admin/bundles", "POST", body);
      else await adminFetch(`/api/admin/bundles/${editing}`, "PUT", body);
      setEditing(null);
      await load();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  const setItem = (i: number, patch: Partial<Form["items"][number]>) => setForm({ ...form, items: form.items.map((x, j) => (j === i ? { ...x, ...patch } : x)) });
  const regular = form.items.reduce((s, i) => s + (products.find((p) => p._id === i.product)?.price ?? 0) * i.qty, 0);

  if (editing) {
    return (
      <form onSubmit={save} className="card max-w-2xl space-y-4 p-5">
        <PageHeader title={editing === "new" ? "New bundle" : "Edit bundle"} />
        <ErrorMsg msg={error} />
        <Field label="Name *"><input className="input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
        <Field label="Image" hint="Optional. Defaults to the first product's image."><ImageUpload value={form.image ? [form.image] : []} onChange={(v) => setForm({ ...form, image: v[0] ?? "" })} /></Field>
        <div>
          <label className="label">Products *</label>
          <div className="space-y-2">
            {form.items.map((it, i) => (
              <div key={i} className="flex gap-2">
                <select className="input" value={it.product} onChange={(e) => setItem(i, { product: e.target.value })}>
                  <option value="">Select product…</option>
                  {products.map((p) => <option key={p._id} value={p._id}>{p.name} ({formatPKR(p.price)})</option>)}
                </select>
                <input className="input !w-20" type="number" min={1} value={it.qty} onChange={(e) => setItem(i, { qty: Number(e.target.value) })} />
                <button type="button" className="btn-danger" onClick={() => setForm({ ...form, items: form.items.filter((_, j) => j !== i) })}>✕</button>
              </div>
            ))}
          </div>
          <button type="button" className="btn-outline mt-2" onClick={() => setForm({ ...form, items: [...form.items, { product: "", qty: 1 }] })}>+ Add product</button>
        </div>
        <Field label="Bundle price (PKR) *" hint={regular ? `Items total ${formatPKR(regular)} at regular price` : undefined}>
          <input className="input" required type="number" min={0} step="any" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
        </Field>
        <Check label="Active" checked={form.active} onChange={(v) => setForm({ ...form, active: v })} />
        <div className="flex gap-2">
          <button className="btn">Save</button>
          <button type="button" className="btn-outline" onClick={() => { setEditing(null); setError(""); }}>Cancel</button>
        </div>
      </form>
    );
  }

  return (
    <>
      <PageHeader title="Bundles">
        <button className="btn" onClick={() => { setForm(empty); setEditing("new"); setError(""); }}>+ New bundle</button>
      </PageHeader>
      <ErrorMsg msg={error} />
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500"><tr><th className="p-3">Bundle</th><th>Contents</th><th>Price</th><th>Active</th><th /></tr></thead>
          <tbody>
            {bundles.map((b) => (
              <tr key={b._id} className="border-t">
                <td className="p-3 font-semibold">{b.name}</td>
                <td className="text-gray-600">{b.items.map((i) => `${i.qty}× ${i.product?.name ?? "(deleted)"}`).join(", ")}</td>
                <td>{formatPKR(b.price)}</td>
                <td>{b.active ? "✓" : ""}</td>
                <td className="space-x-2 whitespace-nowrap p-3 text-right">
                  <button className="btn-outline !px-3 !py-1.5" onClick={() => { setForm({ name: b.name, image: b.image ?? "", price: String(b.price), active: b.active, items: b.items.filter((i) => i.product).map((i) => ({ product: i.product!._id, qty: i.qty })) }); setEditing(b._id); setError(""); }}>Edit</button>
                  <button className="btn-danger" onClick={async () => { if (confirm(`Delete "${b.name}"?`)) { await adminFetch(`/api/admin/bundles/${b._id}`, "DELETE"); load(); } }}>Delete</button>
                </td>
              </tr>
            ))}
            {bundles.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-gray-500">No bundles yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}
