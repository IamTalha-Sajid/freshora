import { HttpError } from "@/lib/api";
import { Category } from "@/lib/models/Category";

export async function productRules(data: Record<string, unknown>) {
  if (!(await Category.exists({ _id: data.category as string }))) throw new HttpError(400, "Category not found");
}
