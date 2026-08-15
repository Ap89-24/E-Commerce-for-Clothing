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

  validateResult,
];
