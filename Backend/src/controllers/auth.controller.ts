import { UserModel , type IUser } from "../models/user.model.js";
import type { Request, Response, NextFunction } from 'express';
import jwt from "jsonwebtoken";
import { config } from "../types/config.js";



const sendTokenResponse = async (user: IUser, res: Response) => {
    const token = jwt.sign({
        id: user._id,
    }, config.JWT_SECRET,
        { expiresIn: "3d" }
    );

    res.status(200).json({
        message: "Token created successfully",
        token,
        user: {
            id: user._id,
            fullName: user.fullName,
            email: user.email,
            contact: user.contact,
            role: user.role
        }
    });
 };



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