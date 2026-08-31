import mongoose, { type Document, model, Schema } from "mongoose";

export interface IShippingAddress extends Document {
  fullName: string;
  streetAddress: string;
  city: string;
  postalCode: string;
  mobileNumber: string;
  createdAt: Date;
  updatedAt: Date;
}

const shippingAddressSchema = new Schema<IShippingAddress>(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    streetAddress: {
      type: String,
      required: true,
      trim: true,
    },

    city: {
      type: String,
      required: true,
      trim: true,
    },

    postalCode: {
      type: String,
      required: true,
      trim: true,
    },

    mobileNumber: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export const shippingAddressModel = model<IShippingAddress>(
  "ShippingAddress",
  shippingAddressSchema
);
