import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  setItems,
  setLoading,
  setError,
  incrementCartItem,
  decrementCartItem,
  removeCartItem,
} from "../state/cart.slice.js";
import {
  addCart,
  decrementCartItems,
  deleteCartItems,
  getCartItems,
  incrementCartItems,
  updateCartItemPriceApi,
} from "../services/cart.api.js";
import { getProductById } from "../../product/services/allProduct.api.js";

// Helper mapper to convert backend cart structure to frontend unified format
export const mapBackendCartToFrontend = (backendCart) => {
  const cartObj = Array.isArray(backendCart) ? backendCart[0] : backendCart;
  if (!cartObj || !cartObj.items) return [];
  return cartObj.items.map((item) => {
    const product = item.product;
    const variantId = item.variant;

    // Find the variant object (handle both array and unwound single object cases)
    const variantsList = product?.variants;
    const variantObj = Array.isArray(variantsList)
      ? variantsList.find((v) => v._id === variantId)
      : (variantsList && typeof variantsList === "object" ? variantsList : null);

    // Determine image
    const image = variantObj?.images?.[0]?.url || product?.images?.[0]?.url || "";

    // Determine color and size
    const color = variantObj?.attributes?.color || variantObj?.attributes?.Color || "Default";
    const size = variantObj?.attributes?.size || variantObj?.attributes?.Size || "";

    const currentPrice =
      variantObj?.price && typeof variantObj.price.priceAmount === "number"
        ? variantObj.price
        : product?.price || { priceAmount: 0, priceCurrency: "INR" };

    const originalPrice = item.price || currentPrice;
    const price = originalPrice;
    const newPrice = currentPrice;

    const hasPriceChanged = newPrice.priceAmount !== price.priceAmount;
    const priceDiff = newPrice.priceAmount - price.priceAmount;
    const priceChangeType = hasPriceChanged
      ? newPrice.priceAmount > price.priceAmount
        ? "increase"
        : "decrease"
      : null;

    return {
      cartItemId: `${product?._id || ""}-${variantId}`,
      productId: product?._id || "",
      variantId: variantId,
      title: product?.title || "Unknown Product",
      price,
      newPrice,
      hasPriceChanged,
      priceDiff,
      priceChangeType,
      image: image,
      color: color,
      size: size,
      quantity: item.quantity,
    };
  });
};

