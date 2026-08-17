import axios from "axios";

const authApiInstance = axios.create({
  baseURL: "/api/auth",
  withCredentials: true,
});

export const register = async ({ email, fullName, password, contact, isSeller }) => {
  try {
    const response = await authApiInstance.post("/register", {
      email,
      fullName,
      password,
      contact,
      isSeller,
    });

    return response.data;
  } catch (error) {
    console.error("Error in registration", error);
    throw error;
  }
};

export const login = async ({ email, password }) => {
  try {
    const response = await authApiInstance.post("/login", {
      email,
      password,
    });

    return response.data;
  } catch (error) {
    console.error("Error in login", error);
    throw error;
  }
};

export const completeProfile = async ({ contact, role }) => {
  try {
    const response = await authApiInstance.patch("/complete-profile", {
      contact,
      role,
    });

    return response.data;
  } catch (error) {
    console.error("Error completing profile", error);
    throw error;
  }
};

export const getMe = async () => {
  try {
    const response = await authApiInstance.get("/me");
    return response.data;
  } catch (error) {
    console.error("Error in getMe", error);
    throw error;
  }
};
