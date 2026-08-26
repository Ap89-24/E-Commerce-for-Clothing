import type { NextFunction, Request, Response } from "express";
import { body, param, validationResult } from "express-validator";

const validateResult = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  next();
};

/**
 * @description
 * Add a product with its selected variant and quantity to the
 * authenticated user's cart, or update the quantity if the item
 * already exists in the cart.
 */
export const validateAddToCart = [
  param("productId").isMongoId().withMessage("Invalid product Id"),
  param("variantId").isMongoId().withMessage("Invalid variant Id"),
  body("quantity").optional().isInt({ min: 1 }).withMessage("Quantity must be atleast one"),

  validateResult,
];

/**
 * @description
 * Validate the product and variant IDs provided for incrementing
 * the quantity of an item in the authenticated user's cart.
 */
export const validIncrementCartItemQuantity = [
  param("productId").isMongoId().withMessage("Invalid product Id"),
  param("variantId").isMongoId().withMessage("Invalid variant Id"),

  validateResult,
];

/**
 * @description
 * Validate the product and variant IDs provided for decrementing
 * the quantity of an item in the authenticated user's cart.
 */
export const validDecrementCartItemQuantity = [
  param("productId").isMongoId().withMessage("Invalid product Id"),

  param("variantId").isMongoId().withMessage("Invalid variant Id"),

  validateResult,
];

/**
 * @description
 * Validate the product and variant IDs provided for removing
 * an item from the authenticated user's cart.
 */

export const validDeleteCartItem = [
  param("productId").isMongoId().withMessage("Invalid product Id"),

  param("variantId").isMongoId().withMessage("Invalid variant Id"),

  validateResult,
];
