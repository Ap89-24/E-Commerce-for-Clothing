import type { Request, Response } from "express";
import jwt from "jsonwebtoken";

import { type IUser, UserModel } from "../models/user.model.js";
import { config } from "../types/config.js";

const sendTokenResponse = async (
  user: IUser,
  res: Response,
  message: string,
  redirectUrl?: string
) => {
  const token = jwt.sign({ id: user._id, role: user.role }, config.JWT_SECRET, { expiresIn: "3d" });

  res.cookie("token", token, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
  });

  if (redirectUrl) {
    return res.redirect(redirectUrl);
  }

  return res.status(200).json({
    success: true,
    message,
    user: {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      contact: user.contact,
      profile: user.profile,
      isProfileCompleted: user.isProfileCompleted,
    },
  });
};

export const registerUser = async (req: Request, res: Response) => {
  const { fullName, email, password, contact, isSeller } = req.body;

  try {
    const exsistingUser = await UserModel.findOne({
      $or: [{ email }, { contact }],
    });

    if (exsistingUser) {
      return res.status(400).json({
        message: "User with this email or contact already exsists",
      });
    }

    const user = await UserModel.create({
      email,
      fullName,
      contact,
      password,
      role: isSeller ? "SELLER" : "USER",
    });

    user.isProfileCompleted = true;
    await user.save();

    await sendTokenResponse(user, res, "User registered successfully");
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error registering user" });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    const isPassMatch = await user.comparePassword(password);
    if (!isPassMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    await sendTokenResponse(user, res, "User Logged In Successfully");
  } catch (error) {
    console.error("Error logging in user:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const googleCallback = async (req: Request, res: Response) => {
  /**
   * @description Ensure the request contains an authenticated user.
   * If `req.user` is not available, it means the user has not been
   * successfully authenticated by Passport.js, so return a 401
   * Unauthorized response and stop further request processing.
   */
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }
    const { id, displayName, emails, photos } = req.user;

    const email = emails?.[0]?.value;
    const profilePic = photos?.[0]?.value;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Google account did not provide an email.",
      });
    }

    if (!profilePic) {
      return res.status(400).json({
        success: false,
        message: "Google account did not provide an profile picture.",
      });
    }

    let user = await UserModel.findOne({
      $or: [{ email }, { googleId: id }],
    });

    if (!user) {
      user = await UserModel.create({
        email,
        googleId: id,
        fullName: displayName,
        profile: profilePic,
        role: "USER", // Temporary default
        isProfileCompleted: false,
      });
    }

    if (!user.isProfileCompleted) {
      return sendTokenResponse(
        user,
        res,
        "Google Login Successful",
        "http://localhost:5173/complete-profile"
      );
    }

    return sendTokenResponse(user, res, "Google Login Successful", "http://localhost:5173/");
  } catch (error) {
    console.error("Error registering with google", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const completeProfile = async (req: Request, res: Response) => {
  const { contact, role } = req.body;

  const user = req.currentUser;

  if (!user) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }

  if (!contact) {
    return res.status(400).json({
      success: false,
      message: "Contact number is required",
    });
  }

  if (!["USER", "SELLER"].includes(role)) {
    return res.status(400).json({
      success: false,
      message: "Invalid role",
    });
  }

  user.contact = contact;
  user.role = role;
  user.isProfileCompleted = true;

  await user.save();

  return res.status(200).json({
    success: true,
    message: "Profile completed successfully",
    user: {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      contact: user.contact,
      profile: user.profile,
      isProfileCompleted: user.isProfileCompleted,
    },
  });
};
