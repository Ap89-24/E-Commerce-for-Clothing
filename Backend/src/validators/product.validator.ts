import type { NextFunction, Request, Response } from "express";
import { body, validationResult } from "express-validator";

const validateResult = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  next();
};

/**
 * @description
 * Validate the product creation request by ensuring
 * the title, description, price details, and images
 * are provided before creating a new product.
 */
export const validateCreateProduct = [
  body("title").notEmpty().withMessage("Title is required"),
  body("description").notEmpty().withMessage("Description is required"),
  body("priceAmount").notEmpty().withMessage("Price amount is required"),
  body("priceCurrency").notEmpty().withMessage("Price currency is required"),
  body("images").custom((value, { req }) => {
    if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
      throw new Error("Images are required");
    }
    return true;
  }),
  body("variants")
    .optional()
    .custom((value) => {
      let variants;

      try {
        variants = typeof value === "string" ? JSON.parse(value) : value;
      } catch {
        throw new Error("Invalid variants JSON format");
      }

      if (!Array.isArray(variants)) {
        throw new Error("Variants must be an array");
      }

      if (variants.length > 20) {
        throw new Error("A maximum of 20 variants are allowed");
      }

      const allowedCurrencies = ["INR", "USD", "EUR", "JPY", "GBP"];

      for (const [index, variant] of variants.entries()) {
        // -----------------------------------
        // Stock
        // -----------------------------------
        if (variant.stock !== undefined) {
          const stock = Number(variant.stock);

          if (isNaN(stock) || stock < 0) {
            throw new Error(`Variant ${index + 1}: stock must be a valid non-negative number`);
          }
        }

        // -----------------------------------
        // Attributes
        // -----------------------------------
        if (
          variant.attributes !== undefined &&
          (typeof variant.attributes !== "object" || Array.isArray(variant.attributes))
        ) {
          throw new Error(`Variant ${index + 1}: attributes must be an object`);
        }

        // -----------------------------------
        // Price
        // -----------------------------------
        if (
          variant.priceAmount === undefined ||
          variant.priceAmount === null ||
          variant.priceAmount === ""
        ) {
          throw new Error(`Variant ${index + 1}: price amount is required`);
        }

        const priceAmount = Number(variant.priceAmount);

        if (isNaN(priceAmount) || priceAmount < 0) {
          throw new Error(`Variant ${index + 1}: price amount must be a valid non-negative number`);
        }

        // -----------------------------------
        // Currency
        // -----------------------------------
        if (
          variant.priceCurrency !== undefined &&
          !allowedCurrencies.includes(variant.priceCurrency)
        ) {
          throw new Error(`Variant ${index + 1}: invalid price currency`);
        }
      }

      return true;
    }),

  validateResult,
];
