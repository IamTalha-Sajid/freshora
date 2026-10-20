import { crud } from "@/lib/crud";
import { Bundle } from "@/lib/models/Bundle";
import { Product } from "@/lib/models/Product";
import { Review } from "@/lib/models/Review";
import { productRules } from "@/lib/product-rules";
import { productSchema } from "@/lib/schemas";

const c = crud({
  model: Product,
  schema: productSchema,
  validate: productRules,
  deltaField: "stock",
  // No orphans: drop the product's reviews and take it out of any bundle (a bundle left empty goes offline).
  afterRemove: async (id) => {
    await Review.deleteMany({ product: id });
    await Bundle.updateMany({ "items.product": id }, { $pull: { items: { product: id } } });
    await Bundle.updateMany({ items: { $size: 0 } }, { active: false });
  },
});
export const PUT = c.update;
export const DELETE = c.remove;
