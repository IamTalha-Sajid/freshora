import { api } from "@/lib/api";
import { ORDER_STATUSES, Order } from "@/lib/models/Order";

const PAGE = 50;

// Newest first, 50 at a time: pass ?skip=50, ?skip=100… for older orders.
export const GET = api(
  async (req) => {
    const sp = new URL(req.url).searchParams;
    const valid = ORDER_STATUSES.find((s) => s === sp.get("status"));
    const skip = Math.max(0, Math.min(100_000, Number(sp.get("skip")) || 0));
    return Order.find(valid ? { status: valid } : {}).sort({ createdAt: -1 }).skip(skip).limit(PAGE).lean();
  },
  { admin: true }
);
