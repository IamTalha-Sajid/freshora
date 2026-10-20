import { z } from "zod";
import { api } from "@/lib/api";
import { Bundle } from "@/lib/models/Bundle";
import { Product } from "@/lib/models/Product";
import { effectivePrice } from "@/lib/pricing";
import { clientIp, rateLimit } from "@/lib/ratelimit";

const body = z.object({
  items: z.array(z.object({ kind: z.enum(["product", "bundle"]), id: z.string().regex(/^[a-f\d]{24}$/i) })).max(50),
});

export type CartCheckLine = { kind: "product" | "bundle"; id: string; available: boolean; price: number; stock: number };

// Public: current price and stock for what's in a visitor's cart, so the browser's saved copy never goes stale.
export const POST = api(async (req) => {
  rateLimit(`cart:${clientIp(req)}`, 60, 60_000);
  const { items } = body.parse(await req.json());
  const bundles = await Bundle.find({ _id: { $in: items.filter((i) => i.kind === "bundle").map((i) => i.id) }, active: true }).lean();
  const ids = new Set([...items.filter((i) => i.kind === "product").map((i) => i.id), ...bundles.flatMap((b) => b.items.map((i) => String(i.product)))]);
  const products = new Map((await Product.find({ _id: { $in: [...ids] }, active: true }).lean()).map((p) => [String(p._id), p]));

  const lines: CartCheckLine[] = items.map((it) => {
    if (it.kind === "product") {
      const p = products.get(it.id);
      return p ? { ...it, available: p.stock > 0, price: effectivePrice(p), stock: p.stock } : { ...it, available: false, price: 0, stock: 0 };
    }
    const b = bundles.find((x) => String(x._id) === it.id);
    const parts = b?.items.map((i) => ({ p: products.get(String(i.product)), qty: i.qty })) ?? [];
    if (!b || parts.length === 0 || parts.some((x) => !x.p)) return { ...it, available: false, price: 0, stock: 0 };
    const stock = Math.min(...parts.map((x) => Math.floor(x.p!.stock / x.qty)));
    return { ...it, available: stock > 0, price: b.price, stock };
  });
  return { lines };
});
