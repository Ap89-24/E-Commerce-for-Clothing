import { Router } from "express";
import multer from "multer";

import { createProduct, getSellerProducts } from "../controllers/product.controller.js";
import { isSellerAuthenticated } from "../middleware/seller.middleware.js";
import { validateCreateProduct } from "../validators/product.validator.js";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
});

const productRouter = Router();

/**
 * @description -> Create a new product with product details and images
 * @route -> POST /api/products/create-product
 * @access -> Private (Seller Only)
 */
productRouter.post(
  "/create-product",
  isSellerAuthenticated,
  validateCreateProduct,
  upload.array("images", 8),
  createProduct
);

/**
 * @description -> Get all products created by the authenticated seller
 * @route -> GET /api/products/seller-products
 * @access -> Private (Seller Only)
 */
productRouter.get("/seller-products", isSellerAuthenticated, getSellerProducts);
export default productRouter;
