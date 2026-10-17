import { Schema, type Model, type Types } from "mongoose";
import { defineModel } from "@/lib/define-model";

export const ORDER_STATUSES = ["pending", "confirmed", "shipped", "delivered", "cancelled"] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export interface IOrderItem {
  product: Types.ObjectId;
  name: string;
  price: number;
  qty: number;
  image?: string;
}

export interface IOrder {
  _id: Types.ObjectId;
  orderNumber: string;
  items: IOrderItem[];
  customer: { name: string; phone: string; email?: string; address: string; city: string; notes?: string };
  paymentMethod: "cod" | "bank";
  paymentReference?: string;
  paymentStatus: "unpaid" | "paid";
  status: OrderStatus;
  subtotal: number;
  shipping: number;
  total: number;
  createdAt: Date;
}

const OrderSchema = new Schema<IOrder>(
  {
    orderNumber: { type: String, required: true, unique: true },
    items: [
      {
        product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
        name: String,
        price: Number,
        qty: Number,
        image: String,
        _id: false,
      },
    ],
    customer: {
      name: { type: String, required: true },
      phone: { type: String, required: true },
      email: String,
      address: { type: String, required: true },
      city: { type: String, required: true },
      notes: String,
    },
    paymentMethod: { type: String, enum: ["cod", "bank"], required: true },
    paymentReference: String,
    paymentStatus: { type: String, enum: ["unpaid", "paid"], default: "unpaid" },
    status: { type: String, enum: ORDER_STATUSES, default: "pending", index: true },
    subtotal: Number,
    shipping: Number,
    total: Number,
  },
  { timestamps: true }
);

export const Order: Model<IOrder> = defineModel<IOrder>("Order", OrderSchema);
