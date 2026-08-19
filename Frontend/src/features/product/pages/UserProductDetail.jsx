import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router";
import { useSelector, useDispatch } from "react-redux";
import { useAllProducts } from "../hooks/useAllProducts";
import { setUser } from "../../auth/state/auth.slice";

// Import modular subcomponents
import LightboxModal from "../components/LightboxModal";
import SizeGuideModal from "../components/SizeGuideModal";
import CartDrawer from "../components/CartDrawer";
import CheckoutDrawer from "../components/CheckoutDrawer";
import ReviewsSection from "../components/ReviewsSection";
import ProductGallery from "../components/ProductGallery";
import ProductDetailsInfo from "../components/ProductDetailsInfo";
import MobileStickyActions from "../components/MobileStickyActions";

const CURRENCY_SYMBOLS = {
  INR: "₹",
  USD: "$",
  VIR: "€",
  GBP: "£",
  JPY: "¥",
};

const formatPrice = (amount, currency) => {
  const symbol = CURRENCY_SYMBOLS[currency] || "₹";
  const num = Number(amount);
  if (isNaN(num)) return `${symbol}0.00`;
  return `${symbol}${num.toLocaleString("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
};

// Luxury preset color configurations for apparel selector
const APPAREL_COLORS = [
  { name: "Charcoal Black", hex: "#1c1c1c", accent: "text-neutral-900" },
  { name: "Champagne Gold", hex: "#d4af37", accent: "text-yellow-600" },
  { name: "Crimson Silk", hex: "#8b0000", accent: "text-red-800" },
  { name: "Royal Indigo", hex: "#1e3a8a", accent: "text-blue-900" },
  { name: "Ivory Cream", hex: "#fdf5e6", accent: "text-neutral-500" },
];

const UserProductDetail = () => {
  const { productid } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { handleGetProductById, handleGetProducts } = useAllProducts();

  // Redux state
  const { products = [], loading } = useSelector((state) => state.product);
  const { user } = useSelector((state) => state.auth);

  // Core detail page states
  const [product, setProduct] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(true);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");
  const [toast, setToast] = useState(null);

  // Option selectors
  const [selectedColor, setSelectedColor] = useState(APPAREL_COLORS[0]);
  const [selectedSize, setSelectedSize] = useState("M");
  const [quantity, setQuantity] = useState(1);

  // Dialogs and Drawers states
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImageIdx, setLightboxImageIdx] = useState(0);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // Cart list state (loaded from / stored in localStorage)
  const [cartItems, setCartItems] = useState([]);

  // Reviews states (persisted locally per product)
  const [reviews, setReviews] = useState([]);
  const [reviewForm, setReviewForm] = useState({
    name: "",
    rating: 5,
    comment: "",
  });
  const [ratingHover, setRatingHover] = useState(0);

  // Entrance animations loaders
  const [loaderVisible, setLoaderVisible] = useState(true);
  const [loaderFadeOut, setLoaderFadeOut] = useState(false);

  // Checkout shipping form & card mockup states
  const [shippingForm, setShippingForm] = useState({
    fullName: "",
    address: "",
    city: "",
    zipCode: "",
    contact: "",
  });
  const [cardDetails, setCardDetails] = useState({
    number: "",
    name: "",
    expiry: "",
    cvv: "",
  });
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [formErrors, setFormErrors] = useState({});
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);
  const [buyNowItem, setBuyNowItem] = useState(null); // When buy now is clicked, contains singular purchase item

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  // 1. Fetch Product details
  useEffect(() => {
    const fetchProduct = async () => {
      setLoadingDetails(true);
      const result = await handleGetProductById(productid);
      if (result && result.success) {
        setProduct(result.data.product);
        setErrorMsg("");
      } else {
        setErrorMsg(result?.error || "Failed to load product details.");
      }
      setLoadingDetails(false);
    };

    if (productid) {
      fetchProduct();
      // Reset selections
      setActiveImageIdx(0);
      setQuantity(1);
    }
  }, [productid, handleGetProductById]);

  // 2. Fetch Catalog Recommendations
  useEffect(() => {
    handleGetProducts();
  }, [handleGetProducts]);

  // 3. Load Local Reviews
  useEffect(() => {
    if (productid) {
      const savedReviews = localStorage.getItem(`velnox_reviews_${productid}`);
      if (savedReviews) {
        try {
          setReviews(JSON.parse(savedReviews));
        } catch (e) {
          console.error("Error parsing reviews", e);
        }
      } else {
        // Preseed elegant reviews
        const seedReviews = [
          {
            name: "Devika Roy Chaudhury",
            rating: 5,
            comment:
              "Absolutely majestic drape composition. The organic mulberry silk thread has a sublime sheen under studio lighting. Highly recommend for festive runways.",
            date: "12 Aug 2026",
            verified: true,
          },
          {
            name: "Kabir Sen",
            rating: 4,
            comment:
              "Very premium weave and tailoring cuts. Feels substantial yet highly breathable. Fitting is true to size.",
            date: "06 Aug 2026",
            verified: true,
          },
        ];
        setReviews(seedReviews);
        localStorage.setItem(`velnox_reviews_${productid}`, JSON.stringify(seedReviews));
      }
    }
  }, [productid]);

  // 4. Load Cart items on mount
  useEffect(() => {
    const storedCart = localStorage.getItem("velnox_cart");
    if (storedCart) {
      try {
        setCartItems(JSON.parse(storedCart));
      } catch (e) {
        console.error("Failed to parse cart items", e);
      }
    }
  }, []);

  // 5. Save Cart items to localStorage
  const saveCartToStorage = (items) => {
    setCartItems(items);
    localStorage.setItem("velnox_cart", JSON.stringify(items));
  };

  // 6. Handle entrance animation transitions
  useEffect(() => {
    if (!loadingDetails) {
      setLoaderFadeOut(true);
      const timer = setTimeout(() => {
        setLoaderVisible(false);
      }, 700);
      return () => clearTimeout(timer);
    } else {
      setLoaderVisible(true);
      setLoaderFadeOut(false);
    }
  }, [loadingDetails]);

  // 7. Logout Handler
  const handleLogout = useCallback(() => {
    dispatch(setUser(null));
    setUserMenuOpen(false);
    navigate("/");
  }, [dispatch, navigate]);

  // 8. Add to cart handler
  const handleAddToCart = () => {
    if (!product) return;

    const cartItemId = `${product._id}-${selectedColor.name}-${selectedSize}`;
    const existingIdx = cartItems.findIndex((item) => item.cartItemId === cartItemId);

    let updatedCart = [...cartItems];
    if (existingIdx > -1) {
      updatedCart[existingIdx].quantity += quantity;
    } else {
      updatedCart.push({
        cartItemId,
        productId: product._id,
        title: product.title,
        price: product.price,
        image: product.images && product.images.length > 0 ? product.images[0].url : "",
        color: selectedColor.name,
        size: selectedSize,
        quantity: quantity,
      });
    }

    saveCartToStorage(updatedCart);
    showToast("success", `Added ${quantity} item(s) to your Atelier Shopping Bag`);
    setCartOpen(true);
  };

  // 9. Buy Now (Direct Checkout)
  const handleBuyNow = () => {
    if (!product) return;

    const directItem = {
      cartItemId: `${product._id}-${selectedColor.name}-${selectedSize}-buynow`,
      productId: product._id,
      title: product.title,
      price: product.price,
      image: product.images && product.images.length > 0 ? product.images[0].url : "",
      color: selectedColor.name,
      size: selectedSize,
      quantity: quantity,
    };

    setBuyNowItem(directItem);
    setCheckoutOpen(true);
  };

  // 10. Update quantity in Cart drawer
  const handleUpdateCartQuantity = (cartItemId, change) => {
    const updated = cartItems
      .map((item) => {
        if (item.cartItemId === cartItemId) {
          const newQty = item.quantity + change;
          return { ...item, quantity: Math.max(1, newQty) };
        }
        return item;
      })
      .filter((item) => item.quantity > 0);

    saveCartToStorage(updated);
  };

  // 11. Remove item from Cart drawer
  const handleRemoveFromCart = (cartItemId) => {
    const updated = cartItems.filter((item) => item.cartItemId !== cartItemId);
    saveCartToStorage(updated);
    showToast("success", "Item removed from Atlelier Shopping Bag");
  };

  // 12. Proceed checkout from Cart
  const handleCartCheckout = () => {
    setBuyNowItem(null); // Use cart items
    setCartOpen(false);
    setCheckoutOpen(true);
  };

  // 13. Close Secure Checkout Drawer
  const handleCloseCheckout = () => {
    setCheckoutOpen(false);
    setCheckoutSuccess(false);
    setBuyNowItem(null);
    setShippingForm({
      fullName: "",
      address: "",
      city: "",
      zipCode: "",
      contact: "",
    });
    setCardDetails({
      number: "",
      name: "",
      expiry: "",
      cvv: "",
    });
    setFormErrors({});
  };

  // 14. Shipping Form Validation
  const validateForm = () => {
    const errors = {};
    if (!shippingForm.fullName.trim()) errors.fullName = "Full Name is required";
    if (!shippingForm.address.trim()) errors.address = "Street Address is required";
    if (!shippingForm.city.trim()) errors.city = "City is required";
    if (!shippingForm.zipCode.trim()) {
      errors.zipCode = "ZIP Code is required";
    } else if (!/^\d{5,6}$/.test(shippingForm.zipCode.trim())) {
      errors.zipCode = "Enter a valid 5 or 6 digit ZIP code";
    }
    if (!shippingForm.contact.trim()) {
      errors.contact = "Contact number is required";
    } else if (!/^\+?[\d\s-]{10,13}$/.test(shippingForm.contact.trim())) {
      errors.contact = "Enter a valid mobile contact number";
    }

    if (paymentMethod === "card") {
      if (!cardDetails.name.trim()) errors.cardName = "Cardholder Name is required";
      if (!cardDetails.number.trim()) {
        errors.cardNumber = "Card Number is required";
      } else if (!/^\d{16}$/.test(cardDetails.number.trim())) {
        errors.cardNumber = "Enter a valid 16-digit Card Number";
      }
      if (!cardDetails.expiry.trim()) {
        errors.cardExpiry = "Expiry is required";
      } else if (!/^\d{2}\/\d{2}$/.test(cardDetails.expiry.trim())) {
        errors.cardExpiry = "Enter expiry as MM/YY";
      }
      if (!cardDetails.cvv.trim()) {
        errors.cardCvv = "CVV is required";
      } else if (!/^\d{3}$/.test(cardDetails.cvv.trim())) {
        errors.cardCvv = "Enter 3-digit CVV";
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // 15. Submit Secure order simulation
  const handlePlaceOrderSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) {
      showToast("error", "Please correct validation errors on checkout form");
      return;
    }

    setIsPlacingOrder(true);

    setTimeout(() => {
      setIsPlacingOrder(false);
      setCheckoutSuccess(true);
      showToast("success", "Purchase transaction successfully broadcasted!");

      // If checkouting cart, clean the cart items
      if (!buyNowItem) {
        saveCartToStorage([]);
      }
    }, 2800);
  };

  // 16. Submit Review Form
  const handleReviewSubmit = (e) => {
    e.preventDefault();
    if (!reviewForm.name.trim() || !reviewForm.comment.trim()) {
      showToast("error", "Review details cannot be empty");
      return;
    }

    const newReview = {
      name: reviewForm.name,
      rating: reviewForm.rating,
      comment: reviewForm.comment,
      date: new Date().toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      verified: true,
    };

    const updatedReviews = [newReview, ...reviews];
    setReviews(updatedReviews);
    localStorage.setItem(`velnox_reviews_${productid}`, JSON.stringify(updatedReviews));

    // Reset review form
    setReviewForm({
      name: "",
      rating: 5,
      comment: "",
    });

    showToast("success", "Review published to Velnox atelier");
  };

  // 17. Computed Sizing & Related products lists
  const currentCartTotal = useMemo(() => {
    return cartItems.reduce(
      (acc, item) => acc + Number(item.price?.priceAmount || 0) * item.quantity,
      0
    );
  }, [cartItems]);

  const checkoutItemsList = useMemo(() => {
    if (buyNowItem) return [buyNowItem];
    return cartItems;
  }, [buyNowItem, cartItems]);

  const checkoutTotal = useMemo(() => {
    return checkoutItemsList.reduce(
      (acc, item) => acc + Number(item.price?.priceAmount || 0) * item.quantity,
      0
    );
  }, [checkoutItemsList]);

  const relatedProducts = useMemo(() => {
    if (!product || !products) return [];
    return products.filter((p) => p._id !== product._id).slice(0, 3);
  }, [products, product]);

  const averageRating = useMemo(() => {
    if (reviews.length === 0) return 5;
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    return (sum / reviews.length).toFixed(1);
  }, [reviews]);

  const formattedCardNumber = useMemo(() => {
    if (!cardDetails.number) return "•••• •••• •••• ••••";
    return cardDetails.number.replace(/(.{4})/g, "$1 ").trim();
  }, [cardDetails.number]);

  return (
    <div className="min-h-screen bg-brand-light flex flex-col font-sans selection:bg-brand-accent selection:text-white overflow-x-hidden relative">
      {/* VELNOX Luxury Entrance Shimmer Loader */}
      {loaderVisible && (
        <div
          className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-brand-dark transition-opacity duration-700 ease-in-out select-none ${
            loaderFadeOut ? "opacity-0 pointer-events-none" : "opacity-100"
          }`}
        >
          <div className="text-center animate-fade-up">
            <span className="text-[9px] tracking-[0.6em] font-light text-brand-accent/60 uppercase mb-3 block">
              Luxury Designer Atelier
            </span>
            <h1 className="font-serif text-6xl md:text-8xl tracking-[0.25em] text-white font-extralight mb-6 transform scale-[0.98]">
              VELNOX
            </h1>
            <div className="h-[1px] w-36 bg-gradient-to-r from-transparent via-brand-accent to-transparent mx-auto animate-pulse" />
            <span className="text-[10px] tracking-[0.4em] font-semibold text-brand-accent uppercase mt-5 block">
              ATELIER HAUTE COUTURE
            </span>
          </div>
        </div>
      )}

      {/* Global Toast Alert */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl border animate-fade-in transition-all duration-300 ${
            toast.type === "success"
              ? "bg-white border-emerald-100 text-emerald-800"
              : "bg-white border-red-100 text-red-800"
          }`}
        >
          <div
            className={`w-2.5 h-2.5 rounded-full ${
              toast.type === "success" ? "bg-emerald-500 animate-ping" : "bg-red-500 animate-ping"
            }`}
          />
          <span className="text-xs font-semibold uppercase tracking-wider">{toast.message}</span>
        </div>
      )}

      {/* Atelier Banner */}
      <div className="bg-brand-dark text-brand-accent text-[9px] tracking-[0.3em] uppercase py-2.5 overflow-hidden border-b border-brand-accent/15 select-none relative z-40">
        <div className="flex animate-[marquee_25s_linear_infinite] whitespace-nowrap gap-12">
          <span>Complimentary premium residency delivery on orders above ₹10,000</span>
          <span>•</span>
          <span>Meticulously Handcrafted with Organic Mul-Cotton & Fine Silk</span>
          <span>•</span>
          <span>Autumn atelier releases live now</span>
          <span>•</span>
          <span>Complimentary premium residency delivery on orders above ₹10,000</span>
        </div>
      </div>

      {/* Header bar with glassmorphism */}
      <header className="border-b border-neutral-100 bg-white/85 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link
            to="/"
            className="font-serif text-2xl tracking-[0.25em] text-brand-dark hover:text-brand-accent transition-colors font-light"
          >
            VELNOX
          </Link>

          <div className="flex items-center gap-6">
            {/* Quick links */}
            <nav className="hidden md:flex items-center gap-8">
              <Link
                to="/"
                className="text-[10px] text-gray-500 hover:text-brand-dark transition-colors tracking-widest uppercase font-semibold"
              >
                Collection
              </Link>
              {user && user.role === "SELLER" && (
                <Link
                  to="/seller-products"
                  className="text-[10px] text-gray-500 hover:text-brand-dark transition-colors tracking-widest uppercase font-semibold"
                >
                  Seller Panel
                </Link>
              )}
            </nav>

            {/* Cart trigger button */}
            <button
              onClick={() => setCartOpen(true)}
              className="relative p-2.5 hover:text-brand-accent transition-colors flex items-center justify-center cursor-pointer group"
              aria-label="Toggle Cart"
            >
              <svg
                className="w-5.5 h-5.5 stroke-current"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                />
              </svg>
              {cartItems.length > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-brand-accent text-white text-[8px] font-bold rounded-full flex items-center justify-center shadow-md animate-pulse">
                  {cartItems.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              )}
            </button>

            {/* User widget */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen((prev) => !prev)}
                  className="flex items-center gap-2 focus:outline-none group cursor-pointer"
                >
                  {user.profile ? (
                    <img
                      src={user.profile}
                      alt={user.fullName}
                      className="w-8 h-8 rounded-full object-cover border border-brand-accent/20 group-hover:border-brand-accent transition-colors"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-brand-accent/15 border border-brand-accent/30 flex items-center justify-center text-brand-accent text-[10px] font-serif font-bold group-hover:bg-brand-accent/25 transition-colors">
                      {user.fullName
                        ? user.fullName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                        : "V"}
                    </div>
                  )}
                </button>

                {userMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
                    <div className="absolute right-0 mt-3 w-56 rounded-xl border border-neutral-100 bg-white p-2 shadow-xl z-20 animate-fade-in">
                      <div className="px-3 py-2 border-b border-neutral-50 mb-1">
                        <p className="text-xs font-semibold text-brand-dark truncate">
                          {user.fullName}
                        </p>
                        <p className="text-[10px] text-gray-400 truncate">{user.email}</p>
                      </div>
                      {user.role === "SELLER" && (
                        <Link
                          to="/seller-products"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center w-full px-3 py-2 text-xs text-gray-600 hover:text-brand-dark hover:bg-neutral-50 rounded-lg transition-colors"
                        >
                          Manage Listings
                        </Link>
                      )}
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-3 py-2 text-xs text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium mt-1 cursor-pointer"
                      >
                        Sign Out
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="text-[10px] font-bold text-brand-dark hover:text-brand-accent transition-colors tracking-widest uppercase"
              >
                Log In
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main product detail section */}
      <main className="flex-grow max-w-7xl mx-auto px-6 py-10 md:py-16 w-full flex flex-col">
        {/* Back navigation button */}
        <Link
          to="/"
          className="inline-flex items-center gap-2.5 text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-brand-dark transition-colors mb-10 self-start group"
        >
          <svg
            className="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to catalog
        </Link>

        {errorMsg ? (
          /* Error State Panel */
          <div className="max-w-lg mx-auto text-center py-20 px-6 bg-white border border-neutral-100 rounded-3xl shadow-sm animate-fade-up">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-50 text-red-500 mb-6">
              <svg
                className="w-8 h-8"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
                />
              </svg>
            </div>
            <h3 className="font-serif text-2xl font-medium tracking-tight text-brand-dark mb-3">
              Atelier Article Error
            </h3>
            <p className="text-gray-400 text-sm mb-8 leading-relaxed">{errorMsg}</p>
            <Link
              to="/"
              className="inline-flex items-center justify-center bg-brand-dark hover:bg-neutral-800 text-white font-medium px-8 h-12 rounded-xl transition-all tracking-wider uppercase text-xs"
            >
              Return to Homepage
            </Link>
          </div>
        ) : (
          product && (
            <div className="flex flex-col gap-16">
              {/* Product Info Split Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
                {/* Left: Product Gallery Component */}
                <ProductGallery
                  product={product}
                  activeImageIdx={activeImageIdx}
                  setActiveImageIdx={setActiveImageIdx}
                  setLightboxOpen={setLightboxOpen}
                  setLightboxImageIdx={setLightboxImageIdx}
                />

                {/* Right: Product Selections, details info */}
                <ProductDetailsInfo
                  product={product}
                  selectedColor={selectedColor}
                  setSelectedColor={setSelectedColor}
                  selectedSize={selectedSize}
                  setSelectedSize={setSelectedSize}
                  quantity={quantity}
                  setQuantity={setQuantity}
                  onAddToCart={handleAddToCart}
                  onBuyNow={handleBuyNow}
                  onOpenSizeGuide={() => setSizeGuideOpen(true)}
                  formatPrice={formatPrice}
                  APPAREL_COLORS={APPAREL_COLORS}
                  reviews={reviews}
                  averageRating={averageRating}
                />
              </div>

              {/* Recommendations Section */}
              {relatedProducts.length > 0 && (
                <section className="border-t border-neutral-100 pt-16 mt-6">
                  <div className="mb-10 text-center">
                    <span className="text-[9px] tracking-[0.3em] font-bold text-brand-accent uppercase mb-2 block">
                      Selected Pairings
                    </span>
                    <h3 className="font-serif text-2xl md:text-3xl text-brand-dark font-light">
                      Atelier Recommends
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
                    {relatedProducts.map((p) => (
                      <div
                        key={p._id}
                        onClick={() => {
                          navigate(`/product/${p._id}`);
                        }}
                        className="group bg-white border border-neutral-100 rounded-3xl overflow-hidden cursor-pointer hover:shadow-xl hover:border-brand-accent/40 transition-all duration-500 flex flex-col h-full relative"
                      >
                        <div className="relative aspect-[4/5] bg-neutral-50 overflow-hidden border-b border-neutral-50">
                          {p.images && p.images.length > 0 ? (
                            <img
                              src={p.images[0].url}
                              alt={p.title}
                              className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-103"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300 text-[10px] uppercase font-bold tracking-widest">
                              No Image
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
                            <span className="bg-brand-dark text-white font-semibold px-4 py-2.5 rounded-lg text-[8px] tracking-widest uppercase transform translate-y-1.5 group-hover:translate-y-0 transition-all duration-300">
                              Explore Article
                            </span>
                          </div>
                        </div>
                        <div className="p-6 flex-grow flex flex-col justify-between">
                          <div>
                            <h4 className="font-serif text-base text-brand-dark group-hover:text-brand-accent transition-colors truncate">
                              {p.title}
                            </h4>
                            <p className="text-[10px] text-gray-400 mt-1 line-clamp-1 leading-relaxed">
                              {p.description}
                            </p>
                          </div>
                          <div className="flex items-center justify-between pt-4 border-t border-neutral-50 mt-4">
                            <span className="text-xs font-semibold text-brand-dark">
                              {formatPrice(p.price?.priceAmount, p.price?.priceCurrency)}
                            </span>
                            <span className="text-[8px] tracking-wider uppercase text-brand-accent font-bold">
                              Explore →
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Reviews Section Component */}
              <ReviewsSection
                reviews={reviews}
                averageRating={averageRating}
                reviewForm={reviewForm}
                setReviewForm={setReviewForm}
                ratingHover={ratingHover}
                setRatingHover={setRatingHover}
                onSubmitReview={handleReviewSubmit}
              />
            </div>
          )
        )}
      </main>

      {/* Sticky Bottom Actions Bar on Mobile */}
      {!errorMsg && (
        <MobileStickyActions
          product={product}
          onAddToCart={handleAddToCart}
          onBuyNow={handleBuyNow}
          formatPrice={formatPrice}
        />
      )}

      {/* Cart Drawer Sliding Right-to-Left */}
      <CartDrawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveFromCart}
        onCheckout={handleCartCheckout}
        currentCartTotal={currentCartTotal}
        formatPrice={formatPrice}
      />

      {/* Buy Now / Checkout Drawer Modal */}
      <CheckoutDrawer
        isOpen={checkoutOpen}
        onClose={handleCloseCheckout}
        checkoutSuccess={checkoutSuccess}
        checkoutItemsList={checkoutItemsList}
        checkoutTotal={checkoutTotal}
        shippingForm={shippingForm}
        setShippingForm={setShippingForm}
        cardDetails={cardDetails}
        setCardDetails={setCardDetails}
        paymentMethod={paymentMethod}
        setPaymentMethod={setPaymentMethod}
        formErrors={formErrors}
        isPlacingOrder={isPlacingOrder}
        onSubmitOrder={handlePlaceOrderSubmit}
        formattedCardNumber={formattedCardNumber}
        formatPrice={formatPrice}
      />

      {/* Lightbox Fullscreen Image Gallery Slider */}
      <LightboxModal
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        product={product}
        lightboxImageIdx={lightboxImageIdx}
        setLightboxImageIdx={setLightboxImageIdx}
      />

      {/* Size Guide Modal */}
      <SizeGuideModal isOpen={sizeGuideOpen} onClose={() => setSizeGuideOpen(false)} />

      {/* Premium footer */}
      <footer className="bg-brand-dark text-white border-t border-white/5 py-12 mt-20 font-light select-none">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center">
          <span className="text-[10px] text-neutral-500 tracking-wider">
            &copy; {new Date().getFullYear()} VELNOX. All Rights Reserved.
          </span>
          <span className="text-[10px] text-neutral-500 tracking-widest uppercase font-semibold">
            Made with meticulous craftsmanship
          </span>
        </div>
      </footer>
    </div>
  );
};

export default UserProductDetail;
