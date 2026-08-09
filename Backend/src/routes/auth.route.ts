import { Router } from "express";
import { validateLoginUser, validateRegisterUser } from "../validators/auth.validator.js";
import { loginUser, registerUser } from "../controllers/auth.controller.js";
import passport from "passport";



const authRouter = Router();

/**  
@description -> Register a new user
@route -> POST /api/auth/register
@access -> Public
 */
authRouter.post("/register" , validateRegisterUser , registerUser);


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
authRouter.get("/auth/google", passport.authenticate("google", { scope: ["profile" , "email"] }));

/**
@description -> Handle Google OAuth callback and log in the user
@route -> GET /api/auth/google/callback
@access -> Public
 */
authRouter.get("/auth/google/callback", passport.authenticate("google", { session: false }));


export default authRouter;