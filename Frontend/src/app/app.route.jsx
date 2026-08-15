import { createBrowserRouter } from "react-router";
import Register from "../features/auth/pages/Register.jsx";
import Login from "../features/auth/pages/Login.jsx";
// import ProtectedRoute from "../features/auth/components/ProtectedRoute.jsx";
import CompleteProfile from "../features/auth/pages/CompleteProfile.jsx";

export const routes = createBrowserRouter([
  {
    path: "/",
    element: <h1>Home</h1>,
  },
  {
    path: "/register",
    element: <Register />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/complete-profile",
    element: <CompleteProfile />,
  },
]);
