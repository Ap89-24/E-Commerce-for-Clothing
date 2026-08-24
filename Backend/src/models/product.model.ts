import { Document, model, Schema, Types } from "mongoose";

import priceSchema from "./price.schema.js";

export interface IProduct extends Document {
  title: string;
  description: string;

  seller: Types.ObjectId;

  price: {
    priceAmount: number;
    priceCurrency: "INR" | "USD" | "EUR" | "JPY" | "GBP";
  };

  images: {
    url: string;
  }[];

  variants: {
    images: {
      url?: string;
    }[];
    stock: number;
    attributes: Map<string, string>;
    price: {
      priceAmount: number;
      priceCurrency: "INR" | "USD" | "EUR" | "JPY" | "GBP";
    };
    imageIndices?: number[];
    _id: string;
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
      type: priceSchema,
      required: true,
    },
    images: [
      {
        url: {
          type: String,
          required: true,
        },
      },
    ],
    variants: [
      {
        images: [
          {
            url: {
              type: String,
              required: true,
            },
          },
        ],
        stock: {
          type: Number,
          default: 0,
        },
        attributes: {
          type: Map,
          of: String,
        },
        price: {
          type: priceSchema,
          required: true,
        },
      },
    ],
  },
  { timestamps: true }
);

export const productModel = model<IProduct>("Product", productSchema);
