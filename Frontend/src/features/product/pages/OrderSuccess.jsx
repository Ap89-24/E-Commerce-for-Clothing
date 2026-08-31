import React, { useMemo } from "react";
import { useLocation, useNavigate, Link } from "react-router";

// Self-contained inline SVG icons
const CheckCircleIcon = ({ className = "w-6 h-6" }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth="2.5"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

const PackageIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
    />
  </svg>
);

const ArrowRightIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
  </svg>
);

const PrinterIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
    />
  </svg>
);

const ShieldCheckIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
    />
  </svg>
);

const ShoppingBagIcon = ({ className = "w-8 h-8" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
    />
  </svg>
);

const MapPinIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
    />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const CreditCardIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3 10h18M7 15h1m4 0h1m-7 4h12a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
    />
  </svg>
);

const CURRENCY_SYMBOLS = {
  INR: "₹",
  USD: "$",
  EUR: "€",
  GBP: "£",
  JPY: "¥",
};

const formatPrice = (amount, currency = "INR") => {
  const symbol = CURRENCY_SYMBOLS[currency] || "₹";
  const num = Number(amount);
  if (isNaN(num)) return `${symbol}0.00`;
  return `${symbol}${num.toLocaleString("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
};

export const OrderSuccess = () => {
  const location = useLocation();

  // Retrieve order details from navigation state or session storage fallback
  const orderDetails = useMemo(() => {
    if (location.state?.orderData) {
      return location.state.orderData;
    }
    const saved = sessionStorage.getItem("velnox_last_order");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed) return parsed;
      } catch (err) {
        console.error("Failed to parse saved session order:", err);
      }
    }
    return {
      orderId: `VNX-${Math.floor(100000 + Math.random() * 900000)}`,
      paymentId: `pay_${Math.random().toString(36).substring(2, 12)}`,
      shippingAddress: {
        fullName: "Valued Patron",
        address: "124 Atelier Plaza, Design District",
        city: "Mumbai",
        zipCode: "400001",
        contact: "+91 9876543210",
      },
      orderItems: [],
      totalAmount: 0,
      currency: "INR",
      paymentMethod: "Razorpay Online Payment",
      createdAt: new Date().toISOString(),
    };
  }, [location.state]);

  const {
    orderId,
    paymentId,
    shippingAddress,
    orderItems = [],
    totalAmount,
    currency = "INR",
    createdAt,
  } = orderDetails;

  const handlePrint = () => {
    window.print();
  };

  const formattedDate = useMemo(() => {
    return new Date(createdAt ? new Date(createdAt) : Date.now()).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }, [createdAt]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8 print:bg-white print:py-4 print:px-0">
      {/* HIGH QUALITY PRINT STYLES */}
      <style>{`
        @media print {
          body, html, #root {
            background: #ffffff !important;
            color: #0f172a !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .print-hide {
            display: none !important;
          }
          .print-border {
            border-color: #cbd5e1 !important;
          }
          .print-card {
            background-color: #ffffff !important;
            border: 1px solid #cbd5e1 !important;
            box-shadow: none !important;
            color: #0f172a !important;
            border-radius: 12px !important;
          }
          .print-text-dark {
            color: #0f172a !important;
          }
          .print-text-muted {
            color: #475569 !important;
          }
          .print-badge {
            background-color: #f1f5f9 !important;
            border: 1px solid #cbd5e1 !important;
            color: #0f172a !important;
          }
        }
      `}</style>

      <div className="max-w-4xl mx-auto space-y-8 print:space-y-6">
        {/* PRINT HEADER ONLY VISIBLE ON PRINT */}
        <div className="hidden print:flex items-center justify-between border-b border-slate-300 pb-4">
          <div>
            <h1 className="text-2xl font-black tracking-widest text-slate-900">VELNOX ATELIER</h1>
            <p className="text-xs text-slate-600 font-mono mt-0.5">
              Official Purchase Invoice & Receipt
            </p>
          </div>
          <div className="text-right text-xs text-slate-600 font-mono">
            <p>Date: {formattedDate}</p>
            <p>Order #{orderId}</p>
          </div>
        </div>

        {/* TOP CELEBRATION HEADER */}
        <div className="bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800/80 rounded-3xl p-8 sm:p-10 text-center shadow-2xl relative overflow-hidden print:bg-none print:bg-white print:border print:border-slate-300 print:shadow-none print:p-6 print:rounded-2xl">
          {/* Ambient Lighting background effect */}
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-fuchsia-600/20 blur-3xl rounded-full pointer-events-none print:hidden" />
          <div className="absolute top-1/2 right-0 w-64 h-64 bg-indigo-600/10 blur-3xl rounded-full pointer-events-none print:hidden" />

          {/* Animated Success Checkmark */}
          <div className="relative inline-flex items-center justify-center mb-6 print:mb-3">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-tr from-emerald-500 to-teal-400 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/20 print:bg-none print:bg-emerald-100 print:border print:border-emerald-500">
              <CheckCircleIcon className="w-8 h-8 sm:w-10 sm:h-10 text-slate-950 print:text-emerald-700" />
            </div>
          </div>

          <span className="inline-block uppercase tracking-widest text-xs font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-4 py-1.5 rounded-full mb-3 print:bg-emerald-50 print:border-emerald-300 print:text-emerald-800">
            Payment Verified & Order Confirmed
          </span>

          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight print:text-slate-900 print:text-2xl">
            Thank You For Your Order
          </h1>

          <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto mt-2 print:text-slate-700 print:text-xs">
            We have received your order{" "}
            <span className="font-mono font-bold text-white print:text-slate-900">#{orderId}</span>.
            A purchase receipt has been generated for your record.
          </p>

          <div className="mt-5 inline-flex flex-wrap items-center justify-center gap-3 text-xs sm:text-sm text-slate-300 bg-slate-950/60 border border-slate-800/80 rounded-2xl px-6 py-2.5 print:bg-slate-50 print:border-slate-300 print:text-slate-900">
            <div className="flex items-center gap-1.5">
              <ShieldCheckIcon className="w-4 h-4 text-emerald-400 print:text-emerald-700" />
              <span>
                Status:{" "}
                <strong className="text-emerald-400 font-semibold print:text-emerald-800">
                  PAID
                </strong>
              </span>
            </div>
            <span className="text-slate-700 print:text-slate-400">•</span>
            <div className="flex items-center gap-1.5">
              <CreditCardIcon className="w-4 h-4 text-indigo-400 print:text-indigo-700" />
              <span>
                Payment ID:{" "}
                <strong className="font-mono text-slate-200 print:text-slate-900">
                  {paymentId}
                </strong>
              </span>
            </div>
          </div>
        </div>

        {/* ORDER DETAILS GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 print:grid-cols-3 print:gap-6">
          {/* LEFT 2 COLUMNS: PURCHASED ITEMS */}
          <div className="lg:col-span-2 space-y-6 print:col-span-2">
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-md shadow-xl print:bg-white print:border-slate-300 print:shadow-none print:p-5 print:rounded-2xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6 print:border-slate-300 print:mb-4 print:pb-3">
                <h2 className="text-xl font-bold text-white flex items-center gap-2 print:text-slate-900 print:text-base">
                  <PackageIcon className="w-5 h-5 text-fuchsia-400 print:text-slate-800" />
                  Order Summary
                </h2>
                <span className="text-xs text-slate-400 print:text-slate-600 font-medium">
                  {orderItems.length} {orderItems.length === 1 ? "Item" : "Items"}
                </span>
              </div>

              <div className="divide-y divide-slate-800/60 print:divide-slate-200">
                {orderItems && orderItems.length > 0 ? (
                  orderItems.map((item, idx) => (
                    <div
                      key={idx}
                      className="py-4 first:pt-0 last:pb-0 flex items-center gap-4 print:py-3"
                    >
                      {item.image || item.images?.[0]?.url ? (
                        <img
                          src={item.image || item.images?.[0]?.url}
                          alt={item.title}
                          className="w-16 h-20 sm:w-20 sm:h-24 object-cover rounded-xl border border-slate-800 bg-slate-950 flex-shrink-0 print:w-14 print:h-16 print:border-slate-300 print:rounded-lg"
                        />
                      ) : (
                        <div className="w-16 h-20 sm:w-20 sm:h-24 rounded-xl border border-slate-800 bg-slate-950 flex items-center justify-center text-slate-600 flex-shrink-0 print:w-14 print:h-16 print:border-slate-300">
                          <ShoppingBagIcon className="w-8 h-8 print:w-6 print:h-6 print:text-slate-400" />
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm sm:text-base font-semibold text-white truncate print:text-slate-900 print:text-sm">
                          {item.title}
                        </h3>
                        <p className="text-xs text-slate-400 mt-1 print:text-slate-700">
                          Quantity:{" "}
                          <span className="font-semibold text-slate-200 print:text-slate-900">
                            {item.quantity}
                          </span>
                        </p>
                        {item.size || item.color ? (
                          <p className="text-xs text-slate-500 mt-0.5 print:text-slate-600">
                            {item.color && <span>Color: {item.color} </span>}
                            {item.size && <span>• Size: {item.size}</span>}
                          </p>
                        ) : null}
                      </div>

                      <div className="text-right">
                        <p className="text-sm sm:text-base font-bold text-emerald-400 print:text-slate-900 print:text-sm">
                          {formatPrice(
                            (item.price?.priceAmount || item.priceAmount || 0) *
                              (item.quantity || 1),
                            item.price?.priceCurrency || currency
                          )}
                        </p>
                        <p className="text-xs text-slate-500 print:text-slate-600">
                          {formatPrice(
                            item.price?.priceAmount || item.priceAmount || 0,
                            item.price?.priceCurrency || currency
                          )}{" "}
                          each
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-6 text-center text-slate-400 text-sm print:text-slate-700">
                    Items detailed in your order confirmation record.
                  </div>
                )}
              </div>

              {/* PAYMENT TOTAL BREAKDOWN */}
              <div className="mt-8 border-t border-slate-800 pt-6 space-y-2.5 text-sm print:mt-6 print:border-slate-300 print:pt-4">
                <div className="flex justify-between text-slate-400 print:text-slate-700">
                  <span>Subtotal</span>
                  <span className="text-slate-200 print:text-slate-900 font-semibold">
                    {formatPrice(totalAmount, currency)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-400 print:text-slate-700">
                  <span>Express Shipping</span>
                  <span className="text-emerald-400 font-medium print:text-emerald-700 print:font-semibold">
                    Complimentary
                  </span>
                </div>
                <div className="flex justify-between text-slate-400 print:text-slate-700">
                  <span>Taxes & Duties</span>
                  <span className="text-slate-200 print:text-slate-900 font-semibold">
                    Included
                  </span>
                </div>
                <div className="flex justify-between text-base sm:text-lg font-bold text-white pt-4 border-t border-slate-800/80 print:text-slate-900 print:border-slate-300 print:pt-3">
                  <span>Total Amount Paid</span>
                  <span className="text-emerald-400 print:text-slate-900 print:font-black">
                    {formatPrice(totalAmount, currency)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: SHIPPING ADDRESS & ACTIONS */}
          <div className="space-y-6 print:col-span-1 print:space-y-4">
            {/* SHIPPING ADDRESS CARD */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 backdrop-blur-md shadow-xl print:bg-white print:border-slate-300 print:shadow-none print:p-5 print:rounded-2xl">
              <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-4 mb-4 print:text-slate-900 print:text-base print:border-slate-300 print:pb-3 print:mb-3">
                <MapPinIcon className="w-5 h-5 text-indigo-400 print:text-slate-800" />
                Shipping Details
              </h2>
              <div className="space-y-2 text-sm text-slate-300 print:text-slate-800 print:text-xs">
                <p className="font-semibold text-white text-base print:text-slate-900 print:text-sm">
                  {shippingAddress?.fullName || "Valued Patron"}
                </p>
                <p className="text-slate-400 leading-relaxed print:text-slate-700">
                  {shippingAddress?.streetAddress || shippingAddress?.address || "Address Provided"}
                </p>
                <p className="text-slate-400 print:text-slate-700">
                  {shippingAddress?.city ? `${shippingAddress.city}, ` : ""}
                  {shippingAddress?.postalCode || shippingAddress?.zipCode || ""}
                </p>
                {shippingAddress?.mobileNumber || shippingAddress?.contact ? (
                  <p className="text-slate-400 pt-2 border-t border-slate-800/60 mt-2 text-xs print:text-slate-700 print:border-slate-200">
                    Contact:{" "}
                    <strong className="text-slate-200 font-mono print:text-slate-900">
                      {shippingAddress.mobileNumber || shippingAddress.contact}
                    </strong>
                  </p>
                ) : null}
              </div>
            </div>

            {/* ACTION BUTTONS (HIDDEN IN PRINT / PDF) */}
            <div className="space-y-3 print:hidden">
              <button
                onClick={handlePrint}
                className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 rounded-2xl py-3.5 px-6 font-semibold text-sm transition-all duration-200 shadow-md hover:border-slate-600 cursor-pointer"
              >
                <PrinterIcon className="w-4 h-4" />
                Print Order Receipt
              </button>

              <Link
                to="/"
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-fuchsia-600 to-indigo-600 hover:from-fuchsia-500 hover:to-indigo-500 text-white rounded-2xl py-4 px-6 font-bold text-sm transition-all duration-200 shadow-lg shadow-fuchsia-600/20 group"
              >
                <span>Continue Shopping</span>
                <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
