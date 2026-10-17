"use client";

import { useCallback, useEffect, useState } from "react";
import { adminFetch, ErrorMsg, PageHeader } from "@/components/admin/ui";
import { formatPKR } from "@/lib/pricing";

type Order = {
  _id: string;
  orderNumber: string;
  createdAt: string;
  items: { name: string; price: number; qty: number }[];
  customer: { name: string; phone: string; email?: string; address: string; city: string; notes?: string };
  paymentMethod: "cod" | "bank";
  paymentReference?: string;
  paymentStatus: "unpaid" | "paid";
  status: string;
  subtotal: number;
  shipping: number;
  total: number;
};

const STATUSES = ["pending", "confirmed", "shipped", "delivered", "cancelled"];
const badge: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  confirmed: "bg-blue-100 text-blue-700",
  shipped: "bg-indigo-100 text-indigo-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-gray-200 text-gray-600",
};

export default function OrdersAdmin() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [status, setStatus] = useState("");
  const [open, setOpen] = useState<string | null>(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => setOrders(await adminFetch<Order[]>(`/api/admin/orders${status ? `?status=${status}` : ""}`)), [status]);
  useEffect(() => {
    load().catch((e) => setError(e.message));
  }, [load]);

  async function update(o: Order, patch: object) {
    if ("status" in patch && (patch as { status: string }).status === "cancelled" && !confirm("Cancel this order? Stock will be restored.")) return;
    try {
      await adminFetch(`/api/admin/orders/${o._id}`, "PUT", patch);
      setError("");
      await load();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  return (
    <>
      <PageHeader title="Orders">
        <select className="input !w-44" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </PageHeader>
      <ErrorMsg msg={error} />
      <div className="space-y-3">
        {orders.map((o) => (
          <div key={o._id} className="card">
            <button className="flex w-full flex-wrap items-center justify-between gap-3 p-4 text-left" onClick={() => setOpen(open === o._id ? null : o._id)}>
              <div>
                <div className="font-mono font-bold">{o.orderNumber}</div>
                <div className="text-sm text-gray-500">{o.customer.name} · {o.customer.city} · {new Date(o.createdAt).toLocaleString()}</div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <span className="uppercase text-gray-500">{o.paymentMethod}</span>
                <span className={o.paymentStatus === "paid" ? "font-semibold text-green-600" : "text-gray-400"}>{o.paymentStatus}</span>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${badge[o.status]}`}>{o.status}</span>
                <span className="font-bold">{formatPKR(o.total)}</span>
              </div>
            </button>
            {open === o._id && (
              <div className="grid gap-6 border-t p-4 md:grid-cols-2">
                <div className="space-y-1 text-sm">
                  <div className="font-bold">Customer</div>
                  <div>{o.customer.name}</div>
                  <div><a className="text-brand" href={`tel:${o.customer.phone}`}>{o.customer.phone}</a></div>
                  {o.customer.email && <div>{o.customer.email}</div>}
                  <div>{o.customer.address}, {o.customer.city}</div>
                  {o.customer.notes && <div className="rounded bg-amber-50 p-2">Note: {o.customer.notes}</div>}
                  {o.paymentMethod === "bank" && <div className="rounded bg-brand-soft p-2">Transfer ref: <b>{o.paymentReference}</b></div>}
                </div>
                <div className="space-y-2 text-sm">
                  <div className="font-bold">Items</div>
                  {o.items.map((i, k) => <div key={k} className="flex justify-between"><span>{i.name} × {i.qty}</span><span>{formatPKR(i.price * i.qty)}</span></div>)}
                  <div className="flex justify-between border-t pt-1"><span>Shipping</span><span>{formatPKR(o.shipping)}</span></div>
                  <div className="flex justify-between font-bold"><span>Total</span><span>{formatPKR(o.total)}</span></div>
                </div>
                <div className="flex flex-wrap items-center gap-3 md:col-span-2">
                  <label className="text-sm font-semibold">Status</label>
                  <select className="input !w-40" value={o.status} disabled={o.status === "cancelled"} onChange={(e) => update(o, { status: e.target.value })}>
                    {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                  {o.paymentStatus === "unpaid" ? (
                    <button className="btn" onClick={() => update(o, { paymentStatus: "paid" })}>{o.paymentMethod === "bank" ? "Approve bank payment" : "Mark as paid"}</button>
                  ) : (
                    <button className="btn-outline" onClick={() => update(o, { paymentStatus: "unpaid" })}>Mark unpaid</button>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
        {orders.length === 0 && <div className="card p-10 text-center text-gray-500">No orders.</div>}
      </div>
    </>
  );
}
