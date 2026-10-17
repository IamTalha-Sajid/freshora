import { crud } from "@/lib/crud";
import { Product } from "@/lib/models/Product";
import { productSchema } from "@/lib/schemas";

const c = crud({ model: Product, schema: productSchema });
export const PUT = c.update;
export const DELETE = c.remove;
