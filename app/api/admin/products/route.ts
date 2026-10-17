import { crud } from "@/lib/crud";
import { Product } from "@/lib/models/Product";
import { productSchema } from "@/lib/schemas";

const c = crud({ model: Product, schema: productSchema, populate: "category" });
export const GET = c.list;
export const POST = c.create;
