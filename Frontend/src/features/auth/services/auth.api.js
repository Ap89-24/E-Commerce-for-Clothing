import axios from "axios";

const authApiInstance = axios.create({
    baseURL: "http://localhost:3000/api/auth",
    withCredentials: true,
})

export const register = async ({
    email,
    fullName,
    password,
    contact,
    isSeller
}) => { 
    try {
        const response = await authApiInstance.post("/register", {
            email,
            fullName,
            password,
            contact,
            isSeller
        });

        return response.data;
    } catch (error) {
        console.error("Error in registration", error);
        throw error;
    }
};