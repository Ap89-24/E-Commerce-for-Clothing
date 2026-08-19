import { useEffect } from "react";
import { RouterProvider } from "react-router";
import { useAuthActions } from "../features/auth/hooks/useAuth";
import "./App.css";
import { routes } from "./app.route";

function App() {
  const { handleGetMe } = useAuthActions();

  useEffect(() => {
    handleGetMe().catch((err) => {
      console.log("Not authenticated or failed to retrieve session", err);
    });
  }, [handleGetMe]);

  // Global Lenis Smooth Scroll Initialization
  useEffect(() => {
    if (window.Lenis) {
      const lenis = new window.Lenis({
        lerp: 0.07,
        wheelMultiplier: 0.9,
        orientation: "vertical",
        gestureOrientation: "vertical",
        smoothWheel: true,
      });

      window.lenisInstance = lenis;

      function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
      }

      requestAnimationFrame(raf);

      return () => {
        lenis.destroy();
        window.lenisInstance = null;
      };
    }
  }, []);

  return <RouterProvider router={routes} />;
}

export default App;
