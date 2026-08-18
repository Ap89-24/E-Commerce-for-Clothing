import { useCallback } from "react";
import { useDispatch } from "react-redux";
import { setProducts, setLoading, setError } from "../state/product.slice";
import { getAllProducts } from "../services/product.api";


export const useAllProducts = () => { 

    const dispatch = useDispatch();

    const handleGetProducts = useCallback(async () => {
    try {
      dispatch(setLoading(true));
      const data = await getAllProducts();
      dispatch(setProducts(data.products));
      dispatch(setError(null));
    } catch (error) {
      const message = error ? error.message : "Error in fetching products";
      dispatch(setError(message));
    } finally {
      dispatch(setLoading(false));
    }
    }, [dispatch]);
    
    return {
        handleGetProducts
    }
};