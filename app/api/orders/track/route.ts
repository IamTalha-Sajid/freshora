import { api, HttpError } from "@/lib/api";
import { Order } from "@/lib/models/Order";
import { normalizePhone } from "@/lib/phone";
import { clientIp, rateLimit } from "@/lib/ratelimit";

// Order number + phone must both match. Numbers are compared in normalised form, so
// 0300 1234567 and +92 300 1234567 are the same phone.
export const GET = api(async (req) => {
  rateLimit(`track:${clientIp(req)}`, 10, 10 * 60_000);
  const sp = new URL(req.url).searchParams;
  const number = (sp.get("number") ?? "").trim().toUpperCase().slice(0, 40);
  const phone = normalizePhone(sp.get("phone") ?? "");
  const order = await Order.findOne({ orderNumber: number }).select("orderNumber customer.phone").lean();
  if (!order || !phone || normalizePhone(order.customer.phone) !== phone) throw new HttpError(404, "No order found with those details");
  return { orderNumber: order.orderNumber };
});
