import { Router } from "express";
import { validateRegisterUser } from "../validators/auth.validator.js";
import { registerUser } from "../controllers/auth.controller.js";



const authRouter = Router();

/* 
@description -> Register a new user
@route -> POST /api/auth/register
@access -> Public
 */
authRouter.post("/register" , validateRegisterUser , registerUser);





export default authRouter;