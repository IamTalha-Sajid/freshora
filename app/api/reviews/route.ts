import { api } from "@/lib/api";
import { Review } from "@/lib/models/Review";
import { reviewSchema } from "@/lib/schemas";

export const POST = api(async (req) => {
  const data = reviewSchema.parse(await req.json());
  await Review.create(data); // approved: false until an admin moderates it
  return { ok: true };
});
