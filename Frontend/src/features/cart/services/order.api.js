import axios from "axios";

const orderApiInstance = axios.create({
  baseURL: "/api/order",
  withCredentials: true,
});

export const checkoutOrderApi = async ({
  shippingAddress,
  orderItems,
  price,
  razorpay,
  status,
}) => {
  try {
    const response = await orderApiInstance.post("/checkout", {
      shippingAddress,
      orderItems,
      price,
      razorpay,
      status,
    });
    return response.data;
  } catch (error) {
    console.error("Error saving checkout order to database:", error);
    throw error;
  }
};

export const getMyOrdersApi = async () => {
  try {
    const response = await orderApiInstance.get("/my-orders");
    return response.data;
  } catch (error) {
    console.error("Error fetching order history:", error);
    throw error;
  }
};
