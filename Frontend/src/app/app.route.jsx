import { createBrowserRouter } from "react-router";
import Register from "../features/auth/pages/Register.jsx";


export const routes = createBrowserRouter([
    {
        path: "/",
        element: <Register />
    },
    {
        path: "/register",
        element: <Register />
    }
])