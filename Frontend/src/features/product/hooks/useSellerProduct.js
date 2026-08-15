import { useCallback } from "react";
import { createProducts, getSellerProducts } from "../services/product.api";
import { useDispatch } from "react-redux";
import { setSellerProducts, setLoading, setError } from "../state/product.slice";

export const useSellerProduct = () => {
  const dispatch = useDispatch();
  const handleCreateProduct = useCallback(
    async (formData) => {
      try {
        dispatch(setLoading(true));
        const data = await createProducts(formData);
        dispatch(setSellerProducts(data.products));
        dispatch(setError(null));
        return { success: true, data };
      } catch (error) {
        const message = error ? (error.response?.data?.message || error.message) : "Error in creating products";
        dispatch(setError(message));
        return { success: false, error: message };
      } finally {
        dispatch(setLoading(false));
      }
    },
    [dispatch]
  );

  const handleGetAllProducts = useCallback(async () => {
    try {
      dispatch(setLoading(true));
      const data = await getSellerProducts();
      dispatch(setSellerProducts(data.products));
      dispatch(setError(null));
    } catch (error) {
      const message = error ? error.message : "Error in fetching products";
      dispatch(setError(message));
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  return {
    handleCreateProduct,
    handleGetAllProducts,
  };
};
