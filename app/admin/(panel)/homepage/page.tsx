"use client";

import { useConfirm } from "@/components/ConfirmProvider";
import { useCallback, useEffect, useState } from "react";
import { adminFetch, Check, ErrorMsg, Field, fromLocalInput, ImageUpload, PageHeader, toLocalInput } from "@/components/admin/ui";
import { useSettings } from "@/components/admin/useSettings";

type Slide = { _id: string; image: string; headline: string; subtext?: string; ctaLabel?: string; ctaLink?: string; order: number; active: boolean };
const emptySlide = { image: "", headline: "", subtext: "", ctaLabel: "", ctaLink: "", order: "0", active: true };

const SECTION_NAMES: Record<string, string> = {
  categories: "Shop by concern (featured categories)",
  featured: "Bestsellers (featured products)",
  sale: "Deals & sale (with countdown)",
  bundles: "Bundles",
  trust: "Trust strip",
  reviews: "Customer reviews",
};

export default function HomepageAdmin() {
  const confirm = useConfirm();
  const { settings: s, setSettings, save, error, saved } = useSettings();
  const [slides, setSlides] = useState<Slide[]>([]);
  const [editing, setEditing] = useState<string | "new" | null>(null);
  const [form, setForm] = useState(emptySlide);
  const [slideError, setSlideError] = useState("");

  const load = useCallback(async () => setSlides(await adminFetch<Slide[]>("/api/admin/hero")), []);
  useEffect(() => {
    load().catch((e) => setSlideError(e.message));
  }, [load]);

  async function saveSlide(e: React.FormEvent) {
    e.preventDefault();
    setSlideError("");
    try {
      if (editing === "new") await adminFetch("/api/admin/hero", "POST", form);
      else await adminFetch(`/api/admin/hero/${editing}`, "PUT", form);
      setEditing(null);
      await load();
    } catch (err) {
      setSlideError((err as Error).message);
    }
  }

  if (!s) return error ? <ErrorMsg msg={error} /> : <p>Loading…</p>;

  const move = (i: number, d: -1 | 1) => {
    const a = [...s.homeSections];
    [a[i], a[i + d]] = [a[i + d], a[i]];
    setSettings({ ...s, homeSections: a });
  };
  const patchSection = (i: number, patch: object) => setSettings({ ...s, homeSections: s.homeSections.map((x, j) => (j === i ? { ...x, ...patch } : x)) });

  return (
    <div className="max-w-3xl space-y-6">
      <PageHeader title="Homepage">
        {saved && <span className="self-center text-sm font-semibold text-ok-fg">Saved ✓</span>}
        <button className="btn" onClick={save}>Save sections & banner</button>
      </PageHeader>
      <ErrorMsg msg={error} />

      <section className="card space-y-4 p-5">
        <h2 className="font-semibold">Announcement bar</h2>
        <Check label="Show announcement bar" checked={s.announcementEnabled} onChange={(v) => setSettings({ ...s, announcementEnabled: v })} />
        <Field label="Message"><input className="input" value={s.announcementText ?? ""} onChange={(e) => setSettings({ ...s, announcementText: e.target.value })} placeholder="Free shipping on orders over Rs. 5,000!" /></Field>
      </section>

      <section className="card space-y-3 p-5">
        <h2 className="font-semibold">Sections <span className="text-sm font-normal text-muted">(shown below the hero, in this order)</span></h2>
        {s.homeSections.map((sec, i) => (
          <div key={sec.id} className="flex flex-wrap items-center gap-3 rounded-lg border p-3">
            <div className="flex flex-col">
              <button type="button" disabled={i === 0} onClick={() => move(i, -1)} className="px-2 text-muted disabled:opacity-20" aria-label="Move up">▲</button>
              <button type="button" disabled={i === s.homeSections.length - 1} onClick={() => move(i, 1)} className="px-2 text-muted disabled:opacity-20" aria-label="Move down">▼</button>
            </div>
            <div className="min-w-40 text-sm font-semibold">{SECTION_NAMES[sec.id]}</div>
            <input className="input !w-56 flex-1" value={sec.title} onChange={(e) => patchSection(i, { title: e.target.value })} aria-label="Section title" />
            <Check label="Visible" checked={sec.enabled} onChange={(v) => patchSection(i, { enabled: v })} />
          </div>
        ))}
        <p className="text-xs text-muted">Which products appear: tick “Featured” on products, “Show on homepage” on categories, and set a sale price on products. Sale items appear automatically while their sale is active.</p>
        <Field label="Sale countdown ends" hint="Optional. Shows a countdown beside the deals section until this time.">
          <div className="flex gap-2">
            <input className="input" type="datetime-local" value={toLocalInput(s.saleCountdownEnd)} onChange={(e) => setSettings({ ...s, saleCountdownEnd: fromLocalInput(e.target.value) })} />
            <button type="button" className="btn-outline" onClick={() => setSettings({ ...s, saleCountdownEnd: "" })}>Clear</button>
          </div>
        </Field>
      </section>

      <section className="space-y-3">
        <PageHeader title="Hero slides">
          {!editing && <button className="btn" onClick={() => { setForm(emptySlide); setEditing("new"); setSlideError(""); }}>+ New slide</button>}
        </PageHeader>
        <ErrorMsg msg={slideError} />
        {editing ? (
          <form onSubmit={saveSlide} className="card space-y-4 p-5">
            <Field label="Image *" hint="Wide landscape image, about 1920×800"><ImageUpload value={form.image ? [form.image] : []} onChange={(v) => setForm({ ...form, image: v[0] ?? "" })} /></Field>
            <Field label="Headline *"><input className="input" required value={form.headline} onChange={(e) => setForm({ ...form, headline: e.target.value })} /></Field>
            <Field label="Subtext"><input className="input" value={form.subtext} onChange={(e) => setForm({ ...form, subtext: e.target.value })} /></Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Button label"><input className="input" value={form.ctaLabel} onChange={(e) => setForm({ ...form, ctaLabel: e.target.value })} /></Field>
              <Field label="Button link" hint="e.g. /shop or /shop?sale=1"><input className="input" value={form.ctaLink} onChange={(e) => setForm({ ...form, ctaLink: e.target.value })} /></Field>
            </div>
            <Field label="Order"><input className="input !w-24" type="number" value={form.order} onChange={(e) => setForm({ ...form, order: e.target.value })} /></Field>
            <Check label="Active" checked={form.active} onChange={(v) => setForm({ ...form, active: v })} />
            <div className="flex gap-2">
              <button className="btn">Save slide</button>
              <button type="button" className="btn-outline" onClick={() => setEditing(null)}>Cancel</button>
            </div>
          </form>
        ) : (
          <div className="space-y-2">
            {slides.map((sl) => (
              <div key={sl._id} className="card flex items-center gap-4 p-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={sl.image} alt="" className="h-16 w-28 rounded object-cover" />
                <div className="min-w-0 flex-1">
                  <div className="truncate font-semibold">{sl.headline}</div>
                  <div className="text-xs text-muted">Order {sl.order} · {sl.active ? "Active" : "Hidden"}</div>
                </div>
                <button className="btn-outline !px-3 !py-1.5" onClick={() => { setForm({ image: sl.image, headline: sl.headline, subtext: sl.subtext ?? "", ctaLabel: sl.ctaLabel ?? "", ctaLink: sl.ctaLink ?? "", order: String(sl.order), active: sl.active }); setEditing(sl._id); setSlideError(""); }}>Edit</button>
                <button className="btn-danger" onClick={async () => { if (await confirm({ title: `Delete the slide "${sl.headline}"?`, message: "It disappears from the homepage straight away.", confirmLabel: "Delete slide", tone: "danger" })) { await adminFetch(`/api/admin/hero/${sl._id}`, "DELETE").catch(() => {}); load(); } }}>Delete</button>
              </div>
            ))}
            {slides.length === 0 && <div className="card p-8 text-center text-muted">No slides yet. The homepage shows a default banner until you add one.</div>}
          </div>
        )}
      </section>
    </div>
  );
}
