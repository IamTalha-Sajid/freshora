import { isValidObjectId } from "mongoose";
import { z } from "zod";
import { api, HttpError } from "@/lib/api";
import { ORDER_STATUSES, Order, type OrderStatus } from "@/lib/models/Order";
import { Product } from "@/lib/models/Product";

type Ctx = { params: Promise<{ id: string }> };

const patch = z.object({ status: z.enum(ORDER_STATUSES).optional(), paymentStatus: z.enum(["unpaid", "paid"]).optional() });

// An order only moves forward, or out via cancellation. Delivered and cancelled are final.
const NEXT: Record<OrderStatus, OrderStatus[]> = {
  pending: ["confirmed", "shipped", "cancelled"],
  confirmed: ["shipped", "cancelled"],
  shipped: ["delivered", "cancelled"],
  delivered: [],
  cancelled: [],
};

export const GET = api<Ctx>(
  async (_req, { params }) => {
    const id = (await params).id;
    if (!isValidObjectId(id)) throw new HttpError(404, "Not found");
    const order = await Order.findById(id).lean();
    if (!order) throw new HttpError(404, "Not found");
    return order;
  },
  { admin: true }
);

export const PUT = api<Ctx>(
  async (req, { params }) => {
    const id = (await params).id;
    if (!isValidObjectId(id)) throw new HttpError(404, "Not found");
    const data = patch.parse(await req.json());
    const order = await Order.findById(id);
    if (!order) throw new HttpError(404, "Not found");

    const from = order.status;
    const set: Record<string, unknown> = {};
    if (data.status && data.status !== from) {
      if (!NEXT[from].includes(data.status)) throw new HttpError(400, `A ${from} order can't be changed to ${data.status}`);
      set.status = data.status;
    }
    if (data.paymentStatus && data.paymentStatus !== order.paymentStatus) {
      if (from === "cancelled") throw new HttpError(400, "Cancelled orders can't change payment status");
      set.paymentStatus = data.paymentStatus;
    }
    // Cash on delivery is collected on delivery.
    if (set.status === "delivered" && order.paymentMethod === "cod") set.paymentStatus = "paid";
    if (Object.keys(set).length === 0) return order;

    // Compare-and-set on the status we read, so two admins (or a double click) can't both apply the same
    // change. Only the request that wins the swap restores stock.
    const updated = await Order.findOneAndUpdate({ _id: id, status: from }, { $set: set }, { returnDocument: "after" });
    if (!updated) throw new HttpError(409, "This order was just changed by someone else. Reload and try again.");
    if (set.status === "cancelled") {
      await Promise.all(order.items.map((i) => Product.findByIdAndUpdate(i.product, { $inc: { stock: i.qty } })));
    }
    return updated;
  },
  { admin: true }
);
