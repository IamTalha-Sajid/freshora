import { crud } from "@/lib/crud";
import { Bundle } from "@/lib/models/Bundle";
import { bundleSchema } from "@/lib/schemas";

const c = crud({ model: Bundle, schema: bundleSchema, populate: "items.product" });
export const GET = c.list;
export const POST = c.create;
