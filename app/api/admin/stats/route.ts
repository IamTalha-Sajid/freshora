import { api } from "@/lib/api";
import { Order } from "@/lib/models/Order";
import { Product } from "@/lib/models/Product";
import { getSettings } from "@/lib/models/Settings";

export const GET = api(
  async () => {
    const settings = await getSettings();
    const since = new Date(Date.now() - 30 * 86400000);
    const live = { status: { $ne: "cancelled" } };
    const paid = { ...live, paymentStatus: "paid" };
    const [byStatus, totals, daily, top, lowStock] = await Promise.all([
      Order.aggregate([{ $group: { _id: "$status", n: { $sum: 1 } } }]),
      Order.aggregate([{ $match: live }, { $group: { _id: null, revenue: { $sum: { $cond: [{ $eq: ["$paymentStatus", "paid"] }, "$total", 0] } }, outstanding: { $sum: { $cond: [{ $eq: ["$paymentStatus", "paid"] }, 0, "$total"] } }, orders: { $sum: 1 } } }]),
      Order.aggregate([
        { $match: { ...paid, createdAt: { $gte: since } } },
        { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, revenue: { $sum: "$total" }, orders: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      Order.aggregate([
        { $match: live },
        { $unwind: "$items" },
        { $group: { _id: "$items.product", name: { $first: "$items.name" }, qty: { $sum: "$items.qty" }, revenue: { $sum: { $multiply: ["$items.price", "$items.qty"] } } } },
        { $sort: { qty: -1 } },
        { $limit: 5 },
      ]),
      Product.find({ active: true, $expr: { $lte: ["$stock", { $ifNull: ["$lowStockThreshold", settings.defaultLowStock] }] } })
        .select("name stock sku lowStockThreshold")
        .sort({ stock: 1 })
        .limit(20)
        .lean(),
    ]);
    return { byStatus, revenue: totals[0]?.revenue ?? 0, outstanding: totals[0]?.outstanding ?? 0, orders: totals[0]?.orders ?? 0, daily, top, lowStock };
  },
  { admin: true }
);
