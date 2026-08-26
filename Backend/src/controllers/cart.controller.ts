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
        message: `Only ${stock} items are left in stock. And you already have ${quantityInCart} items in your cart`,
        success: false,
      });
    }

    await cartModel.findOneAndUpdate(
      { user: userId, "items.product": productId, "items.variant": variantId },
      { $inc: { "items.$.quantity": quantity } },
      { new: true }
    );

    return res.status(200).json({
      message: "Cart updated successfully",
      success: true,
    });
  }

  if (quantity > stock) {
    return res.status(400).json({
      message: `Only ${stock} are left in stock`,
      success: false,
    });
  }

  cart.items.push({
    product: productId,
    variant: variantId,
    quantity,
    price: product.price,
  });

  await cart.save();

  return res.status(200).json({
    message: "Product added to cart successfully",
    success: true,
  });
};

export const getCart = async (req: Request, res: Response) => {
  const userId = req.currentUser?._id;
  if (!userId) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }
  let cart = await cartModel.findOne({ user: userId }).populate("items.product");

  if (!cart) {
    cart = await cartModel.create({ user: userId });
  }

  return res.status(200).json({
    message: "Cart fetched successfully",
    success: true,
    cart,
  });
};

export const incrementCartItemQuantity = async (req: Request, res: Response) => {
  const { productId, variantId } = req.params;

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

  const cart = await cartModel.findOne({ user: userId });

  if (!cart) {
    return res.status(404).json({
      message: "Cart not found",
      success: false,
    });
  }
  const stock = await stockOfVariant(productId, variantId);
  if (stock === undefined) {
    return res.status(404).json({
      success: false,
      message: "Variant stock information not found",
    });
  }

  const itemQuantityInCart =
    cart.items.find(
      (item) => item.product.toString() === productId && item.variant?.toString() === variantId
    )?.quantity ?? 0;

  if (itemQuantityInCart + 1 > stock) {
    return res.status(400).json({
      message: `Only ${stock} items are left in stock. And you already have ${itemQuantityInCart} items in your cart`,
      success: false,
    });
  }

  await cartModel.findOneAndUpdate(
    { user: userId, "items.product": productId, "items.variant": variantId },
    { $inc: { "items.$.quantity": 1 } },
    { new: true }
  );

  return res.status(200).json({
    message: "Cart item quantity increment successfully",
    success: true,
  });
};

export const decrementCartItemQuantity = async (req: Request, res: Response) => {
  const { productId, variantId } = req.params;

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

  const cart = await cartModel.findOne({ user: userId });

  if (!cart) {
    return res.status(404).json({
      message: "Cart not found",
      success: false,
    });
  }

  const cartItem = cart.items.find(
    (item) => item.product.toString() === productId && item.variant?.toString() === variantId
  );

  if (!cartItem) {
    return res.status(404).json({
      message: "Product variant not found in cart",
      success: false,
    });
  }

  if (cartItem.quantity <= 1) {
    return res.status(400).json({
      message: "Cart item quantity cannot be less than 1",
      success: false,
    });
  }

  await cartModel.findOneAndUpdate(
    {
      user: userId,
      "items.product": productId,
      "items.variant": variantId,
    },
    {
      $inc: { "items.$.quantity": -1 },
    },
    { new: true }
  );

  return res.status(200).json({
    message: "Cart item quantity decremented successfully",
    success: true,
  });
};
