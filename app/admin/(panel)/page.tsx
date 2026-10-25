"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Icon } from "@/components/Icon";
import { adminFetch, AdminLoading, ErrorMsg, PageHeader } from "@/components/admin/ui";
import { formatPKR } from "@/lib/pricing";

type Stats = {
  byStatus: { _id: string; n: number }[];
  revenue: number;
  outstanding: number;
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
  if (!s) return <AdminLoading />;
  const count = (st: string) => s.byStatus.find((x) => x._id === st)?.n ?? 0;
  const max = Math.max(1, ...s.daily.map((d) => d.revenue));

  return (
    <>
      <PageHeader title="Dashboard" />
      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        {[
          ["Revenue (paid)", formatPKR(s.revenue), "cash"],
          ["Awaiting payment", formatPKR(s.outstanding), "clock"],
          ["Orders", String(s.orders), "box"],
          ["Pending orders", String(count("pending")), "track"],
          ["Low-stock products", String(s.lowStock.length), "alert"],
        ].map(([k, v, icon]) => (
          <div key={k} className="card flex flex-col gap-3 p-4">
            <span className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-surface-alt text-link">
              <Icon name={icon} size={18} />
            </span>
            <div>
              <div className="text-xs font-bold uppercase tracking-[0.06em] text-muted">{k}</div>
              <div className="tabular mt-0.5 font-display text-2xl font-bold">{v}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="card mb-6 p-4">
        <h2 className="mb-3 font-semibold">Paid revenue, last 30 days</h2>
        {s.daily.length === 0 ? (
          <p className="text-sm text-muted">No orders yet.</p>
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
          <h2 className="mb-3 font-semibold">Top products</h2>
          {s.top.length === 0 ? (
            <p className="text-sm text-muted">No sales yet.</p>
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
          <h2 className="mb-3 font-semibold">Low stock</h2>
          {s.lowStock.length === 0 ? (
            <p className="text-sm text-muted">All products are well stocked.</p>
          ) : (
            <table className="w-full text-sm">
              <tbody>
                {s.lowStock.map((p) => (
                  <tr key={p._id} className="border-t">
                    <td className="py-2">
                      <Link href="/admin/products" className="hover:text-brand">
                        {p.name}
                      </Link>
                      {p.sku && <span className="ml-2 text-xs text-muted">{p.sku}</span>}
                    </td>
                    <td className={`py-2 text-right font-semibold ${p.stock === 0 ? "text-danger-fg" : "text-warn-fg"}`}>{p.stock === 0 ? "Out of stock" : `${p.stock} left`}</td>
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
