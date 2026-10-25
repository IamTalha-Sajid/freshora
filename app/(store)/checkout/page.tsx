"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Icon } from "@/components/Icon";
import { Loader } from "@/components/Loader";
import { useStore } from "@/components/StoreProvider";
import { formatPKR, shippingFor } from "@/lib/pricing";

type Pub = { shippingFee: number; freeShippingThreshold: number; bankDetails: string };
const STEPS = ["Details", "Payment", "Review"];

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, subtotal, clearCart, ready, toast, syncCart } = useStore();
  const [pub, setPub] = useState<Pub | null>(null);
  const [step, setStep] = useState(0);
  const [method, setMethod] = useState<"cod" | "bank">("cod");
  const [ref, setRef] = useState("");
  const [c, setC] = useState({ name: "", phone: "", email: "", address: "", city: "", notes: "" });
  const [hp, setHp] = useState(""); // honeypot, hidden from people
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [restored, setRestored] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/settings").then((r) => r.json()).then(setPub);
  }, []);
  // Keep what the customer typed if they leave and come back (cleared once the order is placed).
  useEffect(() => {
    try {
      const d = JSON.parse(localStorage.getItem("freshora_checkout") ?? "null");
      if (d?.c) setC((x) => ({ ...x, ...d.c }));
      if (d?.method === "bank" || d?.method === "cod") setMethod(d.method);
    } catch {}
    setRestored(true);
  }, []);
  useEffect(() => {
    if (!restored) return;
    try {
      localStorage.setItem("freshora_checkout", JSON.stringify({ c, method }));
    } catch {}
  }, [c, method, restored]);
  // The saved cart can be days old: pull current prices and stock before showing totals.
  useEffect(() => {
    if (ready) syncCart().then((msgs) => msgs.slice(0, 3).forEach((m) => toast(m, "info")));
  }, [ready, syncCart, toast]);

  if (!ready || !pub)
    return (
      <div className="container-x max-w-[1200px] py-8" aria-busy="true" aria-label="Loading checkout">
        <div className="skeleton mb-6 h-12 w-56" />
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
          <div className="skeleton h-[420px]" />
          <div className="skeleton h-64" />
        </div>
      </div>
    );
  if (cart.length === 0)
    return (
      <div className="container-x flex flex-col items-center gap-3 py-20 text-center">
        <h1 className="text-3xl">Your cart is empty</h1>
        <Link href="/shop" className="btn">
          Browse products
        </Link>
      </div>
    );

  const shipping = shippingFor(subtotal, pub.shippingFee, pub.freeShippingThreshold);
  const remaining = pub.freeShippingThreshold > 0 ? pub.freeShippingThreshold - subtotal : 0;
  const set = (k: keyof typeof c) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setC({ ...c, [k]: e.target.value });

  // Field rules. An error shows after the field is left (blur) or after a failed submit, and clears on the first keystroke that edits the field.
  const rules: Record<keyof typeof c, (v: string) => string> = {
    name: (v) => (v.trim().length < 2 ? "Enter your full name" : ""),
    phone: (v) => (v.replace(/\D/g, "").length < 10 ? "Enter a phone number with at least 10 digits, like 0300 1234567" : ""),
    email: (v) => (v && !/^\S+@\S+\.\S+$/.test(v.trim()) ? "Enter an email like name@example.com, or leave it empty" : ""),
    address: (v) => (v.trim().length < 5 ? "Enter your street address" : ""),
    city: (v) => (v.trim().length < 2 ? "Enter your city" : ""),
    notes: () => "",
  };
  const fieldError = (k: keyof typeof c) => (touched[k] ? rules[k](c[k]) : "");
  const bind = (k: keyof typeof c) => ({
    id: `c-${k}`,
    name: k,
    value: c[k],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setTouched((t) => ({ ...t, [k]: false }));
      set(k)(e);
    },
    onBlur: () => setTouched((t) => ({ ...t, [k]: true })),
    "aria-invalid": fieldError(k) ? true : undefined,
    "aria-describedby": fieldError(k) ? `c-${k}-err` : undefined,
  });
  const err = (k: keyof typeof c) => (fieldError(k) ? <p id={`c-${k}-err`} className="mt-1.5 text-sm text-danger-fg">{fieldError(k)}</p> : null);

  function next(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (step === 0) {
      const keys = Object.keys(rules) as (keyof typeof c)[];
      const bad = keys.find((k) => rules[k](c[k]));
      if (bad) {
        setTouched(Object.fromEntries(keys.map((k) => [k, true])));
        return void document.getElementById(`c-${bad}`)?.focus();
      }
    }
    if (step === 1 && method === "bank" && !ref.trim()) return setError("Enter your bank transfer reference");
    setStep((s) => s + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function place() {
    setBusy(true);
    setError("");
    // Re-check right before ordering so the customer never pays a price they didn't see.
    const changes = await syncCart();
    if (changes.length) {
      setError(`${changes.join(". ")}. Please review your order and place it again.`);
      setBusy(false);
      return;
    }
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: cart.map((l) => ({ kind: l.kind, id: l.id, qty: l.qty })),
        customer: c,
        paymentMethod: method,
        paymentReference: method === "bank" ? ref : undefined,
        website: hp,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Could not place order");
      toast(data.error ?? "Could not place order", "error");
      setBusy(false);
      return;
    }
    clearCart();
    try {
      localStorage.removeItem("freshora_checkout");
    } catch {}
    router.push(`/order/${data.orderNumber}`);
  }

  return (
    <div className="container-x max-w-[1200px] py-8">
      <h1 className="mb-6 title-page">Checkout</h1>

      {/* Progress */}
      <ol className="mb-8 flex items-center" aria-label="Checkout progress">
        {STEPS.map((s, i) => (
          <li key={s} className="flex flex-1 items-center last:flex-none" aria-current={i === step ? "step" : undefined}>
            <button
              type="button"
              disabled={i >= step}
              onClick={() => setStep(i)}
              className="flex min-h-11 min-w-11 items-center gap-2 disabled:cursor-default"
            >
              <span className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold transition ${i < step ? "bg-mint text-[#06141b]" : i === step ? "bg-[var(--btn-bg)] text-[var(--btn-fg)]" : "border border-line text-muted"}`}>
                {i < step ? <Icon name="check" size={16} /> : i + 1}
              </span>
              <span className={`hidden text-sm font-semibold sm:block ${i === step ? "" : "text-muted"}`}>{s}</span>
            </button>
            {i < STEPS.length - 1 && <span className={`mx-3 h-0.5 flex-1 rounded ${i < step ? "bg-mint" : "bg-line"}`} />}
          </li>
        ))}
      </ol>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div>
          {step === 0 && (
            <form onSubmit={next} noValidate className="card space-y-4 p-6">
              <h2 className="text-xl">Delivery details</h2>
              <p className="text-sm text-muted">No account needed. We only use this to deliver your order.</p>
              <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden value={hp} onChange={(e) => setHp(e.target.value)} className="absolute -left-[9999px] h-0 w-0 opacity-0" />
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="label" htmlFor="c-name">Full name *</label>
                  <input className="input" autoComplete="name" {...bind("name")} />
                  {err("name")}
                </div>
                <div>
                  <label className="label" htmlFor="c-phone">Phone *</label>
                  <input className="input" type="tel" inputMode="tel" autoComplete="tel" {...bind("phone")} />
                  {err("phone")}
                </div>
                <div>
                  <label className="label" htmlFor="c-email">Email (optional)</label>
                  <input className="input" type="email" autoComplete="email" {...bind("email")} />
                  {err("email")}
                </div>
                <div>
                  <label className="label" htmlFor="c-city">City *</label>
                  <input className="input" autoComplete="address-level2" {...bind("city")} />
                  {err("city")}
                </div>
              </div>
              <div>
                <label className="label" htmlFor="c-address">Address *</label>
                <textarea className="input" rows={2} autoComplete="street-address" {...bind("address")} />
                {err("address")}
              </div>
              <div>
                <label className="label" htmlFor="c-notes">Order notes (optional)</label>
                <textarea className="input" rows={2} {...bind("notes")} />
              </div>
              <button className="btn !px-8">Continue to payment</button>
            </form>
          )}

          {step === 1 && (
            <form onSubmit={next} className="card space-y-4 p-6">
              <h2 className="text-xl">Payment method</h2>
              <label className={`flex min-h-14 cursor-pointer items-center gap-3.5 rounded-xl border p-4 transition ${method === "cod" ? "border-mint bg-accent" : "border-line"}`}>
                <input type="radio" name="pay" className="h-4 w-4 accent-[var(--mint)]" checked={method === "cod"} onChange={() => setMethod("cod")} />
                <Icon name="cash" className="text-link" />
                <span>
                  <span className="block font-semibold">Cash on delivery</span>
                  <span className="text-sm text-muted">Pay when your order arrives</span>
                </span>
              </label>
              <label className={`flex min-h-14 cursor-pointer items-center gap-3.5 rounded-xl border p-4 transition ${method === "bank" ? "border-mint bg-accent" : "border-line"}`}>
                <input type="radio" name="pay" className="h-4 w-4 accent-[var(--mint)]" checked={method === "bank"} onChange={() => setMethod("bank")} />
                <Icon name="lock" className="text-link" />
                <span>
                  <span className="block font-semibold">Bank transfer</span>
                  <span className="text-sm text-muted">We confirm your order once the payment is verified</span>
                </span>
              </label>
              {method === "bank" && (
                <div className="space-y-3 rounded-xl bg-surface-alt p-4 text-sm">
                  <p className="whitespace-pre-line">{pub.bankDetails || "Bank details will be shared after you place the order."}</p>
                  <div>
                    <label className="label" htmlFor="c-ref">Transfer reference / transaction ID *</label>
                    <input id="c-ref" className="input" value={ref} onChange={(e) => setRef(e.target.value)} />
                  </div>
                </div>
              )}
              {error && <p className="text-sm text-danger-fg">{error}</p>}
              <div className="flex gap-3">
                <button type="button" className="btn-outline" onClick={() => setStep(0)}>
                  Back
                </button>
                <button className="btn !px-8">Review order</button>
              </div>
            </form>
          )}

          {step === 2 && (
            <div className="card space-y-5 p-6">
              <h2 className="text-xl">Review your order</h2>
              <div className="grid gap-4 text-sm sm:grid-cols-2">
                <div className="rounded-xl bg-surface-alt p-4">
                  <div className="mb-1 flex items-center justify-between">
                    <span className="font-semibold">Deliver to</span>
                    <button className="link text-xs" onClick={() => setStep(0)}>Edit</button>
                  </div>
                  <p>{c.name}</p>
                  <p className="text-muted">{c.phone}</p>
                  <p className="text-muted">{c.address}, {c.city}</p>
                </div>
                <div className="rounded-xl bg-surface-alt p-4">
                  <div className="mb-1 flex items-center justify-between">
                    <span className="font-semibold">Payment</span>
                    <button className="link text-xs" onClick={() => setStep(1)}>Edit</button>
                  </div>
                  <p>{method === "cod" ? "Cash on delivery" : "Bank transfer"}</p>
                  {method === "bank" && <p className="text-muted">Ref: {ref}</p>}
                </div>
              </div>
              {error && <p className="rounded-lg bg-danger/10 p-3 text-sm text-danger-fg">{error}</p>}
              <div className="flex gap-3">
                <button type="button" className="btn-outline" onClick={() => setStep(1)}>
                  Back
                </button>
                <button className="btn !px-8 !py-3" disabled={busy} onClick={place}>
                  {busy && (
                    <span data-theme="dark" className="flex">
                      <Loader size={22} />
                    </span>
                  )}
                  {busy ? "Placing order…" : `Place order · ${formatPKR(subtotal + shipping)}`}
                </button>
              </div>
              <p className="text-xs text-muted">Final prices and stock are verified when you place the order.</p>
            </div>
          )}
        </div>

        <aside className="card h-fit space-y-3 p-6 lg:sticky lg:top-40">
          <h2 className="text-lg">Order summary</h2>
          <ul className="space-y-3">
            {cart.map((l) => (
              <li key={l.kind + l.id} className="flex items-center gap-3 text-sm">
                <div className="relative h-[52px] w-[52px] shrink-0 rounded-lg bg-surface-alt">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {l.image && <img src={l.image} alt="" className="h-full w-full object-contain p-1" />}
                  <span className="tabular absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--btn-bg)] px-1 text-xs font-semibold text-[var(--btn-fg)]">{l.qty}</span>
                </div>
                <span className="min-w-0 flex-1 truncate">{l.name}</span>
                <span className="tabular">{formatPKR(l.price * l.qty)}</span>
              </li>
            ))}
          </ul>
          <hr className="border-line" />
          <div className="flex justify-between text-sm">
            <span className="text-muted">Subtotal</span>
            <span className="tabular">{formatPKR(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted">Shipping</span>
            <span className="tabular">{shipping === 0 ? "Free" : formatPKR(shipping)}</span>
          </div>
          {remaining > 0 && <p className="rounded-[10px] bg-surface-alt px-3.5 py-3 text-[13px] font-semibold">Add {formatPKR(remaining)} more for free shipping!</p>}
          <div className="flex justify-between border-t border-line pt-3 text-lg font-semibold">
            <span>Total</span>
            <span className="tabular">{formatPKR(subtotal + shipping)}</span>
          </div>
        </aside>
      </div>
    </div>
  );
}
