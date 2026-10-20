"use client";

import { useConfirm } from "@/components/ConfirmProvider";
import { useCallback, useEffect, useState } from "react";
import { adminFetch, Check, ErrorMsg, Field, ImageUpload, PageHeader } from "@/components/admin/ui";
import { Icon, ICON_NAMES } from "@/components/Icon";

type Cat = { _id: string; name: string; slug: string; parent: string | null; image?: string; icon?: string; order: number; active: boolean; featured: boolean };
const empty = { name: "", parent: "", image: "", icon: "", order: "0", active: true, featured: false };

export default function CategoriesAdmin() {
  const confirm = useConfirm();
  const [cats, setCats] = useState<Cat[]>([]);
  const [editing, setEditing] = useState<string | "new" | null>(null);
  const [form, setForm] = useState(empty);
  const [error, setError] = useState("");

  const load = useCallback(async () => setCats(await adminFetch<Cat[]>("/api/admin/categories")), []);
  useEffect(() => {
    load().catch((e) => setError(e.message));
  }, [load]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      if (editing === "new") await adminFetch("/api/admin/categories", "POST", form);
      else await adminFetch(`/api/admin/categories/${editing}`, "PUT", form);
      setEditing(null);
      await load();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function remove(c: Cat) {
    if (!(await confirm({ title: `Delete "${c.name}"?`, message: "Categories that still have products or sub-categories can't be deleted.", confirmLabel: "Delete category", tone: "danger" }))) return;
    try {
      await adminFetch(`/api/admin/categories/${c._id}`, "DELETE");
      setError("");
      await load();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  // Render as an indented tree.
  const rows: { c: Cat; depth: number }[] = [];
  const walk = (parent: string | null, depth: number) => cats.filter((c) => (c.parent ?? null) === parent).forEach((c) => (rows.push({ c, depth }), walk(c._id, depth + 1)));
  walk(null, 0);

  // A category can't be moved under itself or its own descendants.
  const blocked = new Set<string>();
  if (editing && editing !== "new") {
    blocked.add(editing);
    for (let i = 0; i < 20; i++) cats.forEach((c) => c.parent && blocked.has(c.parent) && blocked.add(c._id));
  }

  if (editing) {
    return (
      <form onSubmit={save} className="card max-w-xl space-y-4 p-5">
        <PageHeader title={editing === "new" ? "New category" : "Edit category"} />
        <ErrorMsg msg={error} />
        <Field label="Name *"><input className="input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
        <Field label="Parent category" hint="Leave empty for a top-level category">
          <select className="input" value={form.parent} onChange={(e) => setForm({ ...form, parent: e.target.value })}>
            <option value="">None</option>
            {rows.filter((r) => !blocked.has(r.c._id)).map(({ c, depth }) => <option key={c._id} value={c._id}>{"— ".repeat(depth)}{c.name}</option>)}
          </select>
        </Field>
        <Field label="Icon" hint="Shown on the homepage tile and in the menu when there is no image">
          <div className="flex flex-wrap gap-2">
            {ICON_NAMES.map((n) => (
              <button type="button" key={n} aria-label={n} aria-pressed={form.icon === n} title={n} onClick={() => setForm({ ...form, icon: form.icon === n ? "" : n })} className={`flex h-11 w-11 items-center justify-center rounded-xl border transition ${form.icon === n ? "border-mint bg-accent text-link" : "border-line text-muted hover:bg-accent"}`}>
                <Icon name={n} />
              </button>
            ))}
          </div>
        </Field>
        <Field label="Image" hint="Optional. Replaces the icon on the homepage tile."><ImageUpload value={form.image ? [form.image] : []} onChange={(v) => setForm({ ...form, image: v[0] ?? "" })} /></Field>
        <Field label="Sort order" hint="Lower numbers appear first"><input className="input" type="number" value={form.order} onChange={(e) => setForm({ ...form, order: e.target.value })} /></Field>
        <div className="flex gap-6">
          <Check label="Active" checked={form.active} onChange={(v) => setForm({ ...form, active: v })} />
          <Check label="Show on homepage" checked={form.featured} onChange={(v) => setForm({ ...form, featured: v })} />
        </div>
        <div className="flex gap-2">
          <button className="btn">Save</button>
          <button type="button" className="btn-outline" onClick={() => { setEditing(null); setError(""); }}>Cancel</button>
        </div>
      </form>
    );
  }

  return (
    <>
      <PageHeader title="Categories">
        <button className="btn" onClick={() => { setForm(empty); setEditing("new"); setError(""); }}>+ New category</button>
      </PageHeader>
      <ErrorMsg msg={error} />
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-surface-alt text-left text-xs uppercase text-muted">
            <tr><th className="p-3">Name</th><th>Order</th><th>Homepage</th><th>Active</th><th /></tr>
          </thead>
          <tbody>
            {rows.map(({ c, depth }) => (
              <tr key={c._id} className="border-t">
                <td className="p-3 font-semibold" style={{ paddingLeft: 12 + depth * 24 }}>{depth > 0 && "└ "}{c.name}</td>
                <td>{c.order}</td>
                <td>{c.featured ? "✓" : ""}</td>
                <td>{c.active ? "✓" : <span className="text-muted">hidden</span>}</td>
                <td className="space-x-2 whitespace-nowrap p-3 text-right">
                  <button className="btn-outline !px-3 !py-1.5" onClick={() => { setForm({ name: c.name, parent: c.parent ?? "", image: c.image ?? "", icon: c.icon ?? "", order: String(c.order), active: c.active, featured: c.featured }); setEditing(c._id); setError(""); }}>Edit</button>
                  <button className="btn-danger" onClick={() => remove(c)}>Delete</button>
                </td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-muted">No categories yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}
