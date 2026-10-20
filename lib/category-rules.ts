import { HttpError } from "@/lib/api";
import { Category } from "@/lib/models/Category";

/** A parent must exist and must not be the category itself or one of its descendants (that would create a loop). */
export async function categoryRules(data: Record<string, unknown>, id?: string) {
  const parent = data.parent as string | undefined;
  if (!parent) return;
  if (id && parent === id) throw new HttpError(400, "A category can't be its own parent");
  const seen = new Set<string>();
  for (let cur: string | undefined = parent; cur; ) {
    if (seen.has(cur)) throw new HttpError(400, "Category tree has a loop");
    seen.add(cur);
    if (id && cur === id) throw new HttpError(400, "A category can't be moved under its own sub-category");
    const doc: { parent?: unknown } | null = await Category.findById(cur).select("parent").lean();
    if (!doc) throw new HttpError(400, "Parent category not found");
    cur = doc.parent ? String(doc.parent) : undefined;
  }
}
