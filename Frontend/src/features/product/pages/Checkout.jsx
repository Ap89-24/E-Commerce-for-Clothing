import React, { useState, useEffect, useMemo, useRef } from "react";
import { useLocation, useNavigate, Link } from "react-router";
import { useSelector } from "react-redux";
import { useCart } from "../../cart/hooks/useCart";

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

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Load cart items from hook
  const { cartItems, handleClearCart } = useCart();

  // Buy now item from router state (if redirected from direct checkout)
  const buyNowItem = location.state?.buyNowItem || null;

  // Determine items and total to checkout
  const checkoutItems = useMemo(() => {
    return buyNowItem ? [buyNowItem] : cartItems;
  }, [buyNowItem, cartItems]);

  const checkoutTotal = useMemo(() => {
    return checkoutItems.reduce(
      (acc, item) => acc + Number(item.price?.priceAmount || 0) * item.quantity,
      0
    );
  }, [checkoutItems]);

  // States
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
  const [toast, setToast] = useState(null);

  // GSAP animation refs
  const formRef = useRef(null);
  const summaryRef = useRef(null);
  const headerRef = useRef(null);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  // Generate Receipt ID
  const receiptRefId = useMemo(() => {
    return `VNX-${Math.floor(100000 + Math.random() * 900000)}`;
  }, [checkoutSuccess]);

  // Card Number visual formatter
  const formattedCardNumber = useMemo(() => {
    if (!cardDetails.number) return "•••• •••• •••• ••••";
    return cardDetails.number.replace(/(.{4})/g, "$1 ").trim();
  }, [cardDetails.number]);

  // Handle redirect if no items in checkout
  useEffect(() => {
    if (checkoutItems.length === 0 && !checkoutSuccess) {
      navigate("/");
    }
  }, [checkoutItems, checkoutSuccess, navigate]);

  // GSAP Entrance Animations
  useEffect(() => {
    if (window.gsap) {
      window.gsap.fromTo(
        headerRef.current,
        { opacity: 0, y: -20 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" }
      );

      if (formRef.current && summaryRef.current) {
        window.gsap.fromTo(
          formRef.current,
          { opacity: 0, x: -30 },
          { opacity: 1, x: 0, duration: 0.8, ease: "power2.out", delay: 0.2 }
        );
        window.gsap.fromTo(
          summaryRef.current,
          { opacity: 0, x: 30 },
          { opacity: 1, x: 0, duration: 0.8, ease: "power2.out", delay: 0.2 }
        );
      }
    }
  }, [checkoutSuccess]);

  // Validation
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

      // Clear cart on checkout completion
      if (!buyNowItem) {
        handleClearCart();
      }
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-brand-light flex flex-col font-sans selection:bg-brand-accent selection:text-white">
      {/* Toast Alert popup */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 animate-fade-in pointer-events-none">
          <div
            className={`px-5 py-3.5 rounded-xl shadow-xl flex items-center gap-3 border text-xs font-semibold ${
              toast.type === "success"
                ? "bg-white border-emerald-100 text-emerald-800 shadow-emerald-100/50"
                : "bg-white border-red-100 text-red-800 shadow-red-100/50"
            }`}
          >
            <span>{toast.type === "success" ? "✓" : "✗"}</span>
            <p>{toast.message}</p>
          </div>
        </div>
      )}

      {/* Header bar */}
      <header ref={headerRef} className="border-b border-neutral-100 bg-white sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link
            to="/"
            className="font-serif text-2xl tracking-[0.25em] text-brand-dark hover:text-brand-accent transition-colors font-light"
          >
            VELNOX
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow max-w-7xl mx-auto w-full px-6 py-12 md:py-16">
        {checkoutSuccess ? (
          /* Checkout Success Receipt View */
          <div className="max-w-xl mx-auto bg-white border border-neutral-100 rounded-3xl p-8 shadow-xl shadow-neutral-100 text-center animate-fade-up">
            <div className="relative mb-6">
              <div className="w-24 h-24 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto text-emerald-500 relative z-10 animate-bounce">
                <svg
                  className="w-12 h-12"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2.5"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </div>
              <div className="absolute top-0 left-0 w-24 h-24 animate-ping bg-emerald-500/10 rounded-full" />
            </div>

            <h2 className="font-serif text-3xl font-light text-brand-dark mb-4">
              Atelier Purchase Completed
            </h2>
            <p className="text-gray-400 text-xs max-w-md mx-auto mb-8 leading-relaxed">
              Thank you for shopping at VELNOX. Your order has been registered at our Mumbai studio.
              A confirmation invoice summary has been dispatched to your email.
            </p>

            <div className="bg-neutral-50 border border-neutral-100 rounded-3xl p-6 text-left text-xs space-y-4 mb-8">
              <span className="text-[8px] uppercase tracking-widest text-brand-accent font-extrabold block mb-2">
                Receipt Invoice Voucher
              </span>
              <div className="flex justify-between">
                <span className="text-gray-400">Order Reference ID</span>
                <span className="font-mono text-brand-dark font-semibold">{receiptRefId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Delivery Address</span>
                <span className="text-brand-dark font-medium text-right max-w-[220px] truncate">
                  {shippingForm.fullName}, {shippingForm.address}, {shippingForm.city}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Items Ordered</span>
                <span className="font-medium text-brand-dark">
                  {checkoutItems.reduce((sum, item) => sum + item.quantity, 0)} Apparel
                </span>
              </div>
              <div className="h-[1px] w-full bg-neutral-200" />
              <div className="flex justify-between items-baseline pt-1">
                <span className="text-gray-400 font-bold">Total Amount Settled</span>
                <span className="text-lg font-serif font-bold text-brand-dark">
                  {formatPrice(checkoutTotal, checkoutItems[0]?.price?.priceCurrency)}
                </span>
              </div>
            </div>

            <Link
              to="/"
              className="inline-flex w-full items-center justify-center bg-brand-dark hover:bg-neutral-800 text-white font-medium h-12 rounded-xl transition-all duration-300 tracking-wider uppercase text-[10px]"
            >
              Continue Cataloging
            </Link>
          </div>
        ) : (
          /* Checkout Inputs Column Split Layout */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Left Column: Form Details (7 of 12 cols on desktop) */}
            <div
              ref={formRef}
              className="lg:col-span-7 bg-white border border-neutral-100 rounded-3xl p-6 md:p-8 shadow-sm"
            >
              <form onSubmit={handlePlaceOrderSubmit} className="space-y-8" noValidate>
                {/* 1. Delivery Details */}
                <div>
                  <h3 className="font-serif text-xl font-light text-brand-dark mb-6 flex items-center gap-2">
                    <span className="text-[11px] font-sans font-bold bg-brand-accent/10 text-brand-accent w-6 h-6 rounded-full flex items-center justify-center">
                      1
                    </span>
                    Delivery Address Information
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label
                        htmlFor="shipName"
                        className="text-gray-400 text-[9px] uppercase tracking-wider block mb-1.5 font-semibold"
                      >
                        Full Name
                      </label>
                      <input
                        type="text"
                        id="shipName"
                        placeholder="e.g. Aditi Sharma"
                        value={shippingForm.fullName}
                        onChange={(e) =>
                          setShippingForm({ ...shippingForm, fullName: e.target.value })
                        }
                        className={`w-full bg-white border text-xs rounded-xl h-11 px-4 outline-none transition-all placeholder-gray-400 text-brand-dark ${
                          formErrors.fullName
                            ? "border-red-500 focus:ring-1 focus:ring-red-100"
                            : "border-neutral-200 focus:border-brand-accent focus:ring-1 focus:ring-brand-accent/20"
                        }`}
                      />
                      {formErrors.fullName && (
                        <p className="text-red-500 text-[10px] mt-1">{formErrors.fullName}</p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="shipAddress"
                        className="text-gray-400 text-[9px] uppercase tracking-wider block mb-1.5 font-semibold"
                      >
                        Street Address
                      </label>
                      <input
                        type="text"
                        id="shipAddress"
                        placeholder="Studio Apt, Building, Street details..."
                        value={shippingForm.address}
                        onChange={(e) =>
                          setShippingForm({ ...shippingForm, address: e.target.value })
                        }
                        className={`w-full bg-white border text-xs rounded-xl h-11 px-4 outline-none transition-all placeholder-gray-400 text-brand-dark ${
                          formErrors.address
                            ? "border-red-500 focus:ring-1"
                            : "border-neutral-200 focus:border-brand-accent focus:ring-1 focus:ring-brand-accent/20"
                        }`}
                      />
                      {formErrors.address && (
                        <p className="text-red-500 text-[10px] mt-1">{formErrors.address}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label
                          htmlFor="shipCity"
                          className="text-gray-400 text-[9px] uppercase tracking-wider block mb-1.5 font-semibold"
                        >
                          City
                        </label>
                        <input
                          type="text"
                          id="shipCity"
                          placeholder="Mumbai"
                          value={shippingForm.city}
                          onChange={(e) =>
                            setShippingForm({ ...shippingForm, city: e.target.value })
                          }
                          className={`w-full bg-white border text-xs rounded-xl h-11 px-4 outline-none transition-all placeholder-gray-400 text-brand-dark ${
                            formErrors.city
                              ? "border-red-500 focus:ring-1"
                              : "border-neutral-200 focus:border-brand-accent focus:ring-1 focus:ring-brand-accent/20"
                          }`}
                        />
                        {formErrors.city && (
                          <p className="text-red-500 text-[10px] mt-1">{formErrors.city}</p>
                        )}
                      </div>

                      <div>
                        <label
                          htmlFor="shipZip"
                          className="text-gray-400 text-[9px] uppercase tracking-wider block mb-1.5 font-semibold"
                        >
                          ZIP / Postal Code
                        </label>
                        <input
                          type="text"
                          id="shipZip"
                          placeholder="400001"
                          value={shippingForm.zipCode}
                          onChange={(e) =>
                            setShippingForm({ ...shippingForm, zipCode: e.target.value })
                          }
                          className={`w-full bg-white border text-xs rounded-xl h-11 px-4 outline-none transition-all placeholder-gray-400 text-brand-dark ${
                            formErrors.zipCode
                              ? "border-red-500 focus:ring-1"
                              : "border-neutral-200 focus:border-brand-accent focus:ring-1 focus:ring-brand-accent/20"
                          }`}
                        />
                        {formErrors.zipCode && (
                          <p className="text-red-500 text-[10px] mt-1">{formErrors.zipCode}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="shipContact"
                        className="text-gray-400 text-[9px] uppercase tracking-wider block mb-1.5 font-semibold"
                      >
                        Mobile Number
                      </label>
                      <input
                        type="tel"
                        id="shipContact"
                        placeholder="e.g. 9876543210"
                        value={shippingForm.contact}
                        onChange={(e) =>
                          setShippingForm({ ...shippingForm, contact: e.target.value })
                        }
                        className={`w-full bg-white border text-xs rounded-xl h-11 px-4 outline-none transition-all placeholder-gray-400 text-brand-dark ${
                          formErrors.contact
                            ? "border-red-500 focus:ring-1"
                            : "border-neutral-200 focus:border-brand-accent focus:ring-1 focus:ring-brand-accent/20"
                        }`}
                      />
                      {formErrors.contact && (
                        <p className="text-red-500 text-[10px] mt-1">{formErrors.contact}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* 2. Payment details */}
                <div>
                  <h3 className="font-serif text-xl font-light text-brand-dark mb-6 flex items-center gap-2 border-t border-neutral-50 pt-8">
                    <span className="text-[11px] font-sans font-bold bg-brand-accent/10 text-brand-accent w-6 h-6 rounded-full flex items-center justify-center">
                      2
                    </span>
                    Payment Processing
                  </h3>

                  <div className="grid grid-cols-3 gap-3 mb-6">
                    {["card", "upi", "banking"].map((pm) => (
                      <button
                        key={pm}
                        type="button"
                        onClick={() => setPaymentMethod(pm)}
                        className={`h-11 rounded-xl border text-[10px] font-bold tracking-wider transition-all select-none cursor-pointer flex items-center justify-center ${
                          paymentMethod === pm
                            ? "bg-brand-dark border-brand-dark text-white shadow-md shadow-brand-dark/20"
                            : "bg-white border-neutral-200 text-gray-500 hover:text-brand-dark hover:border-brand-dark"
                        }`}
                      >
                        {pm === "card" ? "Credit Card" : pm === "upi" ? "UPI Apps" : "Net Banking"}
                      </button>
                    ))}
                  </div>

                  {paymentMethod === "card" && (
                    <div className="space-y-6">
                      {/* Visual Card representation */}
                      <div className="relative aspect-[1.586/1] w-full max-w-xs rounded-3xl p-6 bg-gradient-to-br from-neutral-900 via-neutral-950 to-neutral-800 text-white shadow-xl mx-auto flex flex-col justify-between overflow-hidden border border-white/10">
                        <div className="flex justify-between items-start">
                          <div className="w-10 h-7.5 rounded bg-gradient-to-r from-yellow-300 to-yellow-500 opacity-80" />
                          <span className="font-serif italic text-xs tracking-widest text-brand-accent">
                            VELNOX
                          </span>
                        </div>
                        <div className="text-base sm:text-lg font-mono tracking-widest text-center select-none py-1">
                          {formattedCardNumber}
                        </div>
                        <div className="flex justify-between items-end">
                          <div className="min-w-0 pr-4">
                            <span className="text-[6px] uppercase tracking-wider text-gray-400 block mb-0.5">
                              Cardholder
                            </span>
                            <span className="text-[10px] font-semibold uppercase tracking-wider truncate block">
                              {cardDetails.name || "A. Sharma"}
                            </span>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <span className="text-[6px] uppercase tracking-wider text-gray-400 block mb-0.5">
                              Expiry
                            </span>
                            <span className="text-[10px] font-semibold font-mono">
                              {cardDetails.expiry || "MM/YY"}
                            </span>
                          </div>
                        </div>
                        <div className="absolute top-1/2 left-2/3 w-36 h-36 border border-brand-accent/15 rounded-full pointer-events-none" />
                      </div>

                      {/* Card form inputs */}
                      <div className="space-y-4">
                        <div>
                          <label
                            htmlFor="cardName"
                            className="text-gray-400 text-[9px] uppercase tracking-wider block mb-1.5 font-semibold"
                          >
                            Cardholder Name
                          </label>
                          <input
                            type="text"
                            id="cardName"
                            placeholder="Name on card"
                            value={cardDetails.name}
                            onChange={(e) =>
                              setCardDetails({ ...cardDetails, name: e.target.value })
                            }
                            className={`w-full bg-white border text-xs rounded-xl h-11 px-4 outline-none transition-all placeholder-gray-400 text-brand-dark ${
                              formErrors.cardName
                                ? "border-red-500 focus:ring-1"
                                : "border-neutral-200 focus:border-brand-accent focus:ring-1 focus:ring-brand-accent/20"
                            }`}
                          />
                          {formErrors.cardName && (
                            <p className="text-red-500 text-[10px] mt-1">{formErrors.cardName}</p>
                          )}
                        </div>

                        <div>
                          <label
                            htmlFor="cardNumber"
                            className="text-gray-400 text-[9px] uppercase tracking-wider block mb-1.5 font-semibold"
                          >
                            Card Number
                          </label>
                          <input
                            type="text"
                            id="cardNumber"
                            maxLength="16"
                            placeholder="1234567812345678"
                            value={cardDetails.number}
                            onChange={(e) =>
                              setCardDetails({
                                ...cardDetails,
                                number: e.target.value.replace(/\D/g, ""),
                              })
                            }
                            className={`w-full bg-white border text-xs rounded-xl h-11 px-4 outline-none transition-all placeholder-gray-400 text-brand-dark ${
                              formErrors.cardNumber
                                ? "border-red-500 focus:ring-1"
                                : "border-neutral-200 focus:border-brand-accent focus:ring-1 focus:ring-brand-accent/20"
                            }`}
                          />
                          {formErrors.cardNumber && (
                            <p className="text-red-500 text-[10px] mt-1">{formErrors.cardNumber}</p>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label
                              htmlFor="cardExpiry"
                              className="text-gray-400 text-[9px] uppercase tracking-wider block mb-1.5 font-semibold"
                            >
                              Expiry Date
                            </label>
                            <input
                              type="text"
                              id="cardExpiry"
                              maxLength="5"
                              placeholder="MM/YY"
                              value={cardDetails.expiry}
                              onChange={(e) => {
                                let val = e.target.value.replace(/\D/g, "");
                                if (val.length > 2) val = val.slice(0, 2) + "/" + val.slice(2, 4);
                                setCardDetails({ ...cardDetails, expiry: val });
                              }}
                              className={`w-full bg-white border text-xs rounded-xl h-11 px-4 outline-none transition-all placeholder-gray-400 text-brand-dark ${
                                formErrors.cardExpiry
                                  ? "border-red-500 focus:ring-1"
                                  : "border-neutral-200 focus:border-brand-accent focus:ring-1 focus:ring-brand-accent/20"
                              }`}
                            />
                            {formErrors.cardExpiry && (
                              <p className="text-red-500 text-[10px] mt-1">
                                {formErrors.cardExpiry}
                              </p>
                            )}
                          </div>

                          <div>
                            <label
                              htmlFor="cardCvv"
                              className="text-gray-400 text-[9px] uppercase tracking-wider block mb-1.5 font-semibold"
                            >
                              Secure CVV
                            </label>
                            <input
                              type="password"
                              id="cardCvv"
                              maxLength="3"
                              placeholder="•••"
                              value={cardDetails.cvv}
                              onChange={(e) =>
                                setCardDetails({
                                  ...cardDetails,
                                  cvv: e.target.value.replace(/\D/g, ""),
                                })
                              }
                              className={`w-full bg-white border text-xs rounded-xl h-11 px-4 outline-none transition-all placeholder-gray-400 text-brand-dark ${
                                formErrors.cardCvv
                                  ? "border-red-500 focus:ring-1"
                                  : "border-neutral-200 focus:border-brand-accent focus:ring-1 focus:ring-brand-accent/20"
                              }`}
                            />
                            {formErrors.cardCvv && (
                              <p className="text-red-500 text-[10px] mt-1">{formErrors.cardCvv}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {paymentMethod === "upi" && (
                    <div className="bg-neutral-50 p-5 border border-neutral-100 rounded-2xl flex flex-col gap-4">
                      <p className="text-[10px] text-gray-400 leading-relaxed">
                        Select your preferred UPI app. On clicking place order, a payment collect
                        request notification will be broadcast.
                      </p>
                      <div className="grid grid-cols-2 gap-3 text-center text-[10px] font-semibold text-brand-dark">
                        <span className="p-3.5 border border-neutral-200 bg-white rounded-xl cursor-pointer hover:border-brand-accent hover:text-brand-accent transition-all select-none">
                          Google Pay
                        </span>
                        <span className="p-3.5 border border-neutral-200 bg-white rounded-xl cursor-pointer hover:border-brand-accent hover:text-brand-accent transition-all select-none">
                          PhonePe
                        </span>
                      </div>
                    </div>
                  )}

                  {paymentMethod === "banking" && (
                    <div className="bg-neutral-50 p-5 border border-neutral-100 rounded-2xl flex flex-col gap-3">
                      <label
                        htmlFor="bankingSelect"
                        className="text-gray-400 text-[9px] uppercase tracking-wider block mb-1 font-semibold"
                      >
                        Choose Major Bank
                      </label>
                      <select
                        id="bankingSelect"
                        className="w-full bg-white border border-neutral-200 text-xs rounded-xl h-11 px-3 outline-none cursor-pointer text-brand-dark focus:border-brand-accent"
                      >
                        <option>HDFC Bank</option>
                        <option>ICICI Bank</option>
                        <option>State Bank of India</option>
                        <option>Axis Bank</option>
                      </select>
                    </div>
                  )}
                </div>

                {/* Place order button */}
                <button
                  type="submit"
                  disabled={isPlacingOrder}
                  className="w-full flex items-center justify-center bg-brand-dark hover:bg-neutral-800 disabled:bg-neutral-400 text-white font-medium h-12 rounded-xl transition-all duration-300 tracking-wider uppercase text-[10px] cursor-pointer mt-8"
                >
                  {isPlacingOrder ? (
                    <div className="flex items-center gap-2">
                      <svg
                        className="animate-spin h-4 w-4 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      <span>Broadcasting Transaction...</span>
                    </div>
                  ) : (
                    `Settle & Order ${formatPrice(checkoutTotal, checkoutItems[0]?.price?.priceCurrency)}`
                  )}
                </button>
              </form>
            </div>

            {/* Right Column: Order Items Summary & Costs (5 of 12 cols on desktop) */}
            <div
              ref={summaryRef}
              className="lg:col-span-5 bg-white border border-neutral-100 rounded-3xl p-6 md:p-8 shadow-sm space-y-6"
            >
              <div>
                <span className="text-[8px] uppercase tracking-widest text-brand-accent font-extrabold mb-2.5 block">
                  Purchasing Creations Recap
                </span>
                <h3 className="font-serif text-lg text-brand-dark font-light mb-4">
                  Items Details
                </h3>

                <div className="divide-y divide-neutral-100 max-h-[300px] overflow-y-auto no-scrollbar">
                  {checkoutItems.map((item) => (
                    <div
                      key={item.cartItemId}
                      className="py-3 flex items-start justify-between gap-4 first:pt-0 last:pb-0"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt=""
                            className="w-12 h-16 object-cover rounded-xl border border-neutral-200/50 flex-shrink-0"
                          />
                        ) : (
                          <div className="w-12 h-16 rounded-xl bg-neutral-50 border border-neutral-200/50 flex items-center justify-center text-[8px] font-bold text-gray-400 flex-shrink-0 leading-tight text-center">
                            No
                            <br />
                            Image
                          </div>
                        )}
                        <div className="min-w-0">
                          <h5 className="text-[11px] font-semibold text-brand-dark truncate max-w-[170px]">
                            {item.title}
                          </h5>
                          <p className="text-[9px] text-gray-400 mt-1 uppercase tracking-wide">
                            Hue: <span className="font-medium text-brand-dark">{item.color}</span> •
                            Size: <span className="font-medium text-brand-dark">{item.size}</span>
                          </p>
                          <p className="text-[9px] text-gray-400 mt-0.5">
                            Qty:{" "}
                            <span className="font-semibold text-brand-dark">{item.quantity}</span>
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-semibold text-brand-dark pt-1">
                        {formatPrice(
                          Number(item.price?.priceAmount || 0) * item.quantity,
                          item.price?.priceCurrency
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-neutral-100 pt-6 space-y-3 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Creations Subtotal</span>
                  <span className="font-semibold text-brand-dark">
                    {formatPrice(checkoutTotal, checkoutItems[0]?.price?.priceCurrency)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Atelier Courier Delivery</span>
                  <span className="text-emerald-700 font-bold uppercase text-[9px] tracking-wider">
                    Complimentary
                  </span>
                </div>
                <div className="h-[1px] w-full bg-neutral-100 my-1" />
                <div className="flex justify-between items-baseline pt-2">
                  <span className="text-gray-400 font-semibold uppercase tracking-wider text-[10px]">
                    Total Amount
                  </span>
                  <span className="text-xl font-serif font-bold text-brand-dark">
                    {formatPrice(checkoutTotal, checkoutItems[0]?.price?.priceCurrency)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Checkout;
