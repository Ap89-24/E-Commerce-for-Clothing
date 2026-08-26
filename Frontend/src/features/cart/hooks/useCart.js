import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setItems, setLoading, setError, incrementCartItem, decrementCartItem } from "../state/cart.slice.js";
import { addCart, decrementCartItems, getCartItems, incrementCartItems } from "../services/cart.api.js";

// Helper mapper to convert backend cart structure to frontend unified format
export const mapBackendCartToFrontend = (backendCart) => {
  if (!backendCart || !backendCart.items) return [];
  return backendCart.items.map((item) => {
    const product = item.product;
    const variantId = item.variant;

    // Find the variant object
    const variantObj = product?.variants?.find((v) => v._id === variantId);

    // Determine image
    const image = variantObj?.images?.[0]?.url || product?.images?.[0]?.url || "";

    // Determine color and size
    const color = variantObj?.attributes?.color || variantObj?.attributes?.Color || "Default";
    const size = variantObj?.attributes?.size || variantObj?.attributes?.Size || "";

    return {
      cartItemId: `${product?._id || ""}-${variantId}`,
      productId: product?._id || "",
      variantId: variantId,
      title: product?.title || "Unknown Product",
      price: item.price ||
        variantObj?.price ||
        product?.price || { priceAmount: 0, priceCurrency: "INR" },
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
        // Guest user: load from local storage
        const storedCart = localStorage.getItem("velnox_cart");
        if (storedCart) {
          dispatch(setItems(JSON.parse(storedCart)));
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

  const handleRemoveFromCart = useCallback(
    (cartItemId) => {
      const updated = cartItems.filter((item) => item.cartItemId !== cartItemId);
      dispatch(setItems(updated));
      localStorage.setItem("velnox_cart", JSON.stringify(updated));
    },
    [dispatch, cartItems]
  );

  const handleClearCart = useCallback(() => {
    dispatch(setItems([]));
    localStorage.removeItem("velnox_cart");
  }, [dispatch]);

  const handleIncrementCartQuantity = useCallback(
      async ({ productId, variantId }) => {
        try {
          dispatch(setLoading(true));
          const data = await incrementCartItems(productId, variantId);
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
          const data = await decrementCartItems(productId, variantId);
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
  return {
    cartItems,
    handleGetAddToCart,
    handleGetAllCartProducts,
    handleUpdateCartQuantity,
    handleRemoveFromCart,
    handleClearCart,
    handleIncrementCartQuantity,
    handleDecrementCartQuantity
  };
};
