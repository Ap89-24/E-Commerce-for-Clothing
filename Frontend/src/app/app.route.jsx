import { useEffect } from "react";
import { createBrowserRouter, useLocation, Outlet } from "react-router";
import Register from "../features/auth/pages/Register.jsx";
import Login from "../features/auth/pages/Login.jsx";
import CompleteProfile from "../features/auth/pages/CompleteProfile.jsx";
import CreateProduct from "../features/product/pages/CreateProduct.jsx";
import SellerProducts from "../features/product/pages/SellerProducts.jsx";
import ProductDetails from "../features/product/pages/ProductDetails.jsx";
import ProtectedRoute from "../features/auth/components/ProtectedRoute.jsx";
import Home from "../features/product/pages/Home.jsx";

const RootLayout = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    if (window.lenisInstance) {
      window.lenisInstance.scrollTo(0, { immediate: true });
    } else {
      window.scrollTo(0, 0);
    }
  }, [pathname]);

  return <Outlet />;
};

export const routes = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      {
        path: "/",
        element: <Home />,
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
    ],
  },
]);
