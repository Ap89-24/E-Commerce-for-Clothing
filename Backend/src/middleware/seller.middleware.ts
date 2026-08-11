import type { NextFunction, Response } from "express";
import jwt from "jsonwebtoken";

import type { AuthRequest } from "../interfaces/auth-request.interface.js";
import { UserModel } from "../models/user.model.js";
import { config } from "../types/config.js";

/**
 * @description
 * Authorize access only to users with the SELLER role.
 * This middleware should be used after `isAuthenticated`
 * to ensure the current user is available on the request.
 */
export const isSellerAuthenticated = async (
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

    if (user.role !== "SELLER") {
      return res.status(403).json({
        success: false,
        message: "Forbidden",
      });
    }

    req.currentUser = user;

    next();
  } catch {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token.",
    });
  }
};
