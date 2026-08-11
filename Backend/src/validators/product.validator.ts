import type { NextFunction, Request, Response } from "express";
import { body, validationResult } from "express-validator";

const validateResult = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  next();
};

export const validateCreateProduct = [
  body("title").notEmpty().withMessage("Title is required"),
  body("description").notEmpty().withMessage("Description is required"),
  body("priceAmount").notEmpty().withMessage("Price amount is required"),
  body("priceCurrency").notEmpty().withMessage("Price currency is required"),
  body("images").notEmpty().withMessage("Images are required"),

  validateResult,
];
