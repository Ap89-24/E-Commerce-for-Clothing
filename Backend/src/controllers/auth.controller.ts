import { UserModel , type IUser } from "../models/user.model.js";
import type { Request, Response, NextFunction } from 'express';
import jwt from "jsonwebtoken";
import { config } from "../types/config.js";



const sendTokenResponse = async (user: IUser, res: Response , message: string) => {
    const token = jwt.sign({
        id: user._id,
    }, config.JWT_SECRET,
        { expiresIn: "3d" }
    );

    res.cookie("token", token);

    res.status(200).json({
        message: message,
        success: true,
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
    const { fullName, email, password, contact, isSeller } = req.body;

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

        const user = await UserModel.create({
            email,
            fullName,
            contact,
            password,
            role: isSeller ? "SELLER" : "USER"
        });

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
        };
        const isPassMatch = await user.comparePassword(password);
        if (!isPassMatch) {
            return res.status(401).json({ message: "Invalid email or password" });
        };
        
        await sendTokenResponse(user, res, "User Logged In Successfully");
    } catch (error) {
        
    }
};


export const googleCallback = async (req: Request, res: Response) => { 
    console.log(req.user);
    return res.redirect("http://localhost:5173/")
};