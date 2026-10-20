import { z } from "zod";

// Admin forms send "" or null for blank optional fields; normalise to undefined.
const blank = (v: unknown) => (v === "" || v === null ? undefined : v);
const optStr = z.preprocess(blank, z.string().trim().optional());
const optNum = z.preprocess(blank, z.coerce.number().min(0).optional());
const optDate = z.preprocess(blank, z.coerce.date().optional());
const objectId = z.string().regex(/^[a-f\d]{24}$/i, "Invalid id");
const optId = z.preprocess(blank, objectId.optional());
const optEmail = z.preprocess(blank, z.string().trim().max(120).email("Enter a valid email").optional());
// Only site-relative paths or http(s) URLs: blocks javascript:/data: links and images saved by the admin forms.
const safeUrl = z.string().trim().min(1).max(2000).refine((v) => /^(\/(?!\/)|https?:\/\/)/i.test(v), "Must be an http(s) URL or a /path");
const optSafeUrl = z.preprocess(blank, safeUrl.optional());
const salePair = (d: { price: number; salePrice?: number; saleStart?: Date; saleEnd?: Date }, ctx: z.RefinementCtx) => {
  if (d.salePrice != null && d.salePrice >= d.price) ctx.addIssue({ code: "custom", path: ["salePrice"], message: "Sale price must be lower than the price" });
  if (d.saleStart && d.saleEnd && d.saleEnd <= d.saleStart) ctx.addIssue({ code: "custom", path: ["saleEnd"], message: "Sale end must be after the start" });
};

export const categorySchema = z.object({
  name: z.string().trim().min(1),
  slug: optStr,
  parent: optId,
  image: optSafeUrl,
  icon: optStr,
  order: z.coerce.number().default(0),
  active: z.boolean().default(true),
  featured: z.boolean().default(false),
});

export const productSchema = z.object({
  name: z.string().trim().min(1),
  slug: optStr,
  price: z.coerce.number().positive("Price must be greater than 0"),
  category: objectId,
  images: z.array(safeUrl).min(1, "At least one image is required").max(12),
  stock: z.coerce.number().int().min(0),
  /** Stock the admin form was loaded with; lets the server apply the change as a delta instead of overwriting sales made meanwhile. */
  stockBase: z.preprocess(blank, z.coerce.number().int().min(0).optional()),
  sku: optStr,
  description: optStr,
  shortDescription: optStr,
  compareAtPrice: optNum,
  weight: optNum,
  tags: z.array(z.string()).default([]),
  lowStockThreshold: optNum,
  seoTitle: optStr,
  seoDescription: optStr,
  ingredients: optStr,
  howToUse: optStr,
  faq: z.array(z.object({ q: z.string().trim().min(1), a: z.string().trim().min(1) })).default([]),
  featured: z.boolean().default(false),
  active: z.boolean().default(true),
  salePrice: optNum,
  saleStart: optDate,
  saleEnd: optDate,
}).superRefine(salePair);

export const bundleSchema = z.object({
  name: z.string().trim().min(1),
  slug: optStr,
  image: optSafeUrl,
  price: z.coerce.number().positive("Price must be greater than 0"),
  items: z.array(z.object({ product: objectId, qty: z.coerce.number().int().min(1).max(100) })).min(1, "Add at least one product").max(30),
  active: z.boolean().default(true),
});

export const heroSchema = z.object({
  image: safeUrl,
  headline: z.string().trim().min(1),
  subtext: optStr,
  ctaLabel: optStr,
  ctaLink: optSafeUrl,
  order: z.coerce.number().default(0),
  active: z.boolean().default(true),
});

export const settingsSchema = z.object({
  storeName: z.string().trim().min(1),
  contactPhone: optStr,
  contactEmail: optEmail,
  announcementEnabled: z.boolean(),
  announcementText: optStr,
  shippingFee: z.coerce.number().min(0),
  freeShippingThreshold: z.coerce.number().min(0),
  bankDetails: optStr,
  defaultLowStock: z.coerce.number().int().min(0),
  homeSections: z.array(z.object({ id: z.enum(["categories", "featured", "sale", "bundles", "trust", "reviews"]), enabled: z.boolean(), title: z.string() })),
  trustItems: z.array(z.object({ icon: z.string().default("shield"), title: z.string().trim().min(1), text: optStr })).default([]),
  saleCountdownEnd: optDate,
});

export const checkoutSchema = z.object({
  items: z.array(z.object({ kind: z.enum(["product", "bundle"]).default("product"), id: objectId, qty: z.coerce.number().int().min(1).max(100) })).min(1, "Cart is empty").max(50, "Too many items in one order"),
  customer: z.object({
    name: z.string().trim().min(2),
    phone: z.string().trim().max(25).refine((v) => /^\+?[\d\s()-]{10,20}$/.test(v) && v.replace(/\D/g, "").length >= 10, "Enter a valid phone number"),
    email: optEmail,
    address: z.string().trim().min(5).max(300),
    city: z.string().trim().min(2).max(60),
    notes: z.preprocess(blank, z.string().trim().max(500).optional()),
  }),
  paymentMethod: z.enum(["cod", "bank"]),
  paymentReference: z.preprocess(blank, z.string().trim().max(100).optional()),
  /** Honeypot: real visitors never see or fill this. */
  website: z.string().max(0).optional(),
});

export const reviewSchema = z.object({
  product: objectId,
  name: z.string().trim().min(1).max(60),
  email: optEmail,
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().trim().min(3).max(1000),
});

export const reviewModerationSchema = z.object({ approved: z.boolean() });
