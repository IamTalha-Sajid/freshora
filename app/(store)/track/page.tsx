"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Icon } from "@/components/Icon";

export default function TrackPage() {
  const router = useRouter();
  const [number, setNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const res = await fetch(`/api/orders/track?number=${encodeURIComponent(number)}&phone=${encodeURIComponent(phone)}`);
    const data = await res.json();
    if (!res.ok) return setError(data.error);
    router.push(`/order/${data.orderNumber}`);
  }

  return (
    <div className="container-x py-10">
      <form onSubmit={submit} className="card mx-auto max-w-md space-y-4 p-6 sm:p-8">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent text-link">
          <Icon name="track" size={24} />
        </span>
        <h1 className="text-3xl">Track your order</h1>
        <p className="text-sm text-muted">Enter the order number from your confirmation and the phone number you used at checkout.</p>
        <div>
          <label className="label" htmlFor="t-num">Order number</label>
          <input id="t-num" className="input font-mono" required value={number} onChange={(e) => setNumber(e.target.value)} placeholder="FR-XXXX-XXXX-XXXX" />
        </div>
        <div>
          <label className="label" htmlFor="t-phone">Phone</label>
          <input id="t-phone" className="input" required type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
        {error && <p className="text-sm text-danger-fg">{error}</p>}
        <button className="btn w-full !py-3">Track order</button>
      </form>
    </div>
  );
}
