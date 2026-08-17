import axios from "axios";

const productApiInstance = axios.create({
  baseURL: "/api/products",
  withCredentials: true,
});

export const createProducts = async (formData) => {
  try {
    const response = await productApiInstance.post("/create-product", formData);

    return response.data;
  } catch (error) {
    console.error("Error in creating products", error);
    throw error;
  }
};

export const getSellerProducts = async () => {
  try {
    const response = await productApiInstance.get("/seller-products");

    return response.data;
  } catch (error) {
    console.error("Error in getting all products", error);
    throw error;
  }
};

export const getProductById = async (id) => {
  try {
    const response = await productApiInstance.get(`/${id}`);

    return response.data;
  } catch (error) {
    console.error("Error in getting product details", error);
    throw error;
  }
};

export const updateProduct = async (id, formData) => {
  try {
    const response = await productApiInstance.put(`/${id}`, formData);

    return response.data;
  } catch (error) {
    console.error("Error in updating product details", error);
    throw error;
  }
};

