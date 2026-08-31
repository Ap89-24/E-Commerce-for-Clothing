import mongoose, { Document, model, Schema } from "mongoose";

import priceSchema from "./price.schema.js";

interface ICart extends Document {
  user: mongoose.Types.ObjectId;
  items: {
    product: string;
    variant: string;
    quantity: number;
    price: {
      priceAmount: number;
      priceCurrency: "INR" | "USD" | "EUR" | "JPY" | "GBP";
    };
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const cartSchema = new Schema<ICart>({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  items: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
      variant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "product.variants",
        required: true,
      },
      quantity: {
        type: Number,
        default: 1,
        min: 1,
      },
      price: {
        type: priceSchema,
        required: true,
      },
    },
  ],
});

export const cartModel = model<ICart>("Cart", cartSchema);
