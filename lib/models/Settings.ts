import { Schema, type Model } from "mongoose";
import { defineModel } from "@/lib/define-model";
import { connectDB } from "@/lib/db";

export type HomeSection = "categories" | "featured" | "sale" | "bundles" | "trust" | "reviews";

export const DEFAULT_SECTIONS: { id: HomeSection; enabled: boolean; title: string }[] = [
  { id: "categories", enabled: true, title: "Shop by Concern" },
  { id: "featured", enabled: true, title: "Bestsellers" },
  { id: "sale", enabled: true, title: "Deals & Offers" },
  { id: "bundles", enabled: true, title: "Bundles" },
  { id: "trust", enabled: true, title: "Why Freshora" },
  { id: "reviews", enabled: true, title: "Loved by our customers" },
];

export interface TrustItem {
  icon: string;
  title: string;
  text?: string;
}

export interface ISettings {
  key: string;
  storeName: string;
  contactPhone?: string;
  contactEmail?: string;
  announcementEnabled: boolean;
  announcementText?: string;
  shippingFee: number;
  freeShippingThreshold: number; // 0 = disabled
  bankDetails?: string;
  defaultLowStock: number;
  homeSections: { id: HomeSection; enabled: boolean; title: string }[];
  trustItems: TrustItem[];
  saleCountdownEnd?: Date;
}

const SettingsSchema = new Schema<ISettings>({
  key: { type: String, default: "main", unique: true },
  storeName: { type: String, default: "Freshora" },
  contactPhone: String,
  contactEmail: String,
  announcementEnabled: { type: Boolean, default: false },
  announcementText: String,
  shippingFee: { type: Number, default: 250 },
  freeShippingThreshold: { type: Number, default: 0 },
  bankDetails: String,
  defaultLowStock: { type: Number, default: 5 },
  homeSections: {
    type: [{ id: String, enabled: Boolean, title: String, _id: false }],
    default: DEFAULT_SECTIONS,
  },
  trustItems: { type: [{ icon: String, title: String, text: String, _id: false }], default: [] },
  saleCountdownEnd: Date,
});

export const Settings: Model<ISettings> = defineModel<ISettings>("Settings", SettingsSchema);

export async function getSettings() {
  await connectDB();
  const doc = await Settings.findOneAndUpdate({ key: "main" }, { $setOnInsert: { key: "main" } }, { upsert: true, returnDocument: "after" }).lean();
  const s = JSON.parse(JSON.stringify(doc)) as ISettings;
  // Older stores saved before new sections existed: append whatever is missing.
  const have = new Set(s.homeSections.map((x) => x.id));
  s.homeSections = [...s.homeSections, ...DEFAULT_SECTIONS.filter((d) => !have.has(d.id))];
  s.trustItems ??= [];
  return s;
}
