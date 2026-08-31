import { useEffect, useRef } from "react";
import { createBrowserRouter, useLocation, Outlet } from "react-router";
import Register from "../features/auth/pages/Register.jsx";
import Login from "../features/auth/pages/Login.jsx";
import CompleteProfile from "../features/auth/pages/CompleteProfile.jsx";
import CreateProduct from "../features/product/pages/CreateProduct.jsx";
import SellerProducts from "../features/product/pages/SellerProducts.jsx";
import ProductDetails from "../features/product/pages/ProductDetails.jsx";
import ProtectedRoute from "../features/auth/components/ProtectedRoute.jsx";
import Home from "../features/product/pages/Home.jsx";
import UserProductDetail from "../features/product/pages/UserProductDetail.jsx";
import Checkout from "../features/product/pages/Checkout.jsx";
import OrderSuccess from "../features/product/pages/OrderSuccess.jsx";

const RootLayout = () => {
  const { pathname } = useLocation();
  const pageContainerRef = useRef(null);
  const progressBarRef = useRef(null);

  useEffect(() => {
    if (window.lenisInstance) {
      window.lenisInstance.scrollTo(0, { immediate: true });
    } else {
      window.scrollTo(0, 0);
    }

    if (window.gsap) {
      // 1. Top progress bar animation
      window.gsap.killTweensOf(progressBarRef.current);
      window.gsap.fromTo(
        progressBarRef.current,
        { width: "0%", opacity: 1 },
        {
          width: "100%",
          duration: 0.5,
          ease: "power2.out",
          onComplete: () => {
            window.gsap.to(progressBarRef.current, { opacity: 0, duration: 0.2 });
          },
        }
      );

      // 2. Page container slide-up and fade-in
      window.gsap.killTweensOf(pageContainerRef.current);
      window.gsap.fromTo(
        pageContainerRef.current,
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }
      );
    }
  }, [pathname]);

  return (
    <div className="relative">
      {/* Premium Top Progress Bar */}
      <div
        ref={progressBarRef}
        className="fixed top-0 left-0 h-1 z-50 pointer-events-none"
        style={{ width: "0%", backgroundColor: "#b89a6c" }}
      />
      {/* Page Content Container */}
      <div ref={pageContainerRef}>
        <Outlet />
      </div>
    </div>
  );
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
        path: "/checkout",
        element: (
          <ProtectedRoute>
            <Checkout />
          </ProtectedRoute>
        ),
      },
      {
        path: "/order-success",
        element: <OrderSuccess />,
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
        path: "/product/:productid",
        element: <UserProductDetail />,
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
        path: "/seller/product/:id",
        element: (
          <ProtectedRoute role="SELLER">
            <ProductDetails />
          </ProtectedRoute>
        ),
      },
    ],
  },
]);
