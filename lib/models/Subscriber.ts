import { Schema, type Model, type Types } from "mongoose";
import { defineModel } from "@/lib/define-model";

export interface ISubscriber {
  _id: Types.ObjectId;
  email: string;
  createdAt: Date;
}

const SubscriberSchema = new Schema<ISubscriber>({ email: { type: String, required: true, unique: true, lowercase: true, trim: true } }, { timestamps: true });

export const Subscriber: Model<ISubscriber> = defineModel<ISubscriber>("Subscriber", SubscriberSchema);
