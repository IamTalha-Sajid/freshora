import { Schema, type Model } from "mongoose";
import { defineModel } from "@/lib/define-model";

export interface IAdmin {
  email: string;
  passwordHash: string;
  tokenVersion: number;
}

const AdminSchema = new Schema<IAdmin>({
  email: { type: String, required: true, unique: true, lowercase: true },
  passwordHash: { type: String, required: true },
  tokenVersion: { type: Number, default: 0 },
});

export const Admin: Model<IAdmin> = defineModel<IAdmin>("Admin", AdminSchema);
