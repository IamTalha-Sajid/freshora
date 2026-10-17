import { Schema, type Model } from "mongoose";
import { defineModel } from "@/lib/define-model";

export interface IAdmin {
  email: string;
  passwordHash: string;
}

const AdminSchema = new Schema<IAdmin>({
  email: { type: String, required: true, unique: true, lowercase: true },
  passwordHash: { type: String, required: true },
});

export const Admin: Model<IAdmin> = defineModel<IAdmin>("Admin", AdminSchema);
