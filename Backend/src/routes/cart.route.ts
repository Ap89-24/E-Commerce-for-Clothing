import { Router } from "express";

import {
  addToCart,
  createOrderController,
  decrementCartItemQuantity,
  deleteCartItem,
  getCart,
  incrementCartItemQuantity,
  updateCartItemPrice,
  verifyOrderController,
} from "../controllers/cart.controller.js";
import { isAuthenticated } from "../middleware/auth.middleware.js";
import {
  validateAddToCart,
  validateShippingAddress,
  validDecrementCartItemQuantity,
  validDeleteCartItem,
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

/**
 * @description Remove an item from the authenticated user's cart
 * @route DELETE /api/cart/:productId/:variantId
 * @access Private
 * @argument productId - Id of the product to remove
 * @argument variantId - Id of the variant to remove
 */

cartRouter.delete("/:productId/:variantId", isAuthenticated, validDeleteCartItem, deleteCartItem);

/**
 * @description Update cart item price to new seller price
 * @route PATCH /api/cart/update-price/:productId/:variantId
 * @access Private
 */
cartRouter.patch("/update-price/:productId/:variantId", isAuthenticated, updateCartItemPrice);

/**
 * @description Create order details and save shipping address
 * @route POST /api/cart/create-order
 * @access Private
 */
cartRouter.post("/create-order", isAuthenticated, validateShippingAddress, createOrderController);

/**
 * @description Verify payment and order details
 * @route POST /api/cart/create-order/verify
 * @access Private
 */
cartRouter.post("/create-order/verify", isAuthenticated, verifyOrderController);
export default cartRouter;
