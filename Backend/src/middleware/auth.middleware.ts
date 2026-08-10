import jwt from "jsonwebtoken";
import type { NextFunction, Response } from "express";
import type { AuthRequest } from "../interfaces/auth-request.interface.js";
import { UserModel } from "../models/user.model.js";
import { config } from "../types/config.js";

/**
 * @description
 * Verify the JWT stored in the HTTP-only cookie.
 * If valid, attach the authenticated user's id to the request.
 */
export const isAuthenticated = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Please login first.",
      });
    }

    const decoded = jwt.verify(token, config.JWT_SECRET) as {
      id: string;
    };

    const user = await UserModel.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found.",
      });
    }

    req.currentUser = user;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token.",
    });
  }
};