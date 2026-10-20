import { api, HttpError } from "@/lib/api";
import { categoryRules } from "@/lib/category-rules";
import { crud } from "@/lib/crud";
import { Category } from "@/lib/models/Category";
import { Product } from "@/lib/models/Product";
import { categorySchema } from "@/lib/schemas";

const c = crud({ model: Category, schema: categorySchema, validate: categoryRules });
export const PUT = c.update;

export const DELETE = api<{ params: Promise<{ id: string }> }>(
  async (_req, { params }) => {
    const { id } = await params;
    if (await Product.exists({ category: id })) throw new HttpError(409, "Category has products. Move or delete them first.");
    if (await Category.exists({ parent: id })) throw new HttpError(409, "Category has sub-categories. Delete them first.");
    await Category.findByIdAndDelete(id);
    return { ok: true };
  },
  { admin: true }
);
