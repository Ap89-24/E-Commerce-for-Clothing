import { Router } from "express";

import { getProducts } from "../controllers/product.controller.js";
import { isAuthenticated } from "../middleware/auth.middleware.js";

const allProductRouter = Router();

/**
 * @description -> Get all products and display to user
 * @route -> GET /api/products/all-products
 * @access -> Public
 */

allProductRouter.get("/all-products", isAuthenticated, getProducts);

export default allProductRouter;
