import mongoose from "mongoose";

import { cartModel } from "../models/cart.model.js";

export const getCartDetails = async (userId: mongoose.Types.ObjectId) => {
  const cart = await cartModel.aggregate(
    [
      {
        $match: {
          user: userId,
        },
      },
      { $unwind: { path: "$items" } },
      {
        $lookup: {
          from: "products",
          localField: "items.product",
          foreignField: "_id",
          as: "items.product",
        },
      },
      { $unwind: { path: "$items.product" } },
      {
        $unwind: { path: "$items.product.variants" },
      },
      {
        $match: {
          $expr: {
            $eq: ["$items.variant", "$items.product.variants._id"],
          },
        },
      },
      {
        $addFields: {
          itemPrice: {
            price: {
              $multiply: ["$items.quantity", "$items.product.variants.price.priceAmount"],
            },
            currency: "$items.product.variants.price.priceCurrency",
          },
        },
      },
      {
        $group: {
          _id: "$_id",
          totalPrice: { $sum: "$itemPrice.price" },
          currency: {
            $first: "$itemPrice.currency",
          },
          items: { $push: "$items" },
        },
      },
    ],
    { maxTimeMS: 60000, allowDiskUse: true }
  );

  return cart;
};
