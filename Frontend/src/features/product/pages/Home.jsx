import { useState, useEffect, useMemo, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router";
import { useAllProducts } from "../hooks/useAllProducts";
import { setUser } from "../../auth/state/auth.slice";
import { useCart } from "../../cart/hooks/useCart";
import CartDrawer from "../components/CartDrawer";
import CheckoutDrawer from "../components/CheckoutDrawer";

const CURRENCY_SYMBOLS = {
  INR: "₹",
  USD: "$",
  EUR: "€",
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

const Home = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { handleGetProducts } = useAllProducts();
  const { products = [], loading } = useSelector((state) => state.product);
  const { user } = useSelector((state) => state.auth);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState("All");
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // Entry Loader State
  const [loaderVisible, setLoaderVisible] = useState(true);
  const [loaderFadeOut, setLoaderFadeOut] = useState(false);

  // Cart / Checkout state integration
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const {
    cartItems,
    handleUpdateCartQuantity: updateCartQuantity,
    handleRemoveFromCart: removeCartItem,
    handleClearCart,
  } = useCart();

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

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  const handleUpdateCartQuantity = (cartItemId, change) => {
    updateCartQuantity(cartItemId, change);
  };

  const handleRemoveFromCart = (cartItemId) => {
    removeCartItem(cartItemId);
    showToast("success", "Item removed from Atelier Shopping Bag");
  };

  const handleCartCheckout = () => {
    setCartOpen(false);
    setCheckoutOpen(true);
  };

  const handleCloseCheckout = () => {
    setCheckoutOpen(false);
    setCheckoutSuccess(false);
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
      handleClearCart();
    }, 2800);
  };

  const currentCartTotal = useMemo(() => {
    return cartItems.reduce(
      (acc, item) => acc + Number(item.price?.priceAmount || 0) * item.quantity,
      0
    );
  }, [cartItems]);

  const formattedCardNumber = useMemo(() => {
    if (!cardDetails.number) return "•••• •••• •••• ••••";
    return cardDetails.number.replace(/(.{4})/g, "$1 ").trim();
  }, [cardDetails.number]);

  useEffect(() => {
    handleGetProducts();
  }, [handleGetProducts]);

  // Synchronize loader visibility with API loading state
  useEffect(() => {
    if (!loading) {
      setLoaderFadeOut(true);
      const timer = setTimeout(() => {
        setLoaderVisible(false);
      }, 700);
      return () => clearTimeout(timer);
    } else {
      setLoaderVisible(true);
      setLoaderFadeOut(false);
    }
  }, [loading]);

  // Logout Handler
  const handleLogout = useCallback(() => {
    dispatch(setUser(null));
    setUserMenuOpen(false);
    navigate("/");
  }, [dispatch, navigate]);

  // Computed category tags based on product details
  const getProductTags = (product) => {
    const tags = ["All"];
    const content = `${product.title} ${product.description}`.toLowerCase();
    if (content.includes("silk")) tags.push("Silk");
    if (content.includes("saree")) tags.push("Sarees");
    if (content.includes("cotton")) tags.push("Cotton");
    if (content.includes("classy") || content.includes("stylish")) tags.push("Premium");
    return tags;
  };

  // Filtered products list
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase());

      if (selectedTag === "All") {
        return matchesSearch;
      } else {
        const tags = getProductTags(product);
        return matchesSearch && tags.includes(selectedTag);
      }
    });
  }, [products, searchQuery, selectedTag]);

  return (
    <div className="min-h-screen bg-brand-light flex flex-col font-sans selection:bg-brand-accent selection:text-white overflow-x-hidden">
      {/* Velnox Brand Shimmer Loader */}
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
            <h1 className="font-serif text-6xl md:text-8xl tracking-[0.25em] text-white font-extralight mb-6 transform scale-[0.98] hover:scale-100 transition-transform duration-[1.5s]">
              VELNOX
            </h1>
            <div className="h-[1px] w-36 bg-gradient-to-r from-transparent via-brand-accent to-transparent mx-auto animate-pulse" />
            <span className="text-[10px] tracking-[0.4em] font-semibold text-brand-accent uppercase mt-5 block">
              Atelier Haute Couture
            </span>
          </div>
        </div>
      )}

      {/* Atelier Marquee Announcement Bar */}
      <div className="bg-brand-dark text-brand-accent text-[9px] tracking-[0.3em] uppercase py-2.5 overflow-hidden border-b border-brand-accent/15 select-none relative z-40">
        <div className="flex animate-[marquee_25s_linear_infinite] whitespace-nowrap gap-12">
          <span>Complimentary global delivery on orders above ₹10,000</span>
          <span>•</span>
          <span>New Autumn Banarasi Silk Sarees added to catalog</span>
          <span>•</span>
          <span>Meticulously Handcrafted with Organic Mul-Cotton & Fine Silk</span>
          <span>•</span>
          <span>Complimentary global delivery on orders above ₹10,000</span>
          <span>•</span>
          <span>New Autumn Banarasi Silk Sarees added to catalog</span>
          <span>•</span>
          <span>Meticulously Handcrafted with Organic Mul-Cotton & Fine Silk</span>
        </div>
      </div>

      {/* Top Header bar with Glassmorphism */}
      <header className="border-b border-neutral-100 bg-white/80 backdrop-blur-md sticky top-0 z-40 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link
            to="/"
            className="font-serif text-2xl tracking-[0.25em] text-brand-dark hover:text-brand-accent transition-colors font-light"
          >
            VELNOX
          </Link>

          <div className="flex items-center gap-8">
            {/* Navigation links */}
            <nav className="hidden lg:flex items-center gap-8">
              <a
                href="#catalog-section"
                className="text-[10px] text-gray-500 hover:text-brand-dark transition-colors tracking-widest uppercase font-semibold"
              >
                Collection
              </a>
              <a
                href="#editorial-section"
                className="text-[10px] text-gray-500 hover:text-brand-dark transition-colors tracking-widest uppercase font-semibold"
              >
                Atelier Story
              </a>
              {user && user.role === "SELLER" && (
                <>
                  <Link
                    to="/seller-products"
                    className="text-[10px] text-gray-500 hover:text-brand-dark transition-colors tracking-widest uppercase font-semibold"
                  >
                    Manage Creations
                  </Link>
                  <Link
                    to="/create-product"
                    className="text-[10px] text-gray-500 hover:text-brand-dark transition-colors tracking-widest uppercase font-semibold"
                  >
                    Publish Article
                  </Link>
                </>
              )}
            </nav>

            <div className="h-4 w-[1px] bg-neutral-200 hidden lg:block" />

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

            {/* Profile Dropdown Component */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen((prev) => !prev)}
                  className="flex items-center gap-2.5 focus:outline-none group cursor-pointer"
                >
                  {user.profile ? (
                    <img
                      src={user.profile}
                      alt={user.fullName}
                      className="w-9 h-9 rounded-full object-cover border border-brand-accent/20 group-hover:border-brand-accent transition-colors"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-brand-accent/10 border border-brand-accent/25 flex items-center justify-center text-brand-accent text-xs font-serif font-bold group-hover:bg-brand-accent/20 transition-all">
                      {user.fullName
                        ? user.fullName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                        : "V"}
                    </div>
                  )}
                  <span className="hidden sm:inline text-[10px] tracking-wider uppercase font-semibold text-brand-dark group-hover:text-brand-accent transition-colors">
                    {user.fullName}
                  </span>
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
                        <span className="inline-block mt-1 text-[8px] font-bold text-brand-accent bg-brand-accent/10 px-1.5 py-0.5 rounded tracking-wider uppercase">
                          {user.role} Profile
                        </span>
                      </div>

                      {user.role === "SELLER" && (
                        <>
                          <Link
                            to="/seller-products"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center w-full px-3 py-2 text-xs text-gray-600 hover:text-brand-dark hover:bg-neutral-50 rounded-lg transition-colors"
                          >
                            Manage Products
                          </Link>
                          <Link
                            to="/create-product"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center w-full px-3 py-2 text-xs text-gray-600 hover:text-brand-dark hover:bg-neutral-50 rounded-lg transition-colors"
                          >
                            Publish Product
                          </Link>
                        </>
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
              <div className="flex items-center gap-4">
                <Link
                  to="/login"
                  className="text-[10px] font-bold text-brand-dark hover:text-brand-accent transition-colors tracking-widest uppercase"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center bg-brand-dark hover:bg-neutral-800 text-white font-medium px-5 h-10 rounded-xl transition-all tracking-wider uppercase text-[9px] border border-transparent shadow-sm shadow-black/10"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section - Editorial Split Design */}
      <section className="relative bg-brand-dark text-white overflow-hidden py-16 md:py-24 lg:py-32">
        {/* Fine Radial and Grid Overlays */}
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff05_1px,transparent_1px)] [background-size:32px_32px] pointer-events-none" />
        <div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-brand-accent/5 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute -bottom-24 right-1/4 w-[500px] h-[500px] bg-neutral-800/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 md:gap-16 items-center">
          {/* Hero Text content */}
          <div className="lg:col-span-7 flex flex-col items-start text-left">
            <span className="text-[10px] tracking-[0.5em] font-bold text-brand-accent uppercase mb-4 animate-fade-in">
              ATELIER COLLECTION • VOL. I
            </span>
            <h2 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-extralight tracking-tight leading-[1.05] mb-8 animate-fade-up">
              Sophistication <br />
              <span className="font-light italic text-brand-accent">In Every Single</span> <br />
              Detail.
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400 tracking-wider max-w-xl mb-12 leading-relaxed font-light animate-fade-up">
              Discover apparel that transcends fast fashion. Meticulously handcrafted garments
              designed with heritage fabrics, luxury weaves, and contemporary minimalist
              silhouettes.
            </p>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto animate-fade-up">
              <a
                href="#catalog-section"
                className="inline-flex items-center justify-center bg-brand-accent hover:bg-brand-accent-light text-brand-dark font-semibold px-8 h-12 rounded-xl transition-all duration-500 tracking-widest uppercase text-[10px] min-w-[170px]"
              >
                Browse Collection
              </a>
              {user && user.role === "SELLER" && (
                <Link
                  to="/create-product"
                  className="inline-flex items-center justify-center border border-white/20 hover:border-brand-accent hover:text-brand-accent text-white font-medium px-8 h-12 rounded-xl transition-all duration-500 tracking-widest uppercase text-[10px] min-w-[170px]"
                >
                  Create Listing
                </Link>
              )}
            </div>

            {/* Scroll Indicator */}
            <div className="hidden lg:flex items-center gap-3 mt-16 text-[9px] tracking-[0.3em] text-neutral-500 uppercase animate-pulse">
              <span>Scroll to explore</span>
              <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M19 14l-7 7m0 0l-7-7m7 7V3"
                />
              </svg>
            </div>
          </div>

          {/* Hero Portrait Frame */}
          <div className="lg:col-span-5 relative w-full flex justify-center lg:justify-end animate-fade-in">
            {/* Floating Label */}
            <div className="absolute -top-6 -left-6 z-20 bg-brand-accent text-brand-dark px-4 py-2 text-[9px] tracking-[0.3em] uppercase font-bold rounded-lg shadow-xl shadow-black/20">
              ATELIER NO. 01
            </div>

            <div className="relative w-full max-w-[360px] aspect-[4/5] rounded-3xl overflow-hidden border border-white/10 p-2 bg-white/5 backdrop-blur-xl">
              <div className="w-full h-full rounded-2xl overflow-hidden relative group">
                <img
                  src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000"
                  alt="High-fashion Editorial"
                  className="w-full h-full object-cover transition-transform duration-[2.5s] group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/40 via-transparent to-transparent" />
              </div>
            </div>
            {/* Background glowing element */}
            <div className="absolute -bottom-8 -right-8 w-48 h-48 bg-brand-accent/20 rounded-full blur-3xl -z-10 pointer-events-none" />
          </div>
        </div>
      </section>

      {/* Brand Highlights Section */}
      <section className="bg-white border-b border-neutral-100 py-10">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-10 text-center">
          <div className="py-2 flex flex-col items-center">
            <span className="w-8 h-8 rounded-full bg-brand-accent/10 text-brand-accent flex items-center justify-center mb-3">
              ★
            </span>
            <h4 className="text-[11px] font-bold text-brand-dark tracking-widest uppercase mb-1">
              Custom Tailored Fit
            </h4>
            <p className="text-[10px] text-gray-400 max-w-xs">
              Every garment is created with careful proportioning and sizing.
            </p>
          </div>
          <div className="py-2 flex flex-col items-center border-y md:border-y-0 md:border-x border-neutral-100">
            <span className="w-8 h-8 rounded-full bg-brand-accent/10 text-brand-accent flex items-center justify-center mb-3">
              ✦
            </span>
            <h4 className="text-[11px] font-bold text-brand-dark tracking-widest uppercase mb-1">
              100% Organic Fabrics
            </h4>
            <p className="text-[10px] text-gray-400 max-w-xs">
              Handpicked fine organic linens, mulberry silk, and luxury brocades.
            </p>
          </div>
          <div className="py-2 flex flex-col items-center">
            <span className="w-8 h-8 rounded-full bg-brand-accent/10 text-brand-accent flex items-center justify-center mb-3">
              ❃
            </span>
            <h4 className="text-[11px] font-bold text-brand-dark tracking-widest uppercase mb-1">
              DHL Premium Delivery
            </h4>
            <p className="text-[10px] text-gray-400 max-w-xs">
              Insured priority global delivery direct to your residence.
            </p>
          </div>
        </div>
      </section>

      {/* Editorial Story Section */}
      <section
        id="editorial-section"
        className="py-20 bg-neutral-50 border-b border-neutral-100 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-brand-accent/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5 order-2 lg:order-1 relative">
            <div className="aspect-[16/11] rounded-3xl overflow-hidden border border-neutral-200/60 p-2.5 bg-white shadow-xl shadow-neutral-100">
              <img
                src="https://images.unsplash.com/photo-1544441893-675973e31985?q=80&w=1000"
                alt="Atelier Loom and Fabric Detail"
                className="w-full h-full rounded-2xl object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -right-6 z-10 w-24 h-24 bg-brand-accent/10 rounded-full blur-xl pointer-events-none" />
          </div>

          <div className="lg:col-span-7 order-1 lg:order-2 flex flex-col items-start text-left">
            <span className="text-[9px] tracking-[0.4em] font-bold text-brand-accent uppercase mb-2">
              THE ART OF ATELIER
            </span>
            <h3 className="font-serif text-3xl md:text-5xl font-light text-brand-dark tracking-tight leading-none mb-6">
              "Craftsmanship is the ultimate luxury."
            </h3>
            <p className="text-[11px] sm:text-xs text-gray-500 leading-relaxed max-w-xl mb-8 tracking-wider font-light">
              At Velnox, our apparel is a tribute to heritage weaving. Every cotton-silk saree,
              every linen blazer, and every structural cut represents a master weaver's work. Our
              mission is to preserve the art of classical tailoring and offer timeless pieces that
              tell a story.
            </p>
            <div className="border-l border-brand-accent pl-6 py-1">
              <p className="font-serif italic text-xs text-brand-dark max-w-lg">
                "We don't design for a season. We design for a lifetime. Each thread is chosen for
                texture, weight, and longevity, giving our apparel its signature graceful flow."
              </p>
              <span className="text-[8px] tracking-[0.2em] font-bold uppercase text-gray-400 mt-2 block">
                — Head designer, Atelier Velnox
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Catalog Section */}
      <main
        id="catalog-section"
        className="flex-grow max-w-7xl mx-auto px-6 py-16 md:py-24 w-full relative z-10"
      >
        {/* Search & Filter Toolbar */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 border-b border-neutral-100 pb-10">
          <div>
            <span className="text-[10px] tracking-[0.3em] font-bold text-brand-accent uppercase mb-2.5 block">
              Atelier Catalog
            </span>
            <h3 className="font-serif text-3xl md:text-5xl text-brand-dark font-light tracking-tight leading-none">
              Curated Masterpieces
            </h3>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full md:w-auto">
            {/* Live Search Input */}
            <div className="relative flex-grow sm:w-64">
              <input
                type="text"
                placeholder="Search catalog..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-neutral-200 focus:border-brand-accent text-xs rounded-xl h-11 px-4 outline-none transition-all placeholder-gray-400 text-brand-dark focus:ring-1 focus:ring-brand-accent/20"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand-dark text-xs cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Quick Filter Tag Buttons */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
              {["All", "Sarees", "Silk", "Cotton", "Premium"].map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag)}
                  className={`px-4.5 h-8 rounded-full text-[10px] tracking-wider font-semibold transition-all select-none cursor-pointer border ${
                    selectedTag === tag
                      ? "bg-brand-dark border-brand-dark text-white shadow-md shadow-brand-dark/20"
                      : "bg-white border-neutral-200 text-gray-500 hover:text-brand-dark hover:border-brand-dark"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Empty Catalog State */}
        {filteredProducts.length === 0 && (
          <div className="text-center py-20 bg-white border border-neutral-100 rounded-3xl p-8 shadow-sm">
            <div className="w-16 h-16 rounded-full bg-brand-accent/5 flex items-center justify-center mx-auto mb-4 border border-brand-accent/10">
              <svg
                className="w-6 h-6 text-brand-accent"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
            </div>
            <h4 className="text-sm font-semibold text-brand-dark uppercase tracking-widest mb-1">
              No Pieces Found
            </h4>
            <p className="text-xs text-gray-400 max-w-sm mx-auto">
              We couldn't find any clothing articles matching your current search criteria.
            </p>
            {(searchQuery || selectedTag !== "All") && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedTag("All");
                }}
                className="mt-6 inline-flex items-center justify-center bg-brand-dark hover:bg-neutral-800 text-white font-medium px-5 h-9 rounded-lg transition-all tracking-wider uppercase text-[9px] cursor-pointer"
              >
                Reset Filters
              </button>
            )}
          </div>
        )}

        {/* Products Grid catalog */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {filteredProducts.map((p) => {
            const productTags = getProductTags(p).filter((t) => t !== "All");
            return (
              <div
                key={p._id}
                onClick={() => navigate(`/product/${p._id}`)}
                className="group bg-white border border-neutral-100 rounded-3xl overflow-hidden cursor-pointer hover:shadow-2xl hover:shadow-neutral-200/30 hover:border-brand-accent/40 transition-all duration-700 flex flex-col h-full relative"
              >
                {/* Images Preview Frame */}
                <div className="relative aspect-[4/5] bg-neutral-50 overflow-hidden border-b border-neutral-50">
                  {p.images && p.images.length > 0 ? (
                    <>
                      <img
                        src={p.images[0].url}
                        alt={p.title}
                        className="w-full h-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-105"
                      />
                      {/* Secondary image hover transition effect if available */}
                      {p.images.length > 1 && (
                        <img
                          src={p.images[1].url}
                          alt={p.title}
                          className="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-1000 ease-in-out group-hover:opacity-100"
                        />
                      )}
                    </>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-300">
                      <svg
                        className="w-12 h-12 stroke-current mb-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.2}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <span className="text-[9px] uppercase tracking-widest font-semibold">
                        No Image Available
                      </span>
                    </div>
                  )}

                  {/* Tag Overlays */}
                  {productTags.length > 0 && (
                    <div className="absolute top-4 left-4 flex flex-wrap gap-1.5 z-10">
                      {productTags.slice(0, 2).map((t) => (
                        <span
                          key={t}
                          className="bg-brand-dark/80 backdrop-blur-md text-white text-[8px] font-bold tracking-widest px-3 py-1.5 rounded-lg uppercase"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* View Details Overlay button */}
                  <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end justify-center pb-6">
                    <span className="bg-brand-dark text-white font-semibold px-6 py-3 rounded-xl text-[9px] tracking-widest uppercase transform translate-y-2 group-hover:translate-y-0 transition-all duration-500 shadow-xl shadow-black/25">
                      Explore Article
                    </span>
                  </div>
                </div>

                {/* Details Section */}
                <div className="p-7 flex-grow flex flex-col justify-between">
                  <div className="mb-4">
                    <h4 className="font-serif text-xl text-brand-dark group-hover:text-brand-accent transition-colors duration-500 line-clamp-1">
                      {p.title}
                    </h4>
                    <p className="text-[11px] text-gray-400 mt-1.5 line-clamp-2 leading-relaxed tracking-wide font-light">
                      {p.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-5 border-t border-neutral-50">
                    <span className="text-sm font-semibold text-brand-dark tracking-wide">
                      {formatPrice(p.price?.priceAmount, p.price?.priceCurrency)}
                    </span>
                    <span className="text-[9px] tracking-wider uppercase text-brand-accent font-bold group-hover:underline">
                      Explore Article →
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Newsletter Section */}
      <section className="py-20 bg-brand-dark text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff04_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-accent/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-2xl mx-auto px-6 text-center relative z-10">
          <span className="text-[9px] tracking-[0.5em] font-bold text-brand-accent uppercase mb-4 block">
            JOIN CLUB VELNOX
          </span>
          <h3 className="font-serif text-3xl md:text-5xl font-light tracking-tight leading-none mb-4">
            Become an Atelier Insider
          </h3>
          <p className="text-[11px] text-neutral-400 leading-relaxed max-w-md mx-auto mb-8 font-light tracking-wide">
            Subscribe to receive private collection releases, exclusive pricing invitations, and
            seasonal lookbooks from our design workshop.
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              alert("Thank you for subscribing.");
            }}
            className="flex flex-col sm:flex-row items-stretch gap-3 max-w-md mx-auto"
          >
            <input
              type="email"
              placeholder="Enter your email address"
              required
              className="flex-grow bg-white/5 border border-white/10 focus:border-brand-accent text-xs rounded-xl h-11 px-4 outline-none transition-all placeholder-gray-500 text-white focus:ring-1 focus:ring-brand-accent/20"
            />
            <button
              type="submit"
              className="inline-flex items-center justify-center bg-brand-accent hover:bg-brand-accent-light text-brand-dark font-semibold px-6 h-11 rounded-xl transition-all duration-500 tracking-widest uppercase text-[10px] cursor-pointer"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>

      {/* Premium Footer */}
      <footer className="bg-brand-dark text-white border-t border-white/5 py-16 font-light">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="md:col-span-2">
            <h3 className="font-serif text-2xl tracking-[0.25em] mb-4 text-white uppercase">
              VELNOX
            </h3>
            <p className="text-xs text-neutral-400 max-w-sm leading-relaxed mb-6 tracking-wide">
              Velnox is a modern designer collective providing premium luxury clothing. Crafted with
              standard design principles using silk, organic linen, and mul-cotton.
            </p>
          </div>
          <div>
            <h4 className="text-[10px] font-bold tracking-widest uppercase text-brand-accent mb-4">
              Explore
            </h4>
            <ul className="space-y-3 text-xs text-neutral-400">
              <li>
                <a href="#catalog-section" className="hover:text-white transition-colors">
                  Catalog
                </a>
              </li>
              <li>
                <Link to="/login" className="hover:text-white transition-colors">
                  Seller Account
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-white transition-colors">
                  Register
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-[10px] font-bold tracking-widest uppercase text-brand-accent mb-4">
              Atelier
            </h4>
            <p className="text-xs text-neutral-400 leading-relaxed tracking-wider">
              Mumbai, Maharashtra
              <br />
              India
              <br />
              <span className="text-[10px] text-brand-accent block mt-3">atelier@velnox.com</span>
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 border-t border-white/5 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center">
          <span className="text-[10px] text-neutral-500 tracking-wider">
            © {new Date().getFullYear()} VELNOX. All Rights Reserved.
          </span>
          <span className="text-[10px] text-neutral-500 tracking-widest uppercase font-semibold">
            Made with meticulous craftsmanship
          </span>
        </div>
      </footer>

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
        checkoutItemsList={cartItems}
        checkoutTotal={currentCartTotal}
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
    </div>
  );
};

export default Home;
