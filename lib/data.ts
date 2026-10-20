import type { QueryFilter } from "mongoose";
import { connectDB } from "@/lib/db";
import { Bundle } from "@/lib/models/Bundle";
import { Category, type ICategory } from "@/lib/models/Category";
import { HeroSlide, type IHeroSlide } from "@/lib/models/HeroSlide";
import { Product, type IProduct } from "@/lib/models/Product";
import { Review, type IReview } from "@/lib/models/Review";

/** Convert Mongo docs (ObjectIds, Dates) to plain JSON-safe objects for client components. */
export function plain<T>(doc: unknown): T {
  return JSON.parse(JSON.stringify(doc));
}

export type PCategory = Omit<ICategory, "_id" | "parent"> & { _id: string; parent: string | null };
export type PProduct = Omit<IProduct, "_id" | "category" | "saleStart" | "saleEnd"> & {
  _id: string;
  category: string;
  saleStart?: string;
  saleEnd?: string;
};
export type PBundle = { _id: string; name: string; slug: string; image?: string; price: number; items: { product: PProduct; qty: number }[] };

export async function getCategories(): Promise<PCategory[]> {
  await connectDB();
  return plain(await Category.find({ active: true }).sort({ order: 1, name: 1 }).lean());
}

/** A category id plus all of its descendants. */
export function descendantIds(all: PCategory[], rootId: string) {
  const ids = [rootId];
  const seen = new Set(ids); // guards against a corrupt parent loop
  for (let i = 0; i < ids.length; i++) {
    for (const c of all) {
      if (c.parent === ids[i] && !seen.has(c._id)) {
        seen.add(c._id);
        ids.push(c._id);
      }
    }
  }
  return ids;
}

export async function getHeroSlides(): Promise<(Omit<IHeroSlide, "_id"> & { _id: string })[]> {
  await connectDB();
  return plain(await HeroSlide.find({ active: true }).sort({ order: 1 }).lean());
}

const saleNow = () => {
  const now = new Date();
  return {
    $expr: { $lt: ["$salePrice", "$price"] },
    salePrice: { $gt: 0 },
    $and: [
      { $or: [{ saleStart: null }, { saleStart: { $lte: now } }] },
      { $or: [{ saleEnd: null }, { saleEnd: { $gte: now } }] },
    ],
  };
};

export async function getFeaturedProducts(limit = 8): Promise<PProduct[]> {
  await connectDB();
  return plain(await Product.find({ active: true, featured: true }).sort({ createdAt: -1 }).limit(limit).lean());
}

export async function getSaleProducts(limit = 8): Promise<PProduct[]> {
  await connectDB();
  return plain(await Product.find({ active: true, ...saleNow() }).sort({ updatedAt: -1 }).limit(limit).lean());
}

export async function getBundles(): Promise<PBundle[]> {
  await connectDB();
  return plain(await Bundle.find({ active: true }).sort({ createdAt: -1 }).populate("items.product").lean());
}

export type ShopQuery = { q?: string; category?: string; min?: number; max?: number; sale?: boolean; sort?: string; page?: number };
export const PAGE_SIZE = 12;

export async function searchProducts(sp: ShopQuery) {
  await connectDB();
  const filter: QueryFilter<IProduct> = { active: true };
  const and: QueryFilter<IProduct>[] = [];
  if (sp.q) {
    const rx = new RegExp(sp.q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    and.push({ $or: [{ name: rx }, { tags: rx }, { sku: rx }, { shortDescription: rx }] });
  }
  if (sp.category) {
    const cats = await getCategories();
    const root = cats.find((c) => c.slug === sp.category);
    if (root) filter.category = { $in: descendantIds(cats, root._id) };
    else return { products: [], total: 0, pages: 0 };
  }
  if (sp.sale) and.push(saleNow() as QueryFilter<IProduct>);
  // Filter on the price a customer actually pays (sale price when a sale is active).
  if (sp.min != null || sp.max != null) {
    const now = new Date();
    const eff = { $cond: [{ $and: [{ $lt: [{ $ifNull: ["$salePrice", 1e12] }, "$price"] }, { $or: [{ $eq: [{ $ifNull: ["$saleStart", null] }, null] }, { $lte: ["$saleStart", now] }] }, { $or: [{ $eq: [{ $ifNull: ["$saleEnd", null] }, null] }, { $gte: ["$saleEnd", now] }] }] }, "$salePrice", "$price"] };
    if (sp.min != null) and.push({ $expr: { $gte: [eff, sp.min] } });
    if (sp.max != null) and.push({ $expr: { $lte: [eff, sp.max] } });
  }
  if (and.length) filter.$and = and;

  const sort: Record<string, 1 | -1> =
    sp.sort === "price-asc" ? { price: 1 } : sp.sort === "price-desc" ? { price: -1 } : sp.sort === "rating" ? { ratingAvg: -1, ratingCount: -1 } : { createdAt: -1 };
  const page = Math.max(1, sp.page ?? 1);
  const [products, total] = await Promise.all([
    Product.find(filter).sort(sort).skip((page - 1) * PAGE_SIZE).limit(PAGE_SIZE).lean(),
    Product.countDocuments(filter),
  ]);
  return { products: plain<PProduct[]>(products), total, pages: Math.ceil(total / PAGE_SIZE) };
}

export async function getProductBySlug(slug: string): Promise<PProduct | null> {
  await connectDB();
  const p = await Product.findOne({ slug, active: true }).lean();
  return p ? plain(p) : null;
}

export type LatestReview = { _id: string; name: string; rating: number; comment: string; product: { name: string; slug: string } | null };

export async function getLatestReviews(limit = 6): Promise<LatestReview[]> {
  await connectDB();
  const rows = await Review.find({ approved: true }).sort({ createdAt: -1 }).limit(limit).populate("product", "name slug").lean();
  return plain(rows);
}

export async function getReviewStats(): Promise<{ count: number; average: number }> {
  await connectDB();
  const [row] = await Review.aggregate<{ count: number; average: number }>([
    { $match: { approved: true } },
    { $group: { _id: null, count: { $sum: 1 }, average: { $avg: "$rating" } } },
  ]);
  return row ? { count: row.count, average: Math.round(row.average * 10) / 10 } : { count: 0, average: 0 };
}

export async function getApprovedReviews(productId: string) {
  await connectDB();
  return plain<(Omit<IReview, "_id" | "product"> & { _id: string })[]>(await Review.find({ product: productId, approved: true }).sort({ createdAt: -1 }).limit(50).lean());
}
