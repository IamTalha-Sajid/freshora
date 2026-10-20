import { api } from "@/lib/api";
import { plain } from "@/lib/data";
import { Product } from "@/lib/models/Product";
import { effectivePrice } from "@/lib/pricing";
import { clientIp, rateLimit } from "@/lib/ratelimit";

// Public: instant search suggestions for the header.
export const GET = api(async (req) => {
  rateLimit(`search:${clientIp(req)}`, 90, 60_000);
  const q = (new URL(req.url).searchParams.get("q") ?? "").trim().slice(0, 60);
  if (q.length < 2) return [];
  const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
  const rows = await Product.find({ active: true, $or: [{ name: rx }, { tags: rx }, { sku: rx }] })
    .select("name slug images price salePrice saleStart saleEnd")
    .sort({ ratingCount: -1, createdAt: -1 })
    .limit(6)
    .lean();
  return plain<{ _id: string; name: string; slug: string; images: string[]; price: number; salePrice?: number; saleStart?: string; saleEnd?: string }[]>(rows).map((p) => ({
    _id: p._id,
    name: p.name,
    slug: p.slug,
    image: p.images[0],
    price: effectivePrice(p),
  }));
});
