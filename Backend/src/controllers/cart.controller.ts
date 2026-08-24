import type { Request, Response } from "express";

import { stockOfVariant } from "../dao/product.dao.js";
import { cartModel } from "../models/cart.model.js";
import { productModel } from "../models/product.model.js";

export const addToCart = async (req: Request, res: Response) => {
  const { productId, variantId } = req.params;
  const { quantity = 1 } = req.body;

  if (typeof productId !== "string" || typeof variantId !== "string") {
    throw new Error("Invalid productId or variantId");
  }
  const product = await productModel.findOne({
    _id: productId,
    "variants._id": variantId,
  });

  if (!product) {
    return res.status(404).json({
      message: "Product or variant not found",
      success: false,
    });
  }

  const userId = req.currentUser?._id;
  if (!userId) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }

  const stock = await stockOfVariant(productId, variantId);
  if (stock === undefined) {
    return res.status(404).json({
      success: false,
      message: "Variant stock information not found",
    });
  }
  const cart =
    (await cartModel.findOne({ user: userId })) || (await cartModel.create({ user: userId }));

  const isProductAlreadyInCart = cart.items.some(
    (item) => item.product.toString() === productId && item.variant?.toString() === variantId
  );

  if (isProductAlreadyInCart) {
    const quantityInCart =
      cart.items.find(
        (item) => item.product.toString() === productId && item.variant?.toString() === variantId
      )?.quantity ?? 0;

    if (quantityInCart + quantity > stock) {
      return res.status(400).json({
        message: `Only ${stock - quantityInCart} items are left in stock. And you already have ${quantityInCart} items in your cart`,
        success: false,
      });
    }
  }
};