export const useCart = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const cartItems = useSelector((state) => state.cart.items);

  const handleGetAllCartProducts = useCallback(async () => {
    try {
      dispatch(setLoading(true));
      if (user) {
        const data = await getCartItems();
        if (data && data.success && data.cart) {
          const mappedItems = mapBackendCartToFrontend(data.cart);
          dispatch(setItems(mappedItems));
          localStorage.setItem("velnox_cart", JSON.stringify(mappedItems));
        } else {
          dispatch(setItems([]));
        }
      } else {
        // Guest user: load from local storage and update current prices
        const storedCart = localStorage.getItem("velnox_cart");
        if (storedCart) {
          const localItems = JSON.parse(storedCart);
          try {
            const uniqueProductIds = [...new Set(localItems.map((item) => item.productId))];
            const productDetailsMap = {};

            await Promise.all(
              uniqueProductIds.map(async (id) => {
                try {
                  const res = await getProductById(id);
                  if (res && res.success && res.product) {
                    productDetailsMap[id] = res.product;
                  }
                } catch (err) {
                  console.error(`Failed to fetch latest details for product ${id}`, err);
                }
              })
            );

            const updatedItems = localItems.map((item) => {
              const latestProduct = productDetailsMap[item.productId];
              if (!latestProduct) {
                return {
                  ...item,
                  newPrice: item.newPrice || item.price,
                  hasPriceChanged: false,
                  priceDiff: 0,
                  priceChangeType: null,
                };
              }

              const variantsList = latestProduct.variants;
              const variantObj = Array.isArray(variantsList)
                ? variantsList.find((v) => v._id === item.variantId)
                : (variantsList && typeof variantsList === "object" ? variantsList : null);
              const currentPrice =
                variantObj?.price && typeof variantObj.price.priceAmount === "number"
                  ? variantObj.price
                  : latestProduct.price || { priceAmount: 0, priceCurrency: "INR" };

              const originalPrice = item.originalPrice || item.price;
              const price = originalPrice;
              const newPrice = currentPrice;

              const hasPriceChanged = newPrice.priceAmount !== price.priceAmount;
              const priceDiff = newPrice.priceAmount - price.priceAmount;
              const priceChangeType = hasPriceChanged
                ? newPrice.priceAmount > price.priceAmount
                  ? "increase"
                  : "decrease"
                : null;

              return {
                ...item,
                price,
                newPrice,
                originalPrice,
                hasPriceChanged,
                priceDiff,
                priceChangeType,
              };
            });

            dispatch(setItems(updatedItems));
            localStorage.setItem("velnox_cart", JSON.stringify(updatedItems));
          } catch (e) {
            console.error("Error syncing guest cart prices:", e);
            dispatch(setItems(localItems));
          }
        } else {
          dispatch(setItems([]));
        }
      }
      dispatch(setError(null));
    } catch (error) {
      const message =
        error?.response?.data?.message || error.message || "Error in fetching products from cart";
      dispatch(setError(message));
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch, user]);

  const handleGetAddToCart = useCallback(
    async ({ product, variantId, quantity = 1 }) => {
      try {
        dispatch(setLoading(true));
        if (user) {
          // Authenticated user: save to database
          await addCart({ productId: product._id, variantId, quantity });
          // Retrieve the full updated cart to sync with backend
          const data = await getCartItems();
          if (data && data.success && data.cart) {
            const mappedItems = mapBackendCartToFrontend(data.cart);
            dispatch(setItems(mappedItems));
            localStorage.setItem("velnox_cart", JSON.stringify(mappedItems));
          }
        } else {
          // Guest user: save locally
          const variantObj = product.variants?.find((v) => v._id === variantId);
          const activePrice = variantObj?.price || product.price;
          const activeImage = variantObj?.images?.[0]?.url || product.images?.[0]?.url || "";
          const color = variantObj?.attributes?.color || variantObj?.attributes?.Color || "Default";
          const size = variantObj?.attributes?.size || variantObj?.attributes?.Size || "";

          const cartItemId = `${product._id}-${variantId}`;
          const existingIdx = cartItems.findIndex((item) => item.cartItemId === cartItemId);

          let updatedCart = [...cartItems];
          if (existingIdx > -1) {
            updatedCart[existingIdx] = {
              ...updatedCart[existingIdx],
              quantity: updatedCart[existingIdx].quantity + quantity,
            };
          } else {
            updatedCart.push({
              cartItemId,
              productId: product._id,
              variantId,
              title: product.title,
              price: activePrice,
              image: activeImage,
              color,
              size,
              quantity,
            });
          }

          dispatch(setItems(updatedCart));
          localStorage.setItem("velnox_cart", JSON.stringify(updatedCart));
        }
        dispatch(setError(null));
        return { success: true };
      } catch (error) {
        const message =
          error?.response?.data?.message || error.message || "Error in adding products to cart";
        dispatch(setError(message));
        throw error;
      } finally {
        dispatch(setLoading(false));
      }
    },
    [dispatch, user, cartItems]
  );

  const handleUpdateCartQuantity = useCallback(
    async (cartItemId, change) => {
      const item = cartItems.find((i) => i.cartItemId === cartItemId);
      if (!item) return;

      if (user) {
        try {
          dispatch(setLoading(true));
          if (change === 1) {
            await incrementCartItems({ productId: item.productId, variantId: item.variantId });
          } else if (change === -1 && item.quantity > 1) {
            await decrementCartItems({ productId: item.productId, variantId: item.variantId });
          }
          // Fetch updated cart from backend to sync state
          const data = await getCartItems();
          if (data && data.success && data.cart) {
            const mappedItems = mapBackendCartToFrontend(data.cart);
            dispatch(setItems(mappedItems));
            localStorage.setItem("velnox_cart", JSON.stringify(mappedItems));
          }
        } catch (error) {
          console.error("Error updating quantity on backend:", error);
          const message =
            error?.response?.data?.message || error.message || "Failed to update quantity";
          dispatch(setError(message));
        } finally {
          dispatch(setLoading(false));
        }
      } else {
        // Guest user: update locally
        const updated = cartItems
          .map((i) => {
            if (i.cartItemId === cartItemId) {
              const newQty = i.quantity + change;
              return { ...i, quantity: Math.max(1, newQty) };
            }
            return i;
          })
          .filter((i) => i.quantity > 0);

        dispatch(setItems(updated));
        localStorage.setItem("velnox_cart", JSON.stringify(updated));
      }
    },
    [dispatch, cartItems, user]
  );

  const handleDeleteCartItem = useCallback(
    async ({ productId, variantId }) => {
      try {
        dispatch(setLoading(true));

        const data = await deleteCartItems({ productId, variantId });

        dispatch(removeCartItem({ productId, variantId }));

        // Sync local storage as well
        const updated = cartItems.filter(
          (item) => item.productId !== productId || item.variantId !== variantId
        );
        localStorage.setItem("velnox_cart", JSON.stringify(updated));

        dispatch(setError(null));

        return { success: true, data };
      } catch (error) {
        const message = error
          ? error.response?.data?.message || error.message
          : "Error in removing item from the cart";

        dispatch(setError(message));

        return { success: false, error: message };
      } finally {
        dispatch(setLoading(false));
      }
    },
    [dispatch, cartItems]
  );

  const handleRemoveFromCart = useCallback(
    async (cartItemId) => {
      const item = cartItems.find((i) => i.cartItemId === cartItemId);
      if (!item) return;

      if (user) {
        await handleDeleteCartItem({ productId: item.productId, variantId: item.variantId });
      } else {
        // Guest user: update locally
        const updated = cartItems.filter((i) => i.cartItemId !== cartItemId);
        dispatch(setItems(updated));
        localStorage.setItem("velnox_cart", JSON.stringify(updated));
      }
    },
    [dispatch, cartItems, user, handleDeleteCartItem]
  );

  const handleClearCart = useCallback(() => {
    dispatch(setItems([]));
    localStorage.removeItem("velnox_cart");
  }, [dispatch]);

  const handleIncrementCartQuantity = useCallback(
    async ({ productId, variantId }) => {
      try {
        dispatch(setLoading(true));
        const data = await incrementCartItems({ productId, variantId });
        dispatch(incrementCartItem({ productId, variantId }));
        dispatch(setError(null));
        return { success: true, data };
      } catch (error) {
        const message = error
          ? error.response?.data?.message || error.message
          : "Error in incrementing products in the cart";
        dispatch(setError(message));
        return { success: false, error: message };
      } finally {
        dispatch(setLoading(false));
      }
    },
    [dispatch]
  );

  const handleDecrementCartQuantity = useCallback(
    async ({ productId, variantId }) => {
      try {
        dispatch(setLoading(true));
        const data = await decrementCartItems({ productId, variantId });
        dispatch(decrementCartItem({ productId, variantId }));
        dispatch(setError(null));
        return { success: true, data };
      } catch (error) {
        const message = error
          ? error.response?.data?.message || error.message
          : "Error in decrementing products in the cart";
        dispatch(setError(message));
        return { success: false, error: message };
      } finally {
        dispatch(setLoading(false));
      }
    },
    [dispatch]
  );

  const handleAcceptPriceChange = useCallback(
    async (cartItemId) => {
      const item = cartItems.find((i) => i.cartItemId === cartItemId);
      if (!item) return;

      try {
        dispatch(setLoading(true));
        if (user) {
          await updateCartItemPriceApi({ productId: item.productId, variantId: item.variantId });
          const data = await getCartItems();
          if (data && data.success && data.cart) {
            const mappedItems = mapBackendCartToFrontend(data.cart);
            dispatch(setItems(mappedItems));
            localStorage.setItem("velnox_cart", JSON.stringify(mappedItems));
          }
        } else {
          // Guest user: update locally
          const updated = cartItems.map((i) => {
            if (i.cartItemId === cartItemId) {
              return {
                ...i,
                price: i.newPrice,
                originalPrice: i.newPrice,
                hasPriceChanged: false,
                priceDiff: 0,
                priceChangeType: null,
              };
            }
            return i;
          });
          dispatch(setItems(updated));
          localStorage.setItem("velnox_cart", JSON.stringify(updated));
        }
      } catch (error) {
        console.error("Failed to update cart price:", error);
        const message = error?.response?.data?.message || error.message || "Failed to update price";
        dispatch(setError(message));
      } finally {
        dispatch(setLoading(false));
      }
    },
    [dispatch, cartItems, user]
  );

  return {
    cartItems,
    handleGetAddToCart,
    handleGetAllCartProducts,
    handleUpdateCartQuantity,
    handleRemoveFromCart,
    handleClearCart,
    handleIncrementCartQuantity,
    handleDecrementCartQuantity,
    handleDeleteCartItem,
    handleAcceptPriceChange,
  };
};
