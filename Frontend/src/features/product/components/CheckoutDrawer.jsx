import React, { useMemo } from "react";

const CheckoutDrawer = ({
  isOpen,
  onClose,
  checkoutSuccess,
  checkoutItemsList,
  checkoutTotal,
  shippingForm,
  setShippingForm,
  cardDetails,
  setCardDetails,
  paymentMethod,
  setPaymentMethod,
  formErrors,
  isPlacingOrder,
  onSubmitOrder,
  formattedCardNumber,
  formatPrice,
}) => {
  if (!isOpen) return null;

  // Visual Reference ID for Receipt
  const receiptRefId = useMemo(() => {
    return `VNX-${Math.floor(100000 + Math.random() * 900000)}`;
  }, [checkoutSuccess]);

  return (
    <div className="fixed inset-0 z-50 flex overflow-hidden">
      {/* Backdrop blur overlay */}
      <div
        className="absolute inset-0 bg-neutral-950/40 backdrop-blur-sm transition-opacity animate-fade-in"
        onClick={onClose}
      />
      <div className="absolute right-0 top-0 bottom-0 w-full max-w-lg bg-white shadow-2xl flex flex-col animate-fade-in md:border-l md:border-neutral-100 overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-6 border-b border-neutral-100 flex items-center justify-between">
          <h3 className="font-serif text-lg tracking-tight text-brand-dark">
            Atelier Secure Checkout
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-brand-dark p-2 text-xl font-bold cursor-pointer"
            aria-label="Close checkout"
          >
            &times;
          </button>
        </div>

        {checkoutSuccess ? (
          /* Success Screen receipt info with beautiful Confetti */
          <div className="flex-grow flex flex-col items-center justify-center p-8 text-center animate-fade-up">
            {/* Visual SVG success card */}
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
              {/* Simulated confetti particles */}
              <div className="absolute top-0 left-0 w-24 h-24 animate-ping bg-emerald-500/10 rounded-full" />
            </div>

            <h3 className="font-serif text-2xl font-light text-brand-dark mb-3">
              Atelier Purchase Completed
            </h3>
            <p className="text-gray-400 text-xs max-w-sm mx-auto mb-8 leading-relaxed">
              Thank you for shopping at VELNOX. Your order has been registered at our Mumbai studio.
              A confirmation invoice summary has been dispatched.
            </p>

            {/* Receipt Card Mockup */}
            <div className="w-full bg-neutral-50 border border-neutral-100 rounded-3xl p-6 mb-8 text-left text-xs font-sans max-w-md mx-auto">
              <span className="text-[8px] uppercase tracking-widest text-brand-accent font-extrabold mb-3 block">
                Receipt Invoice Voucher
              </span>
              <div className="space-y-3.5">
                <div className="flex justify-between">
                  <span className="text-gray-400">Order Reference ID</span>
                  <span className="font-mono text-brand-dark font-semibold">{receiptRefId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Delivery Address</span>
                  <span className="text-brand-dark text-right truncate max-w-[200px] font-medium">
                    {shippingForm.fullName}, {shippingForm.city}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Items Count</span>
                  <span className="font-medium text-brand-dark">
                    {checkoutItemsList.reduce((sum, item) => sum + item.quantity, 0)} Apparel
                  </span>
                </div>
                <div className="h-[1px] w-full bg-neutral-200" />
                <div className="flex justify-between items-baseline pt-1">
                  <span className="text-gray-400 font-bold">Total Amount Settled</span>
                  <span className="text-base font-serif font-bold text-brand-dark">
                    {formatPrice(checkoutTotal, checkoutItemsList[0]?.price?.priceCurrency)}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full max-w-xs inline-flex items-center justify-center bg-brand-dark hover:bg-neutral-800 text-white font-medium h-12 rounded-xl transition-all duration-300 tracking-wider uppercase text-[10px] cursor-pointer"
            >
              Continue Browsing
            </button>
          </div>
        ) : (
          /* Checkout Form */
          <div className="flex-grow p-6">
            <form onSubmit={onSubmitOrder} className="flex flex-col gap-6" noValidate>
              {/* Order Items Summary box */}
              <div className="bg-neutral-50 border border-neutral-100 rounded-3xl p-5">
                <span className="text-[8px] uppercase tracking-widest text-brand-accent font-extrabold mb-3 block">
                  Purchasing Creations Recap
                </span>
                <div className="flex flex-col gap-3">
                  {checkoutItemsList.map((item) => (
                    <div
                      key={item.cartItemId}
                      className="flex items-center gap-3.5 justify-between"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <img
                          src={item.image}
                          className="w-8 h-10 object-cover rounded-md border border-neutral-200"
                          alt=""
                        />
                        <div className="min-w-0">
                          <h5 className="text-[11px] font-medium text-brand-dark truncate max-w-[180px]">
                            {item.title}
                          </h5>
                          <span className="text-[9px] text-gray-400">
                            Qty: {item.quantity} • Size: {item.size} • Color: {item.color}
                          </span>
                        </div>
                      </div>
                      <span className="text-[11px] font-semibold text-brand-dark flex-shrink-0">
                        {formatPrice(
                          Number(item.price?.priceAmount) * item.quantity,
                          item.price?.priceCurrency
                        )}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="h-[1px] bg-neutral-200 my-4" />
                <div className="flex items-baseline justify-between">
                  <span className="text-[10px] text-gray-400 uppercase font-semibold">
                    Aggregate Settlement Value
                  </span>
                  <span className="text-base font-serif font-bold text-brand-dark">
                    {formatPrice(checkoutTotal, checkoutItemsList[0]?.price?.priceCurrency)}
                  </span>
                </div>
              </div>

              {/* Section: Shipping Address */}
              <div>
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-brand-dark mb-4 border-b border-neutral-50 pb-1">
                  1. Delivery Address Information
                </h4>
                <div className="flex flex-col gap-4">
                  {/* Name input */}
                  <div>
                    <label
                      htmlFor="shipName"
                      className="text-gray-400 text-[9px] uppercase tracking-wider block mb-1"
                    >
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="shipName"
                      placeholder="e.g. Aditi Sharma"
                      value={shippingForm.fullName}
                      onChange={(e) =>
                        setShippingForm({
                          ...shippingForm,
                          fullName: e.target.value,
                        })
                      }
                      className={`w-full bg-white border text-xs rounded-xl h-11 px-4 outline-none transition-all placeholder-gray-400 text-brand-dark ${
                        formErrors.fullName
                          ? "border-red-500 focus:ring-red-100"
                          : "border-neutral-200 focus:border-brand-accent focus:ring-brand-accent/25"
                      }`}
                    />
                    {formErrors.fullName && (
                      <p className="text-red-500 text-[10px] mt-1">{formErrors.fullName}</p>
                    )}
                  </div>

                  {/* Address */}
                  <div>
                    <label
                      htmlFor="shipAddress"
                      className="text-gray-400 text-[9px] uppercase tracking-wider block mb-1"
                    >
                      Street Address
                    </label>
                    <input
                      type="text"
                      id="shipAddress"
                      placeholder="Studio Apt, Building, Street details..."
                      value={shippingForm.address}
                      onChange={(e) =>
                        setShippingForm({
                          ...shippingForm,
                          address: e.target.value,
                        })
                      }
                      className={`w-full bg-white border text-xs rounded-xl h-11 px-4 outline-none transition-all placeholder-gray-400 text-brand-dark ${
                        formErrors.address
                          ? "border-red-500"
                          : "border-neutral-200 focus:border-brand-accent"
                      }`}
                    />
                    {formErrors.address && (
                      <p className="text-red-500 text-[10px] mt-1">{formErrors.address}</p>
                    )}
                  </div>

                  {/* City & ZIP row */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="shipCity"
                        className="text-gray-400 text-[9px] uppercase tracking-wider block mb-1"
                      >
                        City
                      </label>
                      <input
                        type="text"
                        id="shipCity"
                        placeholder="Mumbai"
                        value={shippingForm.city}
                        onChange={(e) =>
                          setShippingForm({
                            ...shippingForm,
                            city: e.target.value,
                          })
                        }
                        className={`w-full bg-white border text-xs rounded-xl h-11 px-4 outline-none transition-all placeholder-gray-400 text-brand-dark ${
                          formErrors.city
                            ? "border-red-500"
                            : "border-neutral-200 focus:border-brand-accent"
                        }`}
                      />
                      {formErrors.city && (
                        <p className="text-red-500 text-[10px] mt-1">{formErrors.city}</p>
                      )}
                    </div>
                    <div>
                      <label
                        htmlFor="shipZip"
                        className="text-gray-400 text-[9px] uppercase tracking-wider block mb-1"
                      >
                        ZIP / Postal Code
                      </label>
                      <input
                        type="text"
                        id="shipZip"
                        placeholder="400001"
                        value={shippingForm.zipCode}
                        onChange={(e) =>
                          setShippingForm({
                            ...shippingForm,
                            zipCode: e.target.value,
                          })
                        }
                        className={`w-full bg-white border text-xs rounded-xl h-11 px-4 outline-none transition-all placeholder-gray-400 text-brand-dark ${
                          formErrors.zipCode
                            ? "border-red-500"
                            : "border-neutral-200 focus:border-brand-accent"
                        }`}
                      />
                      {formErrors.zipCode && (
                        <p className="text-red-500 text-[10px] mt-1">{formErrors.zipCode}</p>
                      )}
                    </div>
                  </div>

                  {/* Contact phone */}
                  <div>
                    <label
                      htmlFor="shipContact"
                      className="text-gray-400 text-[9px] uppercase tracking-wider block mb-1"
                    >
                      Mobile Number
                    </label>
                    <input
                      type="tel"
                      id="shipContact"
                      placeholder="e.g. 9876543210"
                      value={shippingForm.contact}
                      onChange={(e) =>
                        setShippingForm({
                          ...shippingForm,
                          contact: e.target.value,
                        })
                      }
                      className={`w-full bg-white border text-xs rounded-xl h-11 px-4 outline-none transition-all placeholder-gray-400 text-brand-dark ${
                        formErrors.contact
                          ? "border-red-500"
                          : "border-neutral-200 focus:border-brand-accent"
                      }`}
                    />
                    {formErrors.contact && (
                      <p className="text-red-500 text-[10px] mt-1">{formErrors.contact}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Section: Payment Method */}
              <div>
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-brand-dark mb-4 border-b border-neutral-50 pb-1">
                  2. Payment Processing
                </h4>

                {/* Payment methods selectors */}
                <div className="grid grid-cols-3 gap-2.5 mb-6">
                  {["card", "upi", "banking"].map((pm) => (
                    <button
                      key={pm}
                      type="button"
                      onClick={() => setPaymentMethod(pm)}
                      className={`h-11 rounded-xl border text-[10px] font-bold tracking-wider transition-all select-none cursor-pointer flex items-center justify-center ${
                        paymentMethod === pm
                          ? "bg-brand-dark border-brand-dark text-white shadow"
                          : "bg-white border-neutral-200 text-gray-500 hover:text-brand-dark hover:border-brand-dark"
                      }`}
                    >
                      {pm === "card" ? "Credit Card" : pm === "upi" ? "UPI Apps" : "Net Banking"}
                    </button>
                  ))}
                </div>

                {/* Credit Card dynamic display */}
                {paymentMethod === "card" && (
                  <div className="flex flex-col gap-4">
                    {/* Interactive Gold/Dark visual card */}
                    <div className="relative aspect-[16/9] w-full max-w-sm rounded-3xl p-6 bg-gradient-to-br from-neutral-900 via-neutral-950 to-neutral-800 text-white shadow-xl mx-auto flex flex-col justify-between overflow-hidden">
                      {/* Card chip and design */}
                      <div className="flex justify-between items-start">
                        <div className="w-10 h-7.5 rounded bg-gradient-to-r from-yellow-300 to-yellow-500 opacity-80" />
                        <span className="font-serif italic text-xs tracking-widest text-brand-accent">
                          VELNOX
                        </span>
                      </div>

                      {/* Card number display */}
                      <div className="text-lg md:text-xl font-mono tracking-widest text-center select-none py-1">
                        {formattedCardNumber}
                      </div>

                      <div className="flex justify-between items-end">
                        <div>
                          <span className="text-[6px] uppercase tracking-wider text-gray-400 block mb-0.5">
                            Cardholder
                          </span>
                          <span className="text-[10px] font-semibold uppercase tracking-wider truncate max-w-[160px] block">
                            {cardDetails.name || "A. Sharma"}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-[6px] uppercase tracking-wider text-gray-400 block mb-0.5">
                            Expiry
                          </span>
                          <span className="text-[10px] font-semibold font-mono">
                            {cardDetails.expiry || "MM/YY"}
                          </span>
                        </div>
                      </div>
                      {/* Decorative gold vector */}
                      <div className="absolute top-1/2 left-2/3 w-36 h-36 border border-brand-accent/15 rounded-full pointer-events-none -z-0" />
                    </div>

                    {/* Card input forms */}
                    <div className="flex flex-col gap-4.5 mt-3">
                      {/* Cardholder name */}
                      <div>
                        <label
                          htmlFor="cardName"
                          className="text-gray-400 text-[9px] uppercase tracking-wider block mb-1"
                        >
                          Cardholder Name
                        </label>
                        <input
                          type="text"
                          id="cardName"
                          placeholder="Name on card"
                          value={cardDetails.name}
                          onChange={(e) =>
                            setCardDetails({
                              ...cardDetails,
                              name: e.target.value,
                            })
                          }
                          className={`w-full bg-white border text-xs rounded-xl h-11 px-4 outline-none transition-all placeholder-gray-400 text-brand-dark ${
                            formErrors.cardName
                              ? "border-red-500"
                              : "border-neutral-200 focus:border-brand-accent"
                          }`}
                        />
                        {formErrors.cardName && (
                          <p className="text-red-500 text-[10px] mt-1">{formErrors.cardName}</p>
                        )}
                      </div>

                      {/* Card number */}
                      <div>
                        <label
                          htmlFor="cardNumber"
                          className="text-gray-400 text-[9px] uppercase tracking-wider block mb-1"
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
                              ? "border-red-500"
                              : "border-neutral-200 focus:border-brand-accent"
                          }`}
                        />
                        {formErrors.cardNumber && (
                          <p className="text-red-500 text-[10px] mt-1">{formErrors.cardNumber}</p>
                        )}
                      </div>

                      {/* Exp & CVV */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label
                            htmlFor="cardExpiry"
                            className="text-gray-400 text-[9px] uppercase tracking-wider block mb-1"
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
                                ? "border-red-500"
                                : "border-neutral-200 focus:border-brand-accent"
                            }`}
                          />
                          {formErrors.cardExpiry && (
                            <p className="text-red-500 text-[10px] mt-1">{formErrors.cardExpiry}</p>
                          )}
                        </div>
                        <div>
                          <label
                            htmlFor="cardCvv"
                            className="text-gray-400 text-[9px] uppercase tracking-wider block mb-1"
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
                                ? "border-red-500"
                                : "border-neutral-200 focus:border-brand-accent"
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
                  <div className="bg-neutral-50 p-4 border border-neutral-100 rounded-2xl flex flex-col gap-3">
                    <p className="text-[10px] text-gray-400 leading-relaxed font-sans">
                      Select your preferred UPI app. On clicking place order, a payment collect
                      request notification will be broadcast.
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-center text-[10px] font-semibold text-brand-dark">
                      <span className="p-3 border border-neutral-200 bg-white rounded-xl cursor-pointer hover:border-brand-accent">
                        Google Pay
                      </span>
                      <span className="p-3 border border-neutral-200 bg-white rounded-xl cursor-pointer hover:border-brand-accent">
                        PhonePe
                      </span>
                    </div>
                  </div>
                )}

                {paymentMethod === "banking" && (
                  <div className="bg-neutral-50 p-4 border border-neutral-100 rounded-2xl flex flex-col gap-3">
                    <label
                      htmlFor="bankingSelect"
                      className="text-gray-400 text-[9px] uppercase tracking-wider block mb-1"
                    >
                      Choose Major Bank
                    </label>
                    <select
                      id="bankingSelect"
                      className="w-full bg-white border border-neutral-200 text-xs rounded-xl h-11 px-3 outline-none cursor-pointer"
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
                className="w-full flex items-center justify-center bg-brand-dark hover:bg-neutral-800 disabled:bg-neutral-400 text-white font-medium h-12 rounded-xl transition-all duration-300 tracking-wider uppercase text-[10px] cursor-pointer"
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
                  `Settle & Order ${formatPrice(
                    checkoutTotal,
                    checkoutItemsList[0]?.price?.priceCurrency
                  )}`
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckoutDrawer;
