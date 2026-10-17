import { api, HttpError } from "@/lib/api";
import { Product } from "@/lib/models/Product";
import { Review } from "@/lib/models/Review";

type Ctx = { params: Promise<{ id: string }> };

async function recalc(productId: unknown) {
  const [agg] = await Review.aggregate([
    { $match: { product: productId, approved: true } },
    { $group: { _id: null, avg: { $avg: "$rating" }, n: { $sum: 1 } } },
  ]);
  await Product.findByIdAndUpdate(productId, { ratingAvg: agg ? Math.round(agg.avg * 10) / 10 : 0, ratingCount: agg?.n ?? 0 });
}

export const PUT = api<Ctx>(
  async (req, { params }) => {
    const { id } = await params;
    const { approved } = (await req.json()) as { approved: boolean };
    const r = await Review.findByIdAndUpdate(id, { approved: !!approved }, { returnDocument: "after" });
    if (!r) throw new HttpError(404, "Not found");
    await recalc(r.product);
    return r;
  },
  { admin: true }
);

export const DELETE = api<Ctx>(
  async (_req, { params }) => {
    const { id } = await params;
    const r = await Review.findByIdAndDelete(id);
    if (r) await recalc(r.product);
    return { ok: true };
  },
  { admin: true }
);
