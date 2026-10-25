import { cache } from "react";
import { Schema, type Model } from "mongoose";
import { defineModel } from "@/lib/define-model";
import { connectDB } from "@/lib/db";

export type HomeSection = "categories" | "featured" | "sale" | "bundles" | "trust" | "reviews" | "why" | "compare" | "newsletter";

export const DEFAULT_SECTIONS: { id: HomeSection; enabled: boolean; title: string }[] = [
  { id: "categories", enabled: true, title: "Shop by Concern" },
  { id: "featured", enabled: true, title: "Bestsellers" },
  { id: "why", enabled: true, title: "Why choose Freshora?" },
  { id: "compare", enabled: true, title: "How we stand out" },
  { id: "sale", enabled: true, title: "Deals & Offers" },
  { id: "bundles", enabled: true, title: "Bundles" },
  { id: "reviews", enabled: true, title: "What customers say" },
  { id: "newsletter", enabled: true, title: "Stay in the loop" },
  { id: "trust", enabled: true, title: "Trust strip" },
];

export const DEFAULT_WHY: WhyItem[] = [
  { title: "Advanced Sonic Technology", text: "Delivers up to 40,000 micro-brushes per minute to effectively blast away plaque and stains hidden deep between teeth." },
  { title: "IPX7 100% Waterproof", text: "Fully waterproof design means you can safely brush in the shower and easily rinse your toothbrush under the tap without worries." },
  { title: "Smart 2-Minute Timer", text: "Built-in interval triggers pauses every 30 seconds to remind you to change brushing areas, ensuring a dentist-recommended clean." },
  { title: "Premium DuPont Bristles", text: "Features high-density, W-shape soft bristles that perfectly contour to your teeth for a gentle yet thorough gum massage." },
];

export const DEFAULT_COMPARE = ["10x More Plaque Removal", "Visible Whitening in 14 Days", "Smart 2-Min Quad Timer"];

export interface TrustItem {
  icon: string;
  title: string;
  text?: string;
}

export interface WhyItem {
  title: string;
  text: string;
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
  /** Four benefit blocks (two left, two right of the photo) in the "Why choose" home section. */
  whyItems: WhyItem[];
  whyImage?: string;
  /** Feature rows in the Freshora-vs-others comparison table. */
  compareRows: string[];
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
  whyItems: { type: [{ title: String, text: String, _id: false }], default: undefined },
  whyImage: String,
  compareRows: { type: [String], default: undefined },
  saleCountdownEnd: Date,
});

export const Settings: Model<ISettings> = defineModel<ISettings>("Settings", SettingsSchema);

// Read-only on the hot path (only the very first call creates the document), and de-duplicated per request.
export const getSettings = cache(async () => {
  await connectDB();
  const doc =
    (await Settings.findOne({ key: "main" }).lean()) ??
    (await Settings.findOneAndUpdate({ key: "main" }, { $setOnInsert: { key: "main" } }, { upsert: true, returnDocument: "after" }).lean());
  const s = JSON.parse(JSON.stringify(doc)) as ISettings;
  // Older stores saved before new sections existed: append whatever is missing.
  const have = new Set(s.homeSections.map((x) => x.id));
  s.homeSections = [...s.homeSections, ...DEFAULT_SECTIONS.filter((d) => !have.has(d.id))];
  s.trustItems ??= [];
  // Never saved yet: show the default copy until the admin edits it.
  s.whyItems ??= DEFAULT_WHY;
  s.compareRows ??= DEFAULT_COMPARE;
  return s;
});
