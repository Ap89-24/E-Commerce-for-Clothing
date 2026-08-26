import { Router } from "express";

import {
  addToCart,
  decrementCartItemQuantity,
  getCart,
  incrementCartItemQuantity,
} from "../controllers/cart.controller.js";
import { isAuthenticated } from "../middleware/auth.middleware.js";
import {
  validateAddToCart,
  validDecrementCartItemQuantity,
  validIncrementCartItemQuantity,
} from "../validators/cart.validator.js";

const cartRouter = Router();

/**
 * @description Add item to the cart
 * @route POST /api/cart/add/:productId/:variantId
 * @access Private
 * @argument productId - Id of the product to add
 * @argument variantId - Id of the variant to add
 */
cartRouter.post("/add/:productId/:variantId", isAuthenticated, validateAddToCart, addToCart);

/**
 * @description User can see their items in the cart
 * @route POST /api/cart/get-cart
 * @access Private
 */
cartRouter.get("/get-cart", isAuthenticated, getCart);

/**
 * @description Increment item quantity in the cart by one
 * @route PATCH /api/cart/quantity/increment/:productId/:variantId
 * @access Private
 * @argument productId - Id of the product to add
 * @argument variantId - Id of the variant to add
 */
cartRouter.patch(
  "/quantity/increment/:productId/:variantId",
  isAuthenticated,
  validIncrementCartItemQuantity,
  incrementCartItemQuantity
);

/**
 * @description Decrement item quantity in the cart by one
 * @route PATCH /api/cart/quantity/decrement/:productId/:variantId
 * @access Private
 * @argument productId - Id of the product to decrement
 * @argument variantId - Id of the variant to decrement
 */

cartRouter.patch(
  "/quantity/decrement/:productId/:variantId",
  isAuthenticated,
  validDecrementCartItemQuantity,
  decrementCartItemQuantity
);
export default cartRouter;
