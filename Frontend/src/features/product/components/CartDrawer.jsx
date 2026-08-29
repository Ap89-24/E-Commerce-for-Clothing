const CartDrawer = ({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
  currentCartTotal,
  formatPrice,
  onAcceptPriceChange,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex overflow-hidden">
      {/* Backdrop blur overlay */}
      <div
        className="absolute inset-0 bg-neutral-950/40 backdrop-blur-sm transition-opacity animate-fade-in"
        onClick={onClose}
      />
      <div className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-2xl flex flex-col animate-fade-in md:border-l md:border-neutral-100">
        {/* Header */}
        <div className="px-6 py-6 border-b border-neutral-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <h3 className="font-serif text-lg tracking-tight text-brand-dark">
              Atelier Shopping Bag
            </h3>
            <span className="text-[10px] bg-brand-accent/10 text-brand-accent font-bold px-2 py-0.5 rounded-full">
              {cartItems.reduce((sum, item) => sum + item.quantity, 0)} Items
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-brand-dark p-2 text-xl font-bold cursor-pointer"
            aria-label="Close cart"
          >
            &times;
          </button>
        </div>

        {/* List */}
        <div className="flex-grow overflow-y-auto px-6 py-4 no-scrollbar">
          {cartItems.length === 0 ? (
            <div className="text-center py-20">
              <span className="text-3xl block mb-4">👜</span>
              <h4 className="text-xs font-semibold text-brand-dark uppercase tracking-widest mb-1.5">
                Your Shopping Bag is Empty
              </h4>
              <p className="text-[10px] text-gray-400 max-w-xs mx-auto mb-6">
                Curate your signature style from our latest organic silk and linen apparel
                collection.
              </p>
              <button
                onClick={onClose}
                className="inline-flex items-center justify-center bg-brand-dark hover:bg-neutral-800 text-white font-medium px-5 h-9 rounded-lg transition-all tracking-wider uppercase text-[9px] cursor-pointer"
              >
                Continue Cataloging
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {cartItems.map((item) => (
                <div
                  key={item.cartItemId}
                  className="flex items-start gap-4 p-3 bg-neutral-50 border border-neutral-100 rounded-2xl relative"
                >
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-16 h-20 rounded-xl object-cover border border-neutral-200/50"
                    />
                  ) : (
                    <div className="w-16 h-20 rounded-xl bg-neutral-100 border border-neutral-200 flex flex-col items-center justify-center text-gray-400 shrink-0">
                      <span className="text-[8px] uppercase tracking-widest font-bold text-center leading-tight">
                        No
                        <br />
                        Image
                      </span>
                    </div>
                  )}
                  <div className="flex-grow min-w-0 pr-4">
                    <h5 className="text-xs font-serif text-brand-dark truncate">{item.title}</h5>
                    <p className="text-[9px] text-gray-400 mt-1 uppercase tracking-wide">
                      Hue: <span className="text-brand-accent font-semibold">{item.color}</span>
                      {item.size && (
                        <>
                          {" • "}
                          Size: <span className="text-brand-accent font-semibold">{item.size}</span>
                        </>
                      )}
                    </p>
                    {item.hasPriceChanged && (
                      <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[9px] font-semibold animate-fade-in">
                        {item.priceChangeType === "decrease" ? (
                          <span className="text-emerald-700 bg-emerald-50/70 px-2 py-0.5 rounded border border-emerald-100">
                            ↓ Price dropped to{" "}
                            {formatPrice(item.newPrice?.priceAmount, item.newPrice?.priceCurrency)}{" "}
                            (was {formatPrice(item.price?.priceAmount, item.price?.priceCurrency)})
                          </span>
                        ) : (
                          <span className="text-amber-800 bg-amber-50/70 px-2 py-0.5 rounded border border-amber-100">
                            ↑ Price updated to{" "}
                            {formatPrice(item.newPrice?.priceAmount, item.newPrice?.priceCurrency)}{" "}
                            (was {formatPrice(item.price?.priceAmount, item.price?.priceCurrency)})
                          </span>
                        )}
                        <button
                          onClick={() => onAcceptPriceChange(item.cartItemId)}
                          className="bg-brand-dark hover:bg-neutral-800 text-white text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded transition-all cursor-pointer select-none"
                        >
                          Update
                        </button>
                      </div>
                    )}
                    <div className="flex items-center justify-between mt-3">
                      {/* Quantity control */}
                      <div className="inline-flex items-center border border-neutral-200 bg-white rounded-lg h-7 overflow-hidden">
                        <button
                          onClick={() => onUpdateQuantity(item.cartItemId, -1)}
                          className="px-2.5 text-gray-400 hover:text-brand-dark font-bold text-xs cursor-pointer"
                        >
                          &minus;
                        </button>
                        <span className="w-6 text-center text-[10px] font-semibold text-brand-dark">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(item.cartItemId, 1)}
                          className="px-2.5 text-gray-400 hover:text-brand-dark font-bold text-xs cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                      <span className="text-xs font-semibold text-brand-dark">
                        {formatPrice(
                          Number(item.price?.priceAmount) * item.quantity,
                          item.price?.priceCurrency
                        )}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => onRemoveItem(item.cartItemId)}
                    className="absolute top-2.5 right-2.5 text-gray-400 hover:text-red-500 font-bold text-base cursor-pointer px-1"
                    title="Remove item"
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Checkout summary */}
        {cartItems.length > 0 && (
          <div className="px-6 py-6 border-t border-neutral-100 bg-white flex flex-col gap-4">
            <div className="flex items-center justify-between text-xs text-brand-dark">
              <span className="text-gray-400 font-sans">Curated Items Valuation</span>
              <span className="font-semibold text-base font-serif">
                {formatPrice(currentCartTotal, cartItems[0]?.price?.priceCurrency)}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs text-brand-dark">
              <span className="text-gray-400 font-sans">Shipping & Signature Packaging</span>
              <span className="text-emerald-700 font-semibold uppercase text-[10px] tracking-wider">
                Complimentary
              </span>
            </div>
            {cartItems.some((item) => item.hasPriceChanged) && (
              <div className="bg-amber-50/60 border border-amber-200/50 rounded-xl p-3 text-[9px] text-amber-800 font-medium flex items-start gap-2 mb-1 animate-fade-in">
                <span className="text-xs">⚠️</span>
                <p className="leading-normal font-sans">
                  Some items in your bag have updated prices. Please update them to proceed.
                </p>
              </div>
            )}
            <div className="h-[1px] w-full bg-neutral-100 my-1" />
            <button
              onClick={onCheckout}
              className="w-full inline-flex items-center justify-center bg-brand-dark hover:bg-neutral-800 text-white font-medium h-12 rounded-xl transition-all duration-300 tracking-wider uppercase text-[10px] cursor-pointer"
            >
              Proceed to Checkout
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartDrawer;
