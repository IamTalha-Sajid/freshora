import { notFound } from "next/navigation";
import { Icon } from "@/components/Icon";
import { plain } from "@/lib/data";
import { connectDB } from "@/lib/db";
import { Order, type IOrder } from "@/lib/models/Order";
import { getSettings } from "@/lib/models/Settings";
import { formatPKR } from "@/lib/pricing";

export const metadata = { title: "Order status", robots: { index: false, follow: false } };

const STEPS = ["pending", "confirmed", "shipped", "delivered"];

export default async function OrderPage({ params }: PageProps<"/order/[number]">) {
  const { number } = await params;
  await connectDB();
  const doc = await Order.findOne({ orderNumber: decodeURIComponent(number).toUpperCase().slice(0, 40) }).lean();
  if (!doc) notFound();
  const o = plain<IOrder>(doc);
  const settings = await getSettings();
  const idx = STEPS.indexOf(o.status);
  const cancelled = o.status === "cancelled";

  return (
    <div className="container-x max-w-2xl py-10">
      <div className="mb-8 text-center">
        <span className={`mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full ${cancelled ? "bg-danger/15 text-danger-fg" : "bg-mint text-[#06141b]"}`}>
          <Icon name={cancelled ? "close" : "check"} size={30} />
        </span>
        <h1 className="text-3xl">{cancelled ? "Order cancelled" : "Thank you for your order!"}</h1>
        <p className="mt-2 text-muted">
          Order number: <span className="font-mono font-semibold text-fg">{o.orderNumber}</span>
        </p>
        <p className="text-xs text-muted">Save this number to track your order.</p>
      </div>

      {!cancelled && (
        <ol className="mb-8 grid grid-cols-4 gap-2 text-center text-xs">
          {STEPS.map((s, i) => (
            <li key={s} className={`border-t-4 pt-2 font-semibold capitalize ${i <= idx ? "border-mint text-link" : "border-line text-muted"}`}>
              {s}
            </li>
          ))}
        </ol>
      )}

      {o.paymentMethod === "bank" && o.paymentStatus === "unpaid" && !cancelled && (
        <div className="mb-6 rounded-2xl border border-warning/50 bg-warning/10 p-4 text-sm">
          <p className="font-semibold">Awaiting bank transfer verification</p>
          {settings.bankDetails && <p className="mt-1 whitespace-pre-line">{settings.bankDetails}</p>}
          <p className="mt-1 text-muted">Reference given: ••••{o.paymentReference?.slice(-4)}</p>
        </div>
      )}

      <div className="card divide-y divide-line">
        {o.items.map((i, k) => (
          <div key={k} className="flex items-center gap-3 p-4 text-sm">
            <div className="h-12 w-12 shrink-0 rounded-xl bg-surface-alt">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {i.image && <img src={i.image} alt="" className="h-full w-full object-contain p-1" />}
            </div>
            <span className="flex-1">
              {i.name} × {i.qty}
            </span>
            <span className="tabular">{formatPKR(i.price * i.qty)}</span>
          </div>
        ))}
        <div className="flex justify-between p-4 text-sm">
          <span className="text-muted">Subtotal</span>
          <span className="tabular">{formatPKR(o.subtotal)}</span>
        </div>
        <div className="flex justify-between p-4 text-sm">
          <span className="text-muted">Shipping</span>
          <span className="tabular">{o.shipping === 0 ? "Free" : formatPKR(o.shipping)}</span>
        </div>
        <div className="flex justify-between p-4 text-lg font-semibold">
          <span>
            Total <span className="text-sm font-normal text-muted">({o.paymentMethod === "cod" ? "cash on delivery" : o.paymentStatus})</span>
          </span>
          <span className="tabular">{formatPKR(o.total)}</span>
        </div>
      </div>
    </div>
  );
}
