"use client";

import { PasswordForm } from "@/components/admin/PasswordForm";
import { ErrorMsg, Field, PageHeader } from "@/components/admin/ui";
import { useSettings } from "@/components/admin/useSettings";
import { Icon, ICON_NAMES } from "@/components/Icon";

export default function SettingsAdmin() {
  const { settings: s, setSettings, save, error, saved } = useSettings();
  if (!s) return error ? <ErrorMsg msg={error} /> : <p>Loading…</p>;
  const set = <K extends keyof typeof s>(k: K, v: (typeof s)[K]) => setSettings({ ...s, [k]: v });

  return (
    <>
    <form onSubmit={(e) => { e.preventDefault(); save(); }} className="max-w-2xl space-y-6">
      <PageHeader title="Settings">
        {saved && <span className="self-center text-sm font-semibold text-ok-fg">Saved ✓</span>}
        <button className="btn">Save</button>
      </PageHeader>
      <ErrorMsg msg={error} />

      <section className="card space-y-4 p-5">
        <h2 className="font-semibold">Store</h2>
        <Field label="Store name"><input className="input" required value={s.storeName} onChange={(e) => set("storeName", e.target.value)} /></Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Contact phone"><input className="input" value={s.contactPhone ?? ""} onChange={(e) => set("contactPhone", e.target.value)} /></Field>
          <Field label="Contact email"><input className="input" type="email" value={s.contactEmail ?? ""} onChange={(e) => set("contactEmail", e.target.value)} /></Field>
        </div>
      </section>

      <section className="card space-y-4 p-5">
        <h2 className="font-semibold">Shipping</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Flat shipping fee (PKR)"><input className="input" type="number" min={0} value={s.shippingFee} onChange={(e) => set("shippingFee", Number(e.target.value))} /></Field>
          <Field label="Free shipping over (PKR)" hint="0 = free shipping disabled"><input className="input" type="number" min={0} value={s.freeShippingThreshold} onChange={(e) => set("freeShippingThreshold", Number(e.target.value))} /></Field>
        </div>
      </section>

      <section className="card space-y-4 p-5">
        <h2 className="font-semibold">Bank transfer</h2>
        <Field label="Account details shown to customers" hint="Bank, account title, account number / IBAN">
          <textarea className="input" rows={4} value={s.bankDetails ?? ""} onChange={(e) => set("bankDetails", e.target.value)} />
        </Field>
      </section>

      <section className="card space-y-4 p-5">
        <h2 className="font-semibold">Trust strip</h2>
        <p className="text-sm text-muted">Shown on the homepage. Only add claims that are true for your business, such as certifications you actually hold. Leave empty to show the defaults (shipping, cash on delivery, order tracking).</p>
        <div className="space-y-3">
          {s.trustItems.map((t, i) => (
            <div key={i} className="space-y-2 rounded-2xl border border-line p-3">
              <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label="Icon">
                {ICON_NAMES.map((n) => (
                  <button type="button" key={n} role="radio" aria-checked={t.icon === n} aria-label={n} title={n} onClick={() => set("trustItems", s.trustItems.map((x, j) => (j === i ? { ...x, icon: n } : x)))} className={`flex h-9 w-9 items-center justify-center rounded-lg border transition ${t.icon === n ? "border-mint bg-accent text-link" : "border-line text-muted hover:bg-accent"}`}>
                    <Icon name={n} size={18} />
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <input className="input" placeholder="Title" value={t.title} onChange={(e) => set("trustItems", s.trustItems.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)))} />
                <input className="input" placeholder="Short text (optional)" value={t.text ?? ""} onChange={(e) => set("trustItems", s.trustItems.map((x, j) => (j === i ? { ...x, text: e.target.value } : x)))} />
                <button type="button" className="btn-danger" aria-label="Remove item" onClick={() => set("trustItems", s.trustItems.filter((_, j) => j !== i))}>✕</button>
              </div>
            </div>
          ))}
        </div>
        <button type="button" className="btn-outline" onClick={() => set("trustItems", [...s.trustItems, { icon: "shield", title: "", text: "" }])}>+ Add item</button>
      </section>

      <section className="card space-y-4 p-5">
        <h2 className="font-semibold">Inventory</h2>
        <Field label="Default low-stock threshold" hint="Products at or below this appear in the dashboard alert (a product can override it)">
          <input className="input !w-40" type="number" min={0} value={s.defaultLowStock} onChange={(e) => set("defaultLowStock", Number(e.target.value))} />
        </Field>
      </section>
    </form>
    <div className="mt-6"><PasswordForm /></div>
    </>
  );
}
