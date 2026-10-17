import { api } from "@/lib/api";
import { plain } from "@/lib/data";
import { Product } from "@/lib/models/Product";

// Public: fetch active products by id (used by the wishlist page).
export const GET = api(async (req) => {
  const ids = (new URL(req.url).searchParams.get("ids") ?? "").split(",").filter((s) => /^[a-f\d]{24}$/i.test(s)).slice(0, 100);
  return plain(await Product.find({ _id: { $in: ids }, active: true }).lean());
});
