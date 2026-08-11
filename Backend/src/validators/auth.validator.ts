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
 * Validate the user registration request before creating
 * a new account by checking the full name, email,
 * password, contact number, and seller status.
 */
export const validateRegisterUser = [
  body("fullName")
    .notEmpty()
    .isLength({ min: 3 })
    .withMessage("Full name must be at least 3 characters long"),
  body("email").isEmail().withMessage("Invalid email address"),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters long"),
  body("contact")
    .notEmpty()
    .matches(/^\d{10}$/)
    .withMessage("Contact must be a valid 10-digit number"),
  body("isSeller").isBoolean().withMessage("isSeller must be a boolean value"),

  validateResult,
];

/**
 * @description
 * Validate the user login request by ensuring
 * a valid email address and password are provided.
 */
export const validateLoginUser = [
  body("email").notEmpty().isEmail().withMessage("Invalid email address"),
  body("password").notEmpty().withMessage("Password is required"),

  validateResult,
];
