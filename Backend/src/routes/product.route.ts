import { Router } from "express";
import multer from "multer";

import { createProduct } from "../controllers/product.controller.js";
import { isSellerAuthenticated } from "../middleware/seller.middleware.js";
import { validateCreateProduct } from "../validators/product.validator.js";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
});

const productRouter = Router();

productRouter.post(
  "/create-product",
  isSellerAuthenticated,
  validateCreateProduct,
  upload.array("images", 8),
  createProduct
);

export default productRouter;
