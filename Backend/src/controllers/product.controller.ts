import type { Request, Response } from "express";

import { productModel } from "../models/product.model.js";
import { uploadImage } from "../services/storage.service.js";

export const createProduct = async (req: Request, res: Response) => {
  try {
    const { title, description, priceAmount, priceCurrency } = req.body;
    const seller = req.currentUser;

    if (!seller) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }
    const files = req.files as Express.Multer.File[];
    const images = await Promise.all(
      files.map(async (file) => {
        return await uploadImage({
          buffer: file.buffer,
          fileName: file.originalname,
          folder: "Velnox-Products",
        });
      })
    );

    const product = await productModel.create({
      title,
      description,
      price: {
        priceAmount: priceAmount,
        priceCurrency: priceCurrency || "INR",
      },
      images,
      seller: seller._id,
    });

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
