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

    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one product image is required.",
      });
    }
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
    console.error("Error creating product:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const getSellerProducts = async (req: Request, res: Response) => {
  try {
    const seller = req.currentUser;
    if (!seller) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }
    const products = await productModel.find({ seller: seller._id });

    res.status(200).json({
      success: true,
      message: "Products fetched successfully",
      products,
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const getProductById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const product = await productModel.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Product fetched successfully",
      product,
    });
  } catch (error) {
    console.error("Error fetching product:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, priceAmount, priceCurrency, remainingImages } = req.body;
    const seller = req.currentUser;

    if (!seller) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const product = await productModel.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    if (product.seller.toString() !== seller._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this product.",
      });
    }

    // Parse existing images that are retained
    let keptImages = [];
    if (remainingImages) {
      try {
        keptImages = JSON.parse(remainingImages);
      } catch (err) {
        console.error("Error parsing remaining images:", err);
        return res.status(400).json({
          success: false,
          message: "Invalid format for remaining images.",
        });
      }
    }

    const files = req.files as Express.Multer.File[];
    const newImages =
      files && files.length > 0
        ? await Promise.all(
            files.map(async (file) => {
              const result = await uploadImage({
                buffer: file.buffer,
                fileName: file.originalname,
                folder: "Velnox-Products",
              });

              return {
                url: result.url,
              };
            })
          )
        : [];

    const totalImages = [...keptImages, ...newImages];

    if (totalImages.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one product image is required.",
      });
    }

    if (totalImages.length > 8) {
      return res.status(400).json({
        success: false,
        message: "A maximum of 8 images are allowed per product.",
      });
    }

    product.title = title || product.title;
    product.description = description || product.description;
    if (priceAmount) {
      product.price = {
        priceAmount: priceAmount,
        priceCurrency: priceCurrency || product.price?.priceCurrency || "INR",
      };
    }
    product.images = totalImages;

    await product.save();

    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    console.error("Error updating product:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const getProducts = async (req: Request, res: Response) => {
  try {
    const user = req.currentUser;
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }
    const products = await productModel.find();

    res.status(200).json({
      success: true,
      message: "Products fetched successfully",
      products,
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
