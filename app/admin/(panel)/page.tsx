"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { adminFetch, ErrorMsg, PageHeader } from "@/components/admin/ui";
import { formatPKR } from "@/lib/pricing";

type Stats = {
  byStatus: { _id: string; n: number }[];
  revenue: number;
  orders: number;
  daily: { _id: string; revenue: number; orders: number }[];
  top: { _id: string; name: string; qty: number; revenue: number }[];
  lowStock: { _id: string; name: string; stock: number; sku?: string }[];
};

export default function Dashboard() {
  const [s, setS] = useState<Stats | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    adminFetch<Stats>("/api/admin/stats").then(setS).catch((e) => setError(e.message));
  }, []);

  if (error) return <ErrorMsg msg={error} />;
  if (!s) return <p>Loading…</p>;
  const count = (st: string) => s.byStatus.find((x) => x._id === st)?.n ?? 0;
  const max = Math.max(1, ...s.daily.map((d) => d.revenue));

  return (
    <>
      <PageHeader title="Dashboard" />
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          ["Revenue (excl. cancelled)", formatPKR(s.revenue)],
          ["Orders", String(s.orders)],
          ["Pending orders", String(count("pending"))],
          ["Low-stock products", String(s.lowStock.length)],
        ].map(([k, v]) => (
          <div key={k} className="card p-4">
            <div className="text-xs font-semibold uppercase text-gray-500">{k}</div>
            <div className="mt-1 text-2xl font-bold">{v}</div>
          </div>
        ))}
      </div>

      <div className="card mb-6 p-4">
        <h2 className="mb-3 font-bold">Revenue, last 30 days</h2>
        {s.daily.length === 0 ? (
          <p className="text-sm text-gray-500">No orders yet.</p>
        ) : (
          <div className="flex h-40 items-end gap-1">
            {s.daily.map((d) => (
              <div key={d._id} className="group relative flex-1 rounded-t bg-brand/80 hover:bg-brand" style={{ height: `${(d.revenue / max) * 100}%`, minHeight: 2 }}>
                <div className="pointer-events-none absolute -top-8 left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded bg-gray-900 px-2 py-1 text-xs text-white group-hover:block">
                  {d._id}: {formatPKR(d.revenue)} ({d.orders})
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card p-4">
          <h2 className="mb-3 font-bold">Top products</h2>
          {s.top.length === 0 ? (
            <p className="text-sm text-gray-500">No sales yet.</p>
          ) : (
            <table className="w-full text-sm">
              <tbody>
                {s.top.map((t) => (
                  <tr key={t._id} className="border-t">
                    <td className="py-2">{t.name}</td>
                    <td className="py-2 text-right">{t.qty} sold</td>
                    <td className="py-2 text-right font-semibold">{formatPKR(t.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <div className="card p-4">
          <h2 className="mb-3 font-bold">Low stock</h2>
          {s.lowStock.length === 0 ? (
            <p className="text-sm text-gray-500">All products are well stocked.</p>
          ) : (
            <table className="w-full text-sm">
              <tbody>
                {s.lowStock.map((p) => (
                  <tr key={p._id} className="border-t">
                    <td className="py-2">
                      <Link href="/admin/products" className="hover:text-brand">
                        {p.name}
                      </Link>
                      {p.sku && <span className="ml-2 text-xs text-gray-400">{p.sku}</span>}
                    </td>
                    <td className={`py-2 text-right font-semibold ${p.stock === 0 ? "text-red-600" : "text-amber-600"}`}>{p.stock === 0 ? "Out of stock" : `${p.stock} left`}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}
