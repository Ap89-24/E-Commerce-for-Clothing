import { Schema } from "mongoose";

const priceSchema = new Schema(
  {
    priceAmount: {
      type: Number,
      required: true,
    },
    priceCurrency: {
      type: String,
      enum: ["INR", "USD", "EUR", "JPY", "GBP"],
      default: "INR",
    },
  },
  {
    _id: false,
    _v: false,
  }
);

export default priceSchema;
