import { Router } from "express";
import passport from "passport";

import {
  completeProfile,
  googleCallback,
  loginUser,
  registerUser,
} from "../controllers/auth.controller.js";
import { isAuthenticated } from "../middleware/auth.middleware.js";
import { validateLoginUser, validateRegisterUser } from "../validators/auth.validator.js";

const authRouter = Router();

/**  
@description -> Register a new user
@route -> POST /api/auth/register
@access -> Public
 */
authRouter.post("/register", validateRegisterUser, registerUser);

/**  
@description -> Login a  user
@route -> GET /api/auth/login
@access -> Public
 */
authRouter.post("/login", validateLoginUser, loginUser);

/**
@description -> Redirect user to Google Login page
@route -> GET /api/auth/google
@access -> Public
 */
authRouter.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

/**
@description -> Handle Google OAuth callback and log in the user
@route -> GET /api/auth/google/callback
@access -> Public
 */
authRouter.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: "http://localhost:5173/login",
  }),
  googleCallback
);

/**
 * @description Complete profile after Google OAuth
 * @route PATCH /api/auth/complete-profile
 * @access Private
 */
authRouter.patch("/complete-profile", isAuthenticated, completeProfile);

export default authRouter;
