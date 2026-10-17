import { z } from "zod";

// Admin forms send "" or null for blank optional fields; normalise to undefined.
const blank = (v: unknown) => (v === "" || v === null ? undefined : v);
const optStr = z.preprocess(blank, z.string().trim().optional());
const optNum = z.preprocess(blank, z.coerce.number().min(0).optional());
const optDate = z.preprocess(blank, z.coerce.date().optional());
const objectId = z.string().regex(/^[a-f\d]{24}$/i, "Invalid id");
const optId = z.preprocess(blank, objectId.optional());

export const categorySchema = z.object({
  name: z.string().trim().min(1),
  slug: optStr,
  parent: optId,
  image: optStr,
  icon: optStr,
  order: z.coerce.number().default(0),
  active: z.boolean().default(true),
  featured: z.boolean().default(false),
});

export const productSchema = z.object({
  name: z.string().trim().min(1),
  slug: optStr,
  price: z.coerce.number().min(0),
  category: objectId,
  images: z.array(z.string().min(1)).min(1, "At least one image is required"),
  stock: z.coerce.number().int().min(0),
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
});

export const bundleSchema = z.object({
  name: z.string().trim().min(1),
  slug: optStr,
  image: optStr,
  price: z.coerce.number().min(0),
  items: z.array(z.object({ product: objectId, qty: z.coerce.number().int().min(1) })).min(1, "Add at least one product"),
  active: z.boolean().default(true),
});

export const heroSchema = z.object({
  image: z.string().min(1, "Image is required"),
  headline: z.string().trim().min(1),
  subtext: optStr,
  ctaLabel: optStr,
  ctaLink: optStr,
  order: z.coerce.number().default(0),
  active: z.boolean().default(true),
});

export const settingsSchema = z.object({
  storeName: z.string().trim().min(1),
  contactPhone: optStr,
  contactEmail: optStr,
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
  items: z.array(z.object({ kind: z.enum(["product", "bundle"]).default("product"), id: objectId, qty: z.coerce.number().int().min(1).max(100) })).min(1, "Cart is empty"),
  customer: z.object({
    name: z.string().trim().min(2),
    phone: z.string().trim().min(7),
    email: optStr,
    address: z.string().trim().min(5),
    city: z.string().trim().min(2),
    notes: optStr,
  }),
  paymentMethod: z.enum(["cod", "bank"]),
  paymentReference: optStr,
});

export const reviewSchema = z.object({
  product: objectId,
  name: z.string().trim().min(1).max(60),
  email: optStr,
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().trim().min(3).max(1000),
});
