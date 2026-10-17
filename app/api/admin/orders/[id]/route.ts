import { z } from "zod";
import { api, HttpError } from "@/lib/api";
import { ORDER_STATUSES, Order } from "@/lib/models/Order";
import { Product } from "@/lib/models/Product";

type Ctx = { params: Promise<{ id: string }> };

const patch = z.object({ status: z.enum(ORDER_STATUSES).optional(), paymentStatus: z.enum(["unpaid", "paid"]).optional() });

export const GET = api<Ctx>(
  async (_req, { params }) => {
    const order = await Order.findById((await params).id).lean();
    if (!order) throw new HttpError(404, "Not found");
    return order;
  },
  { admin: true }
);

export const PUT = api<Ctx>(
  async (req, { params }) => {
    const data = patch.parse(await req.json());
    const order = await Order.findById((await params).id);
    if (!order) throw new HttpError(404, "Not found");
    if (order.status === "cancelled" && data.status && data.status !== "cancelled") throw new HttpError(400, "Cancelled orders cannot be reopened");
    if (data.status === "cancelled" && order.status !== "cancelled") {
      await Promise.all(order.items.map((i) => Product.findByIdAndUpdate(i.product, { $inc: { stock: i.qty } })));
    }
    if (data.status) order.status = data.status;
    if (data.paymentStatus) order.paymentStatus = data.paymentStatus;
    // Cash on delivery is collected on delivery.
    if (data.status === "delivered" && order.paymentMethod === "cod") order.paymentStatus = "paid";
    await order.save();
    return order;
  },
  { admin: true }
);
