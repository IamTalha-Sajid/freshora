import { Schema, type Model, type Types } from "mongoose";
import { defineModel } from "@/lib/define-model";

export interface IBundle {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  image?: string;
  price: number;
  items: { product: Types.ObjectId; qty: number }[];
  active: boolean;
}

const BundleSchema = new Schema<IBundle>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    image: String,
    price: { type: Number, required: true, min: 0 },
    items: [{ product: { type: Schema.Types.ObjectId, ref: "Product", required: true }, qty: { type: Number, default: 1, min: 1 }, _id: false }],
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Bundle: Model<IBundle> = defineModel<IBundle>("Bundle", BundleSchema);
