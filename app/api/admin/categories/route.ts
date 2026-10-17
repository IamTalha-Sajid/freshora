import { crud } from "@/lib/crud";
import { Category } from "@/lib/models/Category";
import { categorySchema } from "@/lib/schemas";

const c = crud({ model: Category, schema: categorySchema, sort: { order: 1, name: 1 } });
export const GET = c.list;
export const POST = c.create;
