"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Icon } from "@/components/Icon";
import { useStore } from "@/components/StoreProvider";
import { formatPKR, shippingFor } from "@/lib/pricing";

type Pub = { shippingFee: number; freeShippingThreshold: number; bankDetails: string };
const STEPS = ["Details", "Payment", "Review"];

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, subtotal, clearCart, ready, toast } = useStore();
  const [pub, setPub] = useState<Pub | null>(null);
  const [step, setStep] = useState(0);
  const [method, setMethod] = useState<"cod" | "bank">("cod");
  const [ref, setRef] = useState("");
  const [c, setC] = useState({ name: "", phone: "", email: "", address: "", city: "", notes: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/settings").then((r) => r.json()).then(setPub);
  }, []);

  if (!ready || !pub) return <div className="container-x py-12">Loading…</div>;
  if (cart.length === 0)
    return (
      <div className="container-x flex flex-col items-center gap-3 py-20 text-center">
        <h1 className="text-3xl">Your cart is empty</h1>
        <Link href="/shop" className="btn">
          Go shopping
        </Link>
      </div>
    );

  const shipping = shippingFor(subtotal, pub.shippingFee, pub.freeShippingThreshold);
  const remaining = pub.freeShippingThreshold > 0 ? pub.freeShippingThreshold - subtotal : 0;
  const set = (k: keyof typeof c) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setC({ ...c, [k]: e.target.value });

  function next(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (step === 1 && method === "bank" && !ref.trim()) return setError("Enter your bank transfer reference");
    setStep((s) => s + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function place() {
    setBusy(true);
    setError("");
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: cart.map((l) => ({ kind: l.kind, id: l.id, qty: l.qty })),
        customer: c,
        paymentMethod: method,
        paymentReference: method === "bank" ? ref : undefined,
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
    router.push(`/order/${data.orderNumber}`);
  }

  return (
    <div className="container-x max-w-5xl py-8">
      <h1 className="mb-6 text-3xl sm:text-4xl">Checkout</h1>

      {/* Progress */}
      <ol className="mb-8 flex items-center" aria-label="Checkout progress">
        {STEPS.map((s, i) => (
          <li key={s} className="flex flex-1 items-center last:flex-none" aria-current={i === step ? "step" : undefined}>
            <button
              type="button"
              disabled={i >= step}
              onClick={() => setStep(i)}
              className="flex items-center gap-2 disabled:cursor-default"
            >
              <span className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold transition ${i < step ? "bg-mint text-[#06141b]" : i === step ? "bg-[var(--btn-bg)] text-[var(--btn-fg)]" : "border border-line text-muted"}`}>
                {i < step ? <Icon name="check" size={16} /> : i + 1}
              </span>
              <span className={`hidden text-sm font-semibold sm:block ${i === step ? "" : "text-muted"}`}>{s}</span>
            </button>
            {i < STEPS.length - 1 && <span className={`mx-3 h-0.5 flex-1 rounded ${i < step ? "bg-mint" : "bg-line"}`} />}
          </li>
        ))}
      </ol>

      <div className="grid gap-8 lg:grid-cols-[1fr_350px]">
        <div>
          {step === 0 && (
            <form onSubmit={next} className="card space-y-4 p-6">
              <h2 className="text-xl">Delivery details</h2>
              <p className="text-sm text-muted">No account needed. We only use this to deliver your order.</p>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="label" htmlFor="c-name">Full name *</label>
                  <input id="c-name" className="input" required autoComplete="name" value={c.name} onChange={set("name")} />
                </div>
                <div>
                  <label className="label" htmlFor="c-phone">Phone *</label>
                  <input id="c-phone" className="input" required type="tel" autoComplete="tel" value={c.phone} onChange={set("phone")} />
                </div>
                <div>
                  <label className="label" htmlFor="c-email">Email</label>
                  <input id="c-email" className="input" type="email" autoComplete="email" value={c.email} onChange={set("email")} />
                </div>
                <div>
                  <label className="label" htmlFor="c-city">City *</label>
                  <input id="c-city" className="input" required autoComplete="address-level2" value={c.city} onChange={set("city")} />
                </div>
              </div>
              <div>
                <label className="label" htmlFor="c-addr">Address *</label>
                <textarea id="c-addr" className="input" required rows={2} autoComplete="street-address" value={c.address} onChange={set("address")} />
              </div>
              <div>
                <label className="label" htmlFor="c-notes">Order notes</label>
                <textarea id="c-notes" className="input" rows={2} value={c.notes} onChange={set("notes")} />
              </div>
              <button className="btn !px-8">Continue to payment</button>
            </form>
          )}

          {step === 1 && (
            <form onSubmit={next} className="card space-y-4 p-6">
              <h2 className="text-xl">Payment method</h2>
              <label className={`flex min-h-14 cursor-pointer items-center gap-3 rounded-2xl border p-4 transition ${method === "cod" ? "border-mint bg-accent" : "border-line"}`}>
                <input type="radio" name="pay" className="h-4 w-4 accent-[var(--mint)]" checked={method === "cod"} onChange={() => setMethod("cod")} />
                <Icon name="cash" className="text-link" />
                <span>
                  <span className="block font-semibold">Cash on delivery</span>
                  <span className="text-sm text-muted">Pay when your order arrives</span>
                </span>
              </label>
              <label className={`flex min-h-14 cursor-pointer items-center gap-3 rounded-2xl border p-4 transition ${method === "bank" ? "border-mint bg-accent" : "border-line"}`}>
                <input type="radio" name="pay" className="h-4 w-4 accent-[var(--mint)]" checked={method === "bank"} onChange={() => setMethod("bank")} />
                <Icon name="lock" className="text-link" />
                <span>
                  <span className="block font-semibold">Bank transfer</span>
                  <span className="text-sm text-muted">We confirm your order once the payment is verified</span>
                </span>
              </label>
              {method === "bank" && (
                <div className="space-y-3 rounded-2xl bg-surface-alt p-4 text-sm">
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
                <div className="rounded-2xl bg-surface-alt p-4">
                  <div className="mb-1 flex items-center justify-between">
                    <span className="font-bold">Deliver to</span>
                    <button className="link text-xs" onClick={() => setStep(0)}>Edit</button>
                  </div>
                  <p>{c.name}</p>
                  <p className="text-muted">{c.phone}</p>
                  <p className="text-muted">{c.address}, {c.city}</p>
                </div>
                <div className="rounded-2xl bg-surface-alt p-4">
                  <div className="mb-1 flex items-center justify-between">
                    <span className="font-bold">Payment</span>
                    <button className="link text-xs" onClick={() => setStep(1)}>Edit</button>
                  </div>
                  <p>{method === "cod" ? "Cash on delivery" : "Bank transfer"}</p>
                  {method === "bank" && <p className="text-muted">Ref: {ref}</p>}
                </div>
              </div>
              {error && <p className="rounded-xl bg-danger/10 p-3 text-sm text-danger-fg">{error}</p>}
              <div className="flex gap-3">
                <button type="button" className="btn-outline" onClick={() => setStep(1)}>
                  Back
                </button>
                <button className="btn !px-8 !py-3" disabled={busy} onClick={place}>
                  {busy ? "Placing order…" : `Place order · ${formatPKR(subtotal + shipping)}`}
                </button>
              </div>
              <p className="text-xs text-muted">Final prices and stock are verified when you place the order.</p>
            </div>
          )}
        </div>

        <aside className="card h-fit space-y-3 p-5 lg:sticky lg:top-28">
          <h2 className="text-lg">Order summary</h2>
          <ul className="space-y-3">
            {cart.map((l) => (
              <li key={l.kind + l.id} className="flex items-center gap-3 text-sm">
                <div className="relative h-12 w-12 shrink-0 rounded-xl bg-surface-alt">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {l.image && <img src={l.image} alt="" className="h-full w-full object-contain p-1" />}
                  <span className="tabular absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--btn-bg)] px-1 text-[11px] font-bold text-[var(--btn-fg)]">{l.qty}</span>
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
          {remaining > 0 && <p className="rounded-xl bg-accent p-2.5 text-xs">Add {formatPKR(remaining)} more for free shipping!</p>}
          <div className="flex justify-between border-t border-line pt-3 text-lg font-bold">
            <span>Total</span>
            <span className="tabular">{formatPKR(subtotal + shipping)}</span>
          </div>
        </aside>
      </div>
    </div>
  );
}
