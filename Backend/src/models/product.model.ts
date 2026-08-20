import { Document, model, Schema, Types } from "mongoose";

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

  variant: {
    images: {
      url: string;
    }[];
    stock: number;
    attributes: Map<string, string>;
    price: {
      priceAmount: number;
      priceCurrency: "INR" | "USD" | "EUR" | "JPY" | "GBP";
    };
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
      priceAmount: {
        type: Number,
        required: true,
      },
      priceCurrency: {
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
      },
    ],
    variant: [
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
          priceAmount: {
            type: Number,
            required: true,
          },
          priceCurrency: {
            type: String,
            enum: ["INR", "USD", "EUR", "JPY", "GBP"],
          },
        },
      },
    ],
  },
  { timestamps: true }
);

export const productModel = model<IProduct>("Product", productSchema);
