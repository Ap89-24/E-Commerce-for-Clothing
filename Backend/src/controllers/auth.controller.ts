import { UserModel } from "../models/user.model.js";
import type { Request, Response, NextFunction } from 'express';





export const registerUser = async (req: Request , res: Response) => {
    const { fullName, email, password, contact } = req.body;

    try {
        const exsistingUser = await UserModel.findOne({
            $or: [
                { email },
                { contact },
            ],
        });

        if(exsistingUser){
            return res.status(400).json({
                message: "User with this email or contact already exsists"
            });
        };

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error registering user" });
    }
};