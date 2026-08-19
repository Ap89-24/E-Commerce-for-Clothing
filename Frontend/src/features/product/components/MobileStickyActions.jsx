import React from "react";

const MobileStickyActions = ({ product, onAddToCart, onBuyNow, formatPrice }) => {
  if (!product) return null;

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-neutral-100 px-6 py-4 z-40 flex items-center justify-between gap-4 shadow-xl select-none animate-fade-in">
      <div className="flex flex-col">
        <span className="text-[8px] text-gray-400 uppercase tracking-widest">
          Pricing valuation
        </span>
        <span className="text-base font-serif font-bold text-brand-dark truncate max-w-[120px]">
          {formatPrice(product.price?.priceAmount, product.price?.priceCurrency)}
        </span>
      </div>
      <div className="flex gap-2 flex-grow max-w-[240px]">
        <button
          onClick={onAddToCart}
          className="flex-1 inline-flex items-center justify-center border border-brand-dark bg-transparent text-brand-dark font-bold h-11 rounded-lg text-[9px] tracking-widest uppercase cursor-pointer"
        >
          Cart
        </button>
        <button
          onClick={onBuyNow}
          className="flex-1 inline-flex items-center justify-center bg-brand-dark text-white font-bold h-11 rounded-lg text-[9px] tracking-widest uppercase cursor-pointer"
        >
          Buy Now
        </button>
      </div>
    </div>
  );
};

export default MobileStickyActions;
