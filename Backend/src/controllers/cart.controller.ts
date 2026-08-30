import type { Request, Response } from "express";
import mongoose from "mongoose";

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

  const variant = product.variants?.find((v: any) => v._id?.toString() === variantId);
  const activePrice = variant?.price || product.price;

  cart.items.push({
    product: productId,
    variant: variantId,
    quantity,
    price: activePrice,
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
  let cart = await cartModel.aggregate(
    [
      {
        $match: {
          user: new mongoose.Types.ObjectId(userId._id),
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

  if (cart.length === 0) {
    const newCart = await cartModel.create({
      user: userId,
    });

    cart = [newCart];
  }

  return res.status(200).json({
    message: "Cart fetched successfully",
    success: true,
    cart: cart[0],
  });
};

export const incrementCartItemQuantity = async (req: Request, res: Response) => {
  const { productId, variantId } = req.params;

  if (typeof productId !== "string" || typeof variantId !== "string") {
    throw new Error("Invalid productId or variantId");
  }
  const product = await productModel.findById(productId);

  if (!product) {
    return res.status(404).json({
      message: "Product not found",
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

  // Look up stock: if variant ID matches, use its stock. Otherwise fallback to first variant or 99.
  const targetVariant = product.variants?.find((v: any) => v._id?.toString() === variantId);
  const stock = targetVariant ? targetVariant.stock : (product.variants?.[0]?.stock ?? 99);

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

  const product = await productModel.findById(productId);

  if (!product) {
    return res.status(404).json({
      message: "Product not found",
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

export const deleteCartItem = async (req: Request, res: Response) => {
  const { productId, variantId } = req.params;

  if (typeof productId !== "string" || typeof variantId !== "string") {
    throw new Error("Invalid productId or variantId");
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
      success: false,
      message: "Cart not found",
    });
  }

  const cartItem = cart.items.find(
    (item) => item.product.toString() === productId && item.variant?.toString() === variantId
  );

  if (!cartItem) {
    return res.status(404).json({
      success: false,
      message: "Product variant not found in cart",
    });
  }

  // Remove the item from the cart
  cart.items = cart.items.filter(
    (item) => !(item.product.toString() === productId && item.variant?.toString() === variantId)
  );

  // If no items remain, delete the entire cart
  if (cart.items.length === 0) {
    await cartModel.deleteOne({ user: userId });

    return res.status(200).json({
      success: true,
      message: "Cart item removed and cart deleted successfully",
    });
  }

  await cart.save();

  return res.status(200).json({
    success: true,
    message: "Cart item removed successfully",
  });
};

export const updateCartItemPrice = async (req: Request, res: Response) => {
  const { productId, variantId } = req.params;
  const userId = req.currentUser?._id;
  if (!userId) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  const product = await productModel.findById(productId);
  if (!product) {
    return res.status(404).json({ success: false, message: "Product not found" });
  }

  const variant = product.variants?.find((v: any) => v._id?.toString() === variantId);

  if (!variant) {
    return res.status(404).json({
      success: false,
      message: "Variant not found",
    });
  }
  const activePrice = variant?.price || product.price;

  const cart = await cartModel.findOneAndUpdate(
    {
      user: userId,
      "items.product": productId,
      "items.variant": variantId,
    } as any,
    { $set: { "items.$.price": activePrice } },
    { new: true }
  );

  return res.status(200).json({
    success: true,
    message: "Cart item price updated successfully",
    cart,
  });
};
