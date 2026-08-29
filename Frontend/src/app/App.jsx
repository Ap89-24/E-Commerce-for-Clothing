import { useEffect, useState } from "react";
import { RouterProvider } from "react-router";
import { useSelector } from "react-redux";
import { useAuthActions } from "../features/auth/hooks/useAuth";
import { useCart } from "../features/cart/hooks/useCart";
import "./App.css";
import { routes } from "./app.route";

function App() {
  const { handleGetMe } = useAuthActions();
  const { handleGetAllCartProducts } = useCart();
  const { user } = useSelector((state) => state.auth);

  // Premium loading screen states
  const [showLoader, setShowLoader] = useState(true);
  const [fadeLoader, setFadeLoader] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    handleGetMe().catch((err) => {
      console.log("Not authenticated or failed to retrieve session", err);
    });
  }, [handleGetMe]);

  useEffect(() => {
    handleGetAllCartProducts().catch((err) => {
      console.error("Failed to sync cart products", err);
    });
  }, [user, handleGetAllCartProducts]);

  // Loading screen timer & progress line logic
  useEffect(() => {
    let startTimestamp = null;
    const duration = 5200; // 5.2 seconds of progress line animation

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const elapsed = timestamp - startTimestamp;
      const progressPercent = Math.min(Math.floor((elapsed / duration) * 100), 100);
      setProgress(progressPercent);

      if (elapsed < duration) {
        requestAnimationFrame(step);
      }
    };

    requestAnimationFrame(step);

    const timer = setTimeout(() => {
      setFadeLoader(true);
      const removeTimer = setTimeout(() => {
        setShowLoader(false);
      }, 800); // 800ms fadeout transition
      return () => clearTimeout(removeTimer);
    }, duration);

    return () => clearTimeout(timer);
  }, []);

  // Global Lenis Smooth Scroll Initialization
  useEffect(() => {
    if (window.Lenis) {
      const lenis = new window.Lenis({
        lerp: 0.07,
        wheelMultiplier: 0.9,
        orientation: "vertical",
        gestureOrientation: "vertical",
        smoothWheel: true,
        smoothTouch: true,
        syncTouch: true,
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

  return (
    <>
      {showLoader && (
        <div
          className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-neutral-950 text-white transition-all duration-[800ms] ease-in-out ${
            fadeLoader ? "opacity-0 pointer-events-none scale-[1.02]" : "opacity-100"
          }`}
        >
          {/* subtle radial mesh gradient overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(24,24,27,0.8)_0%,rgba(9,9,11,1)_100%)] pointer-events-none" />

          <div className="relative flex flex-col items-center select-none text-center z-10 px-6">
            {/* Elegant Subtitle */}
            <span
              className="text-[9px] tracking-[0.5em] text-neutral-500 uppercase mb-4"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              Atelier Couture
            </span>

            {/* Brand Logo */}
            <h1
              className="text-4xl md:text-5xl font-serif text-white uppercase leading-none mb-8 font-light"
              style={{
                letterSpacing: `${0.3 + progress * 0.002}em`,
                opacity: 0.2 + progress * 0.008,
                fontFamily: "'Playfair Display', 'Cinzel', serif",
              }}
            >
              VELNOX
            </h1>

            {/* Delicate Progress Line */}
            <div className="w-48 md:w-64 h-[1px] bg-neutral-800 relative overflow-hidden mb-4">
              <div
                className="absolute left-0 top-0 bottom-0 bg-[#c5a880] transition-all duration-75 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Percentage Indicator */}
            <span
              className="text-[9px] tracking-[0.25em] text-[#c5a880] font-mono"
              style={{ opacity: 0.85 }}
            >
              {String(progress).padStart(3, "0")} / 100
            </span>
          </div>
        </div>
      )}
      <RouterProvider router={routes} />
    </>
  );
}

export default App;
