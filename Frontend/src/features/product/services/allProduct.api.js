import axios from "axios";

const allProductApiInstance = axios.create({
  baseURL: "/api/all-product",
  withCredentials: true,
});

export const getAllProducts = async () => {
  try {
    const response = await allProductApiInstance.get("/all-products");

    return response.data;
  } catch (error) {
    console.error("Error in fetching product details", error);
    throw error;
  }
};

export const getProductById = async (id) => {
  try {
    const response = await allProductApiInstance.get(`/details/${id}`);

    return response.data;
  } catch (error) {
    console.error("Error in fetching product details", error);
    throw error;
  }
};
