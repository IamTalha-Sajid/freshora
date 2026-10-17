import { crud } from "@/lib/crud";
import { Bundle } from "@/lib/models/Bundle";
import { bundleSchema } from "@/lib/schemas";

const c = crud({ model: Bundle, schema: bundleSchema });
export const PUT = c.update;
export const DELETE = c.remove;
