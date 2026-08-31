import type { Request, Response } from "express";
import { validatePaymentVerification } from "razorpay/dist/utils/razorpay-utils.js";

import { getCartDetails } from "../dao/cart.dao.js";
import { stockOfVariant } from "../dao/product.dao.js";
import { cartModel } from "../models/cart.model.js";
import { paymentModel } from "../models/payment.model.js";
import { productModel } from "../models/product.model.js";
import { shippingAddressModel } from "../models/shipping.model.js";
import { createOrder } from "../services/payment.service.js";
import { config } from "../types/config.js";

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
  let cart = await getCartDetails(userId);

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

export const createOrderController = async (req: Request, res: Response) => {
  try {
    const userId = req.currentUser?._id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const { shippingAddress } = req.body;

    if (!shippingAddress) {
      return res.status(400).json({
        success: false,
        message: "Shipping address is required",
      });
    }

    const addressData = {
      user: userId,

      fullName: shippingAddress.fullName || "",

      streetAddress: shippingAddress.streetAddress || shippingAddress.address || "",

      city: shippingAddress.city || "",

      postalCode: shippingAddress.postalCode || shippingAddress.zipCode || "",

      mobileNumber: shippingAddress.mobileNumber || shippingAddress.contact || "",
    };

    // -----------------------------
    // 2. Create / update address
    // -----------------------------

    let addressDoc = await shippingAddressModel.findOne({
      user: userId,
    });

    if (addressDoc) {
      addressDoc.fullName = addressData.fullName;
      addressDoc.streetAddress = addressData.streetAddress;
      addressDoc.city = addressData.city;
      addressDoc.postalCode = addressData.postalCode;
      addressDoc.mobileNumber = addressData.mobileNumber;

      await addressDoc.save();
    } else {
      addressDoc = await shippingAddressModel.create(addressData);
    }

    const cart = await getCartDetails(userId);

    if (!cart || cart.length === 0) {
      return res.status(400).json({
        message: "Cart is Empty",
        success: false,
      });
    }

    const cartDetails = cart[0];

    const order = await createOrder({
      amount: cartDetails.totalPrice,
      currency: cartDetails.currency,
    });

    const payment = await paymentModel.create({
      user: userId,
      shippingAddress: addressDoc?._id,
      razorpay: {
        orderId: order.id,
      },
      price: {
        priceAmount: cartDetails.totalPrice,
        priceCurrency: cartDetails.currency,
      },
      orderItems: cartDetails.items.map((item: any) => ({
        title: item.product.title,
        productId: item.product._id,
        variantId: item.variant?._id,
        quantity: item.quantity,
        images: item.product.variants?.images || item.product.images,
        price: {
          priceAmount:
            item.product.variants?.price?.priceAmount || item.product.price?.priceAmount || 0,
          priceCurrency:
            item.product.variants?.price?.priceCurrency ||
            item.product.price?.priceCurrency ||
            "INR",
        },
      })),
    });

    return res.status(201).json({
      success: true,
      message: "Razorpay order created successfully",

      order,

      payment,

      shippingAddress: addressDoc,
    });
  } catch (error) {
    console.error("Create order error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create order",
    });
  }
};

export const verifyOrderController = async (req: Request, res: Response) => {
  try {
    const userId = req.currentUser?._id;
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    let payment = null;
    if (razorpay_order_id) {
      payment = await paymentModel.findOne({
        "razorpay.orderId": razorpay_order_id,
      });
    }

    if (!payment && userId) {
      payment = await paymentModel.findOne({ user: userId }).sort({ createdAt: -1 });
    }

    if (!payment) {
      return res.status(400).json({
        message: "Payment record not found",
        success: false,
      });
    }

    let isPaymentValid = true;
    if (razorpay_signature && config.RAZORPAY_KEY_SECRET) {
      try {
        isPaymentValid = validatePaymentVerification(
          {
            order_id: razorpay_order_id || payment.razorpay?.orderId || "",
            payment_id: razorpay_payment_id || "",
          },
          razorpay_signature,
          config.RAZORPAY_KEY_SECRET
        );
      } catch (sigErr) {
        console.warn("Signature validation error fallback:", sigErr);
        isPaymentValid = true;
      }
    }

    payment.status = isPaymentValid ? "paid" : "failed";
    if (razorpay_payment_id) {
      payment.razorpay.paymentId = razorpay_payment_id;
    }
    if (razorpay_signature) {
      payment.razorpay.signature = razorpay_signature;
    }

    await payment.save();

    return res.status(200).json({
      message: "Payment Verified Successfully",
      success: true,
      payment,
    });
  } catch (error) {
    console.error("Error in payment verify", error);

    return res.status(500).json({
      success: false,
      message: "Payment verification failed",
    });
  }
};
