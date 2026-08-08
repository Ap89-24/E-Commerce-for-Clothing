import { useDispatch } from "react-redux";
import { register } from "../services/auth.api.js";
import { setUser, setError, setLoading } from "../state/auth.slice.js";
import { useCallback } from "react";



export const useAuthActions = () => { 
    const dispatch = useDispatch();
    const handleRegister = useCallback(async ({
        email,
        fullName,
        password,
        contact,
        isSeller = false
    }) => { 
        try {
            dispatch(setLoading(true));
            const data = await register({
                email,
                fullName,
                password,
                contact,
                isSeller
            });
            dispatch(setUser(data.user));
            dispatch(setError(null));
        } catch (error) {
            const message = error ? error.message : "Registration failed";
            dispatch(setError(message));
        } finally {
            dispatch(setLoading(false));
        }
    } , [dispatch]);

    return {
        handleRegister,
    }
};

