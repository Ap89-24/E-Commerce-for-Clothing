import mongoose, { model, Schema } from "mongoose";

import priceSchema from "./price.schema.js";

const cartSchema = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  items: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      variant: {
        type: mongoose.Schema.Types.ObjectId,
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

export const cartModel = model("Cart", cartSchema);
