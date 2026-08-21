import type { Request, Response } from "express";

import { type IProduct, productModel } from "../models/product.model.js";
import { uploadImage } from "../services/storage.service.js";

export const createProduct = async (req: Request, res: Response) => {
  try {
    const { title, description, priceAmount, priceCurrency, variants } = req.body;
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

    // -----------------------------------
    // 4. Parse variants
    // -----------------------------------
    let parsedVariants: IProduct["variants"] = [];

    if (variants) {
      try {
        parsedVariants = typeof variants === "string" ? JSON.parse(variants) : variants;
      } catch (error) {
        console.error(error);
        return res.status(400).json({
          success: false,
          message: "Invalid variants format.",
        });
      }
    }

    // -----------------------------------
    // 5. Validate variants
    // -----------------------------------
    if (!Array.isArray(parsedVariants)) {
      return res.status(400).json({
        success: false,
        message: "Variants must be an array.",
      });
    }

    if (parsedVariants.length > 20) {
      return res.status(400).json({
        success: false,
        message: "A maximum of 20 variants are allowed.",
      });
    }

    const allowedCurrencies = ["INR", "USD", "EUR", "JPY", "GBP"];

    for (const variant of parsedVariants) {
      // Validate stock
      const variantStock = Number(variant.stock ?? 0);

      if (isNaN(variantStock) || variantStock < 0) {
        return res.status(400).json({
          success: false,
          message: "Variant stock must be a valid non-negative number.",
        });
      }

      // Validate price
      const variantPrice = Number(variant.price.priceAmount);

      if (variant.price.priceAmount === undefined || isNaN(variantPrice) || variantPrice < 0) {
        return res.status(400).json({
          success: false,
          message: "Variant price must be a valid non-negative number.",
        });
      }

      // Validate currency
      const variantCurrency = variant.price.priceCurrency || priceCurrency || "INR";

      if (!allowedCurrencies.includes(variantCurrency)) {
        return res.status(400).json({
          success: false,
          message: "Invalid variant price currency.",
        });
      }

      // Validate attributes
      if (
        variant.attributes !== undefined &&
        (typeof variant.attributes !== "object" || Array.isArray(variant.attributes))
      ) {
        return res.status(400).json({
          success: false,
          message: "Variant attributes must be an object.",
        });
      }
    }

    const product = await productModel.create({
      title,
      description,
      price: {
        priceAmount: priceAmount,
        priceCurrency: priceCurrency || "INR",
      },
      images,
      seller: seller._id,
      variants: parsedVariants.map((variant) => {
        let variantImages = variant.images || [];
        if (Array.isArray(variant.imageIndices)) {
          variantImages = variant.imageIndices
            .map((idx: number) => images[idx])
            .filter((img) => img !== undefined);
        }
        return {
          stock: Number(variant.stock ?? 0),
          attributes: variant.attributes || {},
          price: {
            priceAmount: Number(variant.price.priceAmount),
            priceCurrency: variant.price.priceCurrency || priceCurrency || "INR",
          },
          images: variantImages,
        };
      }),
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
    const { title, description, priceAmount, priceCurrency, remainingImages, variants } = req.body;
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

    // -----------------------------------
    // Validate variants if provided
    // -----------------------------------
    let parsedVariants: IProduct[] = [];
    if (variants) {
      try {
        parsedVariants = typeof variants === "string" ? JSON.parse(variants) : variants;
      } catch (error) {
        console.error(error);
        return res.status(400).json({
          success: false,
          message: "Invalid variants format.",
        });
      }

      if (!Array.isArray(parsedVariants)) {
        return res.status(400).json({
          success: false,
          message: "Variants must be an array.",
        });
      }

      if (parsedVariants.length > 20) {
        return res.status(400).json({
          success: false,
          message: "A maximum of 20 variants are allowed.",
        });
      }

      const allowedCurrencies = ["INR", "USD", "EUR", "JPY", "GBP"];
      for (const variant of parsedVariants) {
        const variantStock = Number(variants.stock ?? 0);
        if (isNaN(variantStock) || variantStock < 0) {
          return res.status(400).json({
            success: false,
            message: "Variant stock must be a valid non-negative number.",
          });
        }

        const variantPrice = Number(variant.price.priceAmount);
        if (variants.priceAmount === undefined || isNaN(variantPrice) || variantPrice < 0) {
          return res.status(400).json({
            success: false,
            message: "Variant price must be a valid non-negative number.",
          });
        }

        const variantCurrency = variant.price.priceCurrency || priceCurrency || "INR";
        if (!allowedCurrencies.includes(variantCurrency)) {
          return res.status(400).json({
            success: false,
            message: "Invalid variant price currency.",
          });
        }

        if (
          variants.attributes !== undefined &&
          (typeof variants.attributes !== "object" || Array.isArray(variants.attributes))
        ) {
          return res.status(400).json({
            success: false,
            message: "Variant attributes must be an object.",
          });
        }
      }
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

    if (variants) {
      product.variants = parsedVariants.map((variant) => {
        let variantImages = variant.images || [];
        if (Array.isArray(variants.imageIndices)) {
          variantImages = variants.imageIndices
            .map((idx: number) => totalImages[idx])
            .filter((img: { url: string } | undefined) => img !== undefined);
        }
        return {
          stock: Number(variants.stock ?? 0),
          attributes: variants.attributes || {},
          price: {
            priceAmount: Number(variants.priceAmount),
            priceCurrency: variants.priceCurrency || priceCurrency || "INR",
          },
          images: variantImages,
        };
      });
    }

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

export const getProductDetails = async (req: Request, res: Response) => {
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
};

export const updateProductWithVariant = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { stock, priceAmount, priceCurrency, attributes, imageIndices, variant } = req.body;
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

    // Parse variant payload
    let targetVariant = {
      stock,
      priceAmount,
      priceCurrency,
      attributes,
      imageIndices,
      _id: undefined,
      id: undefined,
      images: undefined,
    };
    if (variant) {
      try {
        targetVariant = typeof variant === "string" ? JSON.parse(variant) : variant;
      } catch (error) {
        console.error(error);
        return res.status(400).json({
          success: false,
          message: "Invalid variant format.",
        });
      }
    }

    // Parse new files if uploaded
    const files = req.files as Express.Multer.File[];
    const newImages: { url: string }[] =
      files && files.length > 0
        ? await Promise.all(
            files.map(async (file) => {
              const result = await uploadImage({
                buffer: file.buffer,
                fileName: file.originalname,
                folder: "Velnox-Products",
              });
              if (!result.url) {
                throw new Error(`Image upload failed for ${file.originalname}`);
              }
              return {
                url: result.url,
              };
            })
          )
        : [];

    if (newImages.length > 0) {
      product.images.push(...newImages);
    }

    // Validate stock
    const variantStock = Number(targetVariant.stock ?? 0);
    if (isNaN(variantStock) || variantStock < 0) {
      return res.status(400).json({
        success: false,
        message: "Variant stock must be a valid non-negative number.",
      });
    }

    // Validate price
    const variantPrice = Number(targetVariant.priceAmount);
    if (targetVariant.priceAmount === undefined || isNaN(variantPrice) || variantPrice < 0) {
      return res.status(400).json({
        success: false,
        message: "Variant price must be a valid non-negative number.",
      });
    }

    // Validate currency
    const allowedCurrencies = ["INR", "USD", "EUR", "JPY", "GBP"];
    const variantCurrency = targetVariant.priceCurrency || product.price?.priceCurrency || "INR";
    if (!allowedCurrencies.includes(variantCurrency)) {
      return res.status(400).json({
        success: false,
        message: "Invalid variant price currency.",
      });
    }

    // Validate attributes
    if (
      targetVariant.attributes !== undefined &&
      (typeof targetVariant.attributes !== "object" || Array.isArray(targetVariant.attributes))
    ) {
      return res.status(400).json({
        success: false,
        message: "Variant attributes must be an object.",
      });
    }

    // Map images
    let variantImages: { url: string }[] = targetVariant.images || [];
    if (Array.isArray(targetVariant.imageIndices)) {
      variantImages = targetVariant.imageIndices
        .map((idx: number) => product.images[idx])
        .filter((img) => img !== undefined);
    }

    // Find and update or push
    const targetId = String(targetVariant._id || targetVariant.id || "");
    let existingVariant = null;
    if (targetId) {
      existingVariant = product.variants.find((v: any) => v._id.toString() === targetId);
    }

    const newVariantData = {
      stock: variantStock,
      attributes: targetVariant.attributes || {},
      price: {
        priceAmount: variantPrice,
        priceCurrency: variantCurrency,
      },
      images: variantImages,
    };

    if (existingVariant) {
      existingVariant.stock = newVariantData.stock;
      existingVariant.attributes = newVariantData.attributes;
      existingVariant.price = newVariantData.price;
      existingVariant.images = newVariantData.images;
    } else {
      product.variants.push(newVariantData);
    }

    await product.save();

    return res.status(200).json({
      success: true,
      message: existingVariant ? "Variant updated successfully" : "Variant added successfully",
      product,
    });
  } catch (error) {
    console.error("Error in updateProductWithVariant:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
