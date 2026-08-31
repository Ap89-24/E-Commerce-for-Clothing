import mongoose, { Document, model, Schema } from "mongoose";

import priceSchema from "./price.schema.js";

interface IPayment extends Document {
  status: "pending" | "paid" | "failed";

  price: {
    priceAmount: number;
    priceCurrency: "INR" | "USD" | "EUR" | "JPY" | "GBP";
  };

  razorpay: {
    orderId?: string;
    paymentId?: string;
    signature?: string;
  };

  user: mongoose.Types.ObjectId;
  shippingAddress?: mongoose.Types.ObjectId;
  orderItems: {
    title: string;
    productId: mongoose.Types.ObjectId;
    variantId?: mongoose.Types.ObjectId;
    images: {
      url: string;
    }[];
    quantity: number;
    price: {
      priceAmount: number;
      priceCurrency: "INR" | "USD" | "EUR" | "JPY" | "GBP";
    };
  }[];

  createdAt: Date;
  updatedAt: Date;
}

const paymentSchema = new Schema<IPayment>(
  {
    status: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
    price: {
      type: priceSchema,
      required: true,
    },
    razorpay: {
      orderId: String,
      paymentId: String,
      signature: String,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    shippingAddress: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ShippingAddress",
    },
    orderItems: [
      {
        title: String,
        productId: mongoose.Schema.Types.ObjectId,
        variantId: mongoose.Schema.Types.ObjectId,
        images: [{ url: String }],
        quantity: Number,
        price: priceSchema,
      },
    ],
  },
  { timestamps: true }
);

export const paymentModel = model<IPayment>("Payment", paymentSchema);
