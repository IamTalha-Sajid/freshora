"use client";

import { useState } from "react";
import { Icon } from "@/components/Icon";

export function ReviewForm({ productId }: { productId: string }) {
  const [form, setForm] = useState({ name: "", email: "", rating: 5, comment: "" });
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState("sending");
    setError("");
    const res = await fetch("/api/reviews", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, product: productId }) });
    if (res.ok) setState("done");
    else {
      setError((await res.json()).error ?? "Something went wrong");
      setState("idle");
    }
  }

  if (state === "done")
    return (
      <div className="flex items-center gap-3 rounded-2xl bg-success/10 p-5 text-sm">
        <Icon name="check" className="shrink-0 text-success" /> Thanks! Your review will appear once it has been approved.
      </div>
    );
  return (
    <form onSubmit={submit} className="card space-y-3 p-5">
      <h3 className="text-lg">Write a review</h3>
      <div className="grid gap-3 sm:grid-cols-2">
        <input className="input" aria-label="Your name" placeholder="Your name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input className="input" aria-label="Email" type="email" placeholder="Email (optional, not shown)" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
      </div>
      <div className="flex gap-0.5" role="radiogroup" aria-label="Rating">
        {[1, 2, 3, 4, 5].map((n) => (
          <button type="button" key={n} role="radio" aria-checked={n === form.rating} aria-label={`${n} star${n > 1 ? "s" : ""}`} onClick={() => setForm({ ...form, rating: n })} className={`flex h-11 w-9 items-center justify-center ${n <= form.rating ? "text-warning" : "text-line"}`}>
            <Icon name="star" size={26} fill="currentColor" />
          </button>
        ))}
      </div>
      <textarea className="input" aria-label="Your review" rows={3} placeholder="Share your experience" required value={form.comment} onChange={(e) => setForm({ ...form, comment: e.target.value })} />
      {error && <p className="text-sm text-danger-fg">{error}</p>}
      <button className="btn" disabled={state === "sending"}>
        {state === "sending" ? "Sending…" : "Submit review"}
      </button>
    </form>
  );
}
