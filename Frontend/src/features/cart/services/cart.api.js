import axios from "axios";

const cartApiInstance = axios.create({
  baseURL: "/api/cart",
  withCredentials: true,
});

export const addCart = async ({ productId, variantId, quantity = 1 }) => {
  try {
    const response = await cartApiInstance.post(`/add/${productId}/${variantId}`, {
      quantity,
    });
    return response.data;
  } catch (error) {
    console.error("Error in adding products to cart", error);
    throw error;
  }
};

export const getCartItems = async () => {
  try {
    const response = await cartApiInstance.get("/get-cart");
    return response.data;
  } catch (error) {
    console.error("Error in fetching products from cart", error);
    throw error;
  }
};

export const incrementCartItems = async ({ productId, variantId }) => {
  try {
    const response = await cartApiInstance.patch(`/quantity/increment/${productId}/${variantId}`);
    return response.data;
  } catch (error) {
    console.error("Error in increasing products in the cart", error);
    throw error;
  }
};

export const decrementCartItems = async ({ productId, variantId }) => {
  try {
    const response = await cartApiInstance.patch(`/quantity/decrement/${productId}/${variantId}`);
    return response.data;
  } catch (error) {
    console.error("Error in increasing products in the cart", error);
    throw error;
  }
};
