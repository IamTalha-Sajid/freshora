import { Schema, type Model, type Types } from "mongoose";
import { defineModel } from "@/lib/define-model";

export interface IHeroSlide {
  _id: Types.ObjectId;
  image: string;
  headline: string;
  subtext?: string;
  ctaLabel?: string;
  ctaLink?: string;
  order: number;
  active: boolean;
}

const HeroSlideSchema = new Schema<IHeroSlide>(
  {
    image: { type: String, required: true },
    headline: { type: String, required: true },
    subtext: String,
    ctaLabel: String,
    ctaLink: String,
    order: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const HeroSlide: Model<IHeroSlide> = defineModel<IHeroSlide>("HeroSlide", HeroSlideSchema);
