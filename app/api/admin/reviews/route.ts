import { api } from "@/lib/api";
import { Review } from "@/lib/models/Review";

export const GET = api(async () => Review.find().sort({ approved: 1, createdAt: -1 }).populate("product", "name slug").lean(), { admin: true });
