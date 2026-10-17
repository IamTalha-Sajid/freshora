import { api } from "@/lib/api";
import { ORDER_STATUSES, Order } from "@/lib/models/Order";

export const GET = api(
  async (req) => {
    const status = new URL(req.url).searchParams.get("status");
    const valid = ORDER_STATUSES.find((s) => s === status);
    return Order.find(valid ? { status: valid } : {}).sort({ createdAt: -1 }).limit(300).lean();
  },
  { admin: true }
);
