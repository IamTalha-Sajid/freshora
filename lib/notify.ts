import type { IOrder } from "@/lib/models/Order";
import { formatPKR } from "@/lib/pricing";

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

async function send(to: string, subject: string, html: string) {
  const key = process.env.RESEND_API_KEY;
  if (!key || !to) return;
  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: process.env.EMAIL_FROM ?? "Freshora <orders@freshora.com>", to, subject, html }),
    });
  } catch (e) {
    console.error("Email failed", e);
  }
}

/** Email the store owner (and the customer, when they gave an address). Silent no-op until RESEND_API_KEY is set. */
export async function notifyNewOrder(order: Pick<IOrder, "orderNumber" | "items" | "customer" | "total" | "paymentMethod">, storeEmail?: string) {
  const lines = order.items.map((i) => `<li>${esc(i.name)} × ${i.qty}</li>`).join("");
  const body = `<p>Order <b>${esc(order.orderNumber)}</b> — ${formatPKR(order.total)} (${order.paymentMethod === "cod" ? "cash on delivery" : "bank transfer"})</p><ul>${lines}</ul>`;
  const to = process.env.ORDER_NOTIFY_EMAIL || storeEmail;
  await Promise.all([
    to ? send(to, `New order ${order.orderNumber}`, `${body}<p>${esc(order.customer.name)}, ${esc(order.customer.phone)}<br>${esc(order.customer.address)}, ${esc(order.customer.city)}</p>`) : undefined,
    order.customer.email ? send(order.customer.email, `We got your order ${order.orderNumber}`, `<p>Thanks, ${esc(order.customer.name)}!</p>${body}<p>Keep your order number to track delivery.</p>`) : undefined,
  ]);
}
