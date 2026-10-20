import { crud } from "@/lib/crud";
import { Product } from "@/lib/models/Product";
import { productRules } from "@/lib/product-rules";
import { productSchema } from "@/lib/schemas";

const c = crud({ model: Product, schema: productSchema, populate: "category", validate: productRules, deltaField: "stock" });
export const GET = c.list;
export const POST = c.create;
