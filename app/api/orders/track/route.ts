import { api, HttpError } from "@/lib/api";
import { Order } from "@/lib/models/Order";

const digits = (s: string) => s.replace(/\D/g, "");

// Order number + phone must both match, so order numbers alone can't be used to browse orders.
export const GET = api(async (req) => {
  const sp = new URL(req.url).searchParams;
  const number = (sp.get("number") ?? "").trim().toUpperCase();
  const phone = digits(sp.get("phone") ?? "");
  const order = await Order.findOne({ orderNumber: number }).select("orderNumber customer.phone").lean();
  if (!order || !phone || digits(order.customer.phone) !== phone) throw new HttpError(404, "No order found with those details");
  return { orderNumber: order.orderNumber };
});
