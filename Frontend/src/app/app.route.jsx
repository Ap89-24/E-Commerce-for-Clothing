import { createBrowserRouter } from "react-router";
import Register from "../features/auth/pages/Register.jsx";
import Login from "../features/auth/pages/Login.jsx";
// import ProtectedRoute from "../features/auth/components/ProtectedRoute.jsx";
import CompleteProfile from "../features/auth/pages/CompleteProfile.jsx";
import CreateProduct from "../features/product/pages/CreateProduct.jsx";
import SellerProducts from "../features/product/pages/SellerProducts.jsx";
import ProductDetails from "../features/product/pages/ProductDetails.jsx";
import ProtectedRoute from "../features/auth/components/ProtectedRoute.jsx";

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
  {
    path: "/create-product",
    element: (
      <ProtectedRoute role="SELLER">
        <CreateProduct />
      </ProtectedRoute>
    ),
  },
  {
    path: "/seller-products",
    element: (
      <ProtectedRoute role="SELLER">
        <SellerProducts />
      </ProtectedRoute>
    ),
  },
  {
    path: "/product/:id",
    element: (
      <ProtectedRoute role="SELLER">
        <ProductDetails />
      </ProtectedRoute>
    ),
  },
]);
