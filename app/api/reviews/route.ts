import { api, HttpError } from "@/lib/api";
import { Product } from "@/lib/models/Product";
import { Review } from "@/lib/models/Review";
import { clientIp, rateLimit } from "@/lib/ratelimit";
import { reviewSchema } from "@/lib/schemas";

export const POST = api(async (req) => {
  const ip = clientIp(req);
  rateLimit(`review:${ip}`, 5, 60 * 60_000);
  const data = reviewSchema.parse(await req.json());
  if (!(await Product.exists({ _id: data.product, active: true }))) throw new HttpError(404, "Product not found");
  // One pending review per name per product: stops the same text being posted over and over.
  if (await Review.exists({ product: data.product, name: data.name, comment: data.comment })) return { ok: true };
  await Review.create(data); // approved: false until an admin moderates it
  return { ok: true };
});
