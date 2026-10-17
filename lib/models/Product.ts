import { Schema, type Model, type Types } from "mongoose";
import { defineModel } from "@/lib/define-model";

export interface IProduct {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  price: number;
  category: Types.ObjectId;
  images: string[];
  stock: number;
  sku?: string;
  description?: string;
  shortDescription?: string;
  compareAtPrice?: number;
  weight?: number;
  tags: string[];
  lowStockThreshold?: number;
  seoTitle?: string;
  seoDescription?: string;
  ingredients?: string;
  howToUse?: string;
  faq: { q: string; a: string }[];
  featured: boolean;
  active: boolean;
  salePrice?: number;
  saleStart?: Date;
  saleEnd?: Date;
  ratingAvg: number;
  ratingCount: number;
}

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true },
    price: { type: Number, required: true, min: 0 },
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true, index: true },
    images: { type: [String], validate: (v: string[]) => v.length > 0 },
    stock: { type: Number, required: true, min: 0 },
    sku: { type: String, trim: true, sparse: true, unique: true },
    description: String,
    shortDescription: String,
    compareAtPrice: Number,
    weight: Number,
    tags: { type: [String], default: [] },
    lowStockThreshold: Number,
    seoTitle: String,
    seoDescription: String,
    ingredients: String,
    howToUse: String,
    faq: { type: [{ q: String, a: String, _id: false }], default: [] },
    featured: { type: Boolean, default: false, index: true },
    active: { type: Boolean, default: true },
    salePrice: Number,
    saleStart: Date,
    saleEnd: Date,
    ratingAvg: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);
ProductSchema.index({ name: "text", tags: "text", sku: "text" });

export const Product: Model<IProduct> = defineModel<IProduct>("Product", ProductSchema);
