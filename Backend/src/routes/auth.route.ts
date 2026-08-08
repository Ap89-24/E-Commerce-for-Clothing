import { Router } from "express";
import { validateLoginUser, validateRegisterUser } from "../validators/auth.validator.js";
import { loginUser, registerUser } from "../controllers/auth.controller.js";



const authRouter = Router();

/* 
@description -> Register a new user
@route -> POST /api/auth/register
@access -> Public
 */
authRouter.post("/register" , validateRegisterUser , registerUser);


/* 
@description -> Login a  user
@route -> GET /api/auth/login
@access -> Public
 */
authRouter.post("/login", validateLoginUser, loginUser);


export default authRouter;