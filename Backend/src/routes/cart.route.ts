import { Router } from "express";

import { addToCart } from "../controllers/cart.controller.js";
import { isAuthenticated } from "../middleware/auth.middleware.js";
import { validateAddToCart } from "../validators/cart.validator.js";

const cartRouter = Router();

/**
 * @description Add item to the cart
 * @route POST /api/cart/add/:productId/:variantId
 * @access Private
 * @argument productId - Id of the product to add
 * @argument variantId - Id of the variant to add
 */
cartRouter.post("/add/:productId/:variantId", isAuthenticated, validateAddToCart, addToCart);

export default cartRouter;
