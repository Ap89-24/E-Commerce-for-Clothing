import { Document, model, Schema, Types } from "mongoose";

export interface IProduct extends Document {
  title: string;
  description: string;

  seller: Types.ObjectId;

  price: {
    amount: number;
    currency: "INR" | "USD" | "EUR" | "JPY" | "GBP";
  };

  images: {
    url: string;
    alt: string;
  }[];

  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    seller: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    price: {
      amount: {
        type: Number,
        required: true,
      },
      currency: {
        type: String,
        enum: ["INR", "USD", "EUR", "JPY", "GBP"],
      },
    },
    images: [
      {
        url: {
          type: String,
          required: true,
        },
        alt: {
          type: String,
          required: true,
        },
      },
    ],
  },
  { timestamps: true }
);

export const productModel = model<IProduct>("Product", productSchema);
