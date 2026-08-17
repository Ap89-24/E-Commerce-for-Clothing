import { useDispatch } from "react-redux";
import { completeProfile, getMe, login, register } from "../services/auth.api.js";
import { setUser, setError, setLoading } from "../state/auth.slice.js";
import { useCallback } from "react";

export const useAuthActions = () => {
  const dispatch = useDispatch();
  const handleRegister = useCallback(
    async ({ email, fullName, password, contact, isSeller = false }) => {
      try {
        dispatch(setLoading(true));
        const data = await register({
          email,
          fullName,
          password,
          contact,
          isSeller,
        });
        dispatch(setUser(data.user));
        dispatch(setError(null));
        return data;
      } catch (error) {
        const message = error?.response?.data?.message || error.message || "Registration failed";
        dispatch(setError(message));
        throw error;
      } finally {
        dispatch(setLoading(false));
      }
    },
    [dispatch]
  );

  const handleLogin = useCallback(
    async ({ email, password }) => {
      try {
        dispatch(setLoading(true));
        const data = await login({
          email,
          password,
        });
        dispatch(setUser(data.user));
        dispatch(setError(null));
        return data;
      } catch (error) {
        const message = error?.response?.data?.message || error.message || "Login failed";
        dispatch(setError(message));
        throw error;
      } finally {
        dispatch(setLoading(false));
      }
    },
    [dispatch]
  );

  const handleCompleteProfile = useCallback(
    async ({ contact, role }) => {
      try {
        dispatch(setLoading(true));

        const data = await completeProfile({
          contact,
          role,
        });

        dispatch(setUser(data.user));
        dispatch(setError(null));

        return data;
      } catch (error) {
        const message =
          error?.response?.data?.message || error.message || "Failed to complete profile";

        dispatch(setError(message));
        throw error;
      } finally {
        dispatch(setLoading(false));
      }
    },
    [dispatch]
  );
  const handleGetMe = useCallback(async () => {
    try {
      dispatch(setLoading(true));
      const data = await getMe();
      dispatch(setUser(data.user));
      dispatch(setError(null));
      return data;
    } catch (error) {
      dispatch(setUser(null));
      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  return {
    handleRegister,
    handleLogin,
    handleCompleteProfile,
    handleGetMe,
  };
};
