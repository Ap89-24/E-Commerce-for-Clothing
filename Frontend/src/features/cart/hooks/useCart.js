import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setItems, setLoading, setError } from "../state/cart.slice.js";
import { addCart, getCartItems } from "../services/cart.api.js";

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
    (cartItemId, change) => {
      const updated = cartItems
        .map((item) => {
          if (item.cartItemId === cartItemId) {
            const newQty = item.quantity + change;
            return { ...item, quantity: Math.max(1, newQty) };
          }
          return item;
        })
        .filter((item) => item.quantity > 0);

      dispatch(setItems(updated));
      localStorage.setItem("velnox_cart", JSON.stringify(updated));
    },
    [dispatch, cartItems]
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

  return {
    cartItems,
    handleGetAddToCart,
    handleGetAllCartProducts,
    handleUpdateCartQuantity,
    handleRemoveFromCart,
    handleClearCart,
  };
};
