import type { NextFunction, Response } from "express";

import type { AuthRequest } from "../interfaces/auth-request.interface.js";
import { UserModel } from "../models/user.model.js";

/**
 * @description
 * Ensure the authenticated user has completed
 * the onboarding/profile completion process.
 */
export const isProfileCompleted = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = await UserModel.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    if (!user.isProfileCompleted) {
      return res.status(403).json({
        success: false,
        message: "Please complete your profile.",
      });
    }

    next();
  } catch {
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};
