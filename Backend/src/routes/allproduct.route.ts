import { Router } from "express";

import { getProductDetails, getProducts } from "../controllers/product.controller.js";

const allProductRouter = Router();

/**
 * @description -> Get all products and display to user
 * @route -> GET /api/all-product/all-products
 * @access -> Public
 */

allProductRouter.get("/all-products", getProducts);

/**
 * @description -> Get a particular product detail and display to user
 * @route -> GET /api/all-product/details/:id
 * @access -> Public
 */

allProductRouter.get("/details/:id", getProductDetails);

export default allProductRouter;
