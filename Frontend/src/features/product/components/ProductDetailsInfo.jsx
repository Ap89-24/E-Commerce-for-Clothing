import React from "react";

const ProductDetailsInfo = ({
  product,
  selectedColor,
  setSelectedColor,
  selectedSize,
  setSelectedSize,
  quantity,
  setQuantity,
  onAddToCart,
  onBuyNow,
  onOpenSizeGuide,
  formatPrice,
  APPAREL_COLORS,
  reviews,
  averageRating,
  availableColors,
  availableSizes,
  matchingVariant,
}) => {
  return (
    <div className="lg:col-span-5 flex flex-col justify-start">
      {/* Category Title Accent */}
      <span className="text-[10px] tracking-[0.3em] font-extrabold text-brand-accent uppercase mb-3 block">
        Atelier Exclusive Masterpiece
      </span>

      {/* Article Title */}
      <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl text-brand-dark font-light tracking-tight leading-tight mb-4">
        {product.title}
      </h1>

      {/* Rating / reviews link */}
      <div className="flex items-center gap-3.5 mb-6 text-xs">
        <div className="flex items-center text-amber-500">
          {[...Array(5)].map((_, i) => (
            <svg
              key={i}
              className={`w-4 h-4 fill-current ${
                i < Math.floor(averageRating) ? "text-amber-500" : "text-gray-200"
              }`}
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
          <span className="ml-1.5 font-semibold text-brand-dark">{averageRating}</span>
        </div>
        <span className="w-1.5 h-1.5 bg-gray-300 rounded-full" />
        <a
          href="#reviews-section"
          className="text-gray-400 hover:text-brand-accent transition-colors font-medium tracking-wide underline underline-offset-4"
        >
          {reviews.length} Verified Reviews
        </a>
      </div>

      <div className="h-[1px] w-full bg-neutral-100 mb-6" />

      {/* Pricing showcase */}
      <div className="mb-6 flex items-baseline gap-4">
        <span className="text-3xl font-serif text-brand-dark tracking-wide font-medium">
          {formatPrice(
            matchingVariant ? matchingVariant.price?.priceAmount : product.price?.priceAmount,
            matchingVariant ? matchingVariant.price?.priceCurrency : product.price?.priceCurrency
          )}
        </span>
        {matchingVariant ? (
          matchingVariant.stock > 0 ? (
            <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 border border-emerald-100 rounded-md px-2 py-0.5 tracking-wider uppercase">
              In Stock ({matchingVariant.stock} left)
            </span>
          ) : (
            <span className="text-[10px] text-red-700 font-semibold bg-red-50 border border-red-100 rounded-md px-2 py-0.5 tracking-wider uppercase animate-pulse">
              Out of Stock
            </span>
          )
        ) : (
          <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 border border-emerald-100 rounded-md px-2 py-0.5 tracking-wider uppercase">
            In Stock / Atelier Direct
          </span>
        )}
      </div>

      {/* Sizing guides description info */}
      <p className="text-gray-500 text-xs font-sans leading-relaxed mb-6">
        Hand-crafted limited edition. Created with pure natural yarn, featuring standard
        proportions, tailored comfort draping, and double-reinforced styling stitches.
      </p>

      {/* Interactive Option Selectors */}
      <div className="flex flex-col gap-6 mt-2">
        {/* Color swatches */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-[10px] uppercase font-bold tracking-widest text-brand-dark">
              Select Hue: <span className="text-brand-accent">{selectedColor?.name}</span>
            </span>
          </div>
          <div className="flex flex-wrap gap-2.5">
            {(availableColors || APPAREL_COLORS).map((colorObj) => (
              <button
                key={colorObj.name}
                onClick={() => setSelectedColor(colorObj)}
                className={`px-4 h-11 rounded-xl border text-[10px] font-bold tracking-wider transition-all select-none cursor-pointer flex items-center justify-center ${
                  selectedColor?.name === colorObj.name
                    ? "bg-brand-dark border-brand-dark text-white shadow-md shadow-brand-dark/15 scale-[1.02]"
                    : "bg-white border-neutral-200 text-gray-500 hover:border-brand-dark hover:text-brand-dark"
                }`}
              >
                {colorObj.name}
              </button>
            ))}
          </div>
        </div>

        {/* Sizing checkboxes */}
        {availableSizes && availableSizes.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[10px] uppercase font-bold tracking-widest text-brand-dark">
                Select Size: <span className="text-brand-accent">{selectedSize}</span>
              </span>
              <button
                onClick={onOpenSizeGuide}
                className="text-[10px] font-bold text-brand-accent uppercase tracking-widest hover:underline cursor-pointer"
              >
                Size Guide
              </button>
            </div>
            <div className="flex flex-wrap gap-2.5">
              {availableSizes.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`w-11 h-11 rounded-xl border text-[10px] font-bold tracking-wider transition-all select-none cursor-pointer flex items-center justify-center ${
                    selectedSize === size
                      ? "bg-brand-dark border-brand-dark text-white shadow-md shadow-brand-dark/15 scale-[1.02]"
                      : "bg-white border-neutral-200 text-gray-500 hover:border-brand-dark hover:text-brand-dark"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Quantity selectors */}
        <div>
          <span className="text-[10px] uppercase font-bold tracking-widest text-brand-dark block mb-2.5">
            Quantity
          </span>
          <div className="inline-flex items-center border border-neutral-200 bg-white rounded-xl h-11 overflow-hidden select-none">
            <button
              onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
              className="px-4.5 text-gray-400 hover:text-brand-dark transition-colors font-medium cursor-pointer"
              aria-label="Decrease quantity"
            >
              &minus;
            </button>
            <span className="w-10 text-center text-xs font-semibold text-brand-dark">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity((prev) => prev + 1)}
              className="px-4.5 text-gray-400 hover:text-brand-dark transition-colors font-medium cursor-pointer"
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* Actions buttons checkout triggers */}
      <div className="flex flex-col sm:flex-row gap-4 mt-8 w-full">
        <button
          onClick={onAddToCart}
          disabled={matchingVariant && matchingVariant.stock <= 0}
          className="flex-1 inline-flex items-center justify-center border border-brand-dark hover:border-brand-accent bg-transparent text-brand-dark hover:text-brand-accent disabled:opacity-40 disabled:pointer-events-none font-semibold h-13 rounded-xl transition-all duration-300 tracking-widest uppercase text-[10px] cursor-pointer shadow-sm hover:scale-[1.01]"
        >
          {matchingVariant && matchingVariant.stock <= 0 ? "Out of Stock" : "Add to Cart"}
        </button>
        <button
          onClick={onBuyNow}
          disabled={matchingVariant && matchingVariant.stock <= 0}
          className="flex-1 inline-flex items-center justify-center bg-brand-dark hover:bg-neutral-800 text-white disabled:opacity-40 disabled:pointer-events-none font-semibold h-13 rounded-xl transition-all duration-500 tracking-widest uppercase text-[10px] cursor-pointer shadow-lg shadow-black/10 hover:scale-[1.01]"
        >
          {matchingVariant && matchingVariant.stock <= 0 ? "Unavailable" : "Buy Now"}
        </button>
      </div>

      {/* Product Specification accordions/details info */}
      <div className="mt-10 border-t border-neutral-100 pt-8 flex flex-col gap-6">
        <div>
          <h4 className="text-[10px] font-bold uppercase tracking-widest text-brand-dark mb-2 font-sans">
            Composition & Care
          </h4>
          <p className="text-gray-400 text-xs font-sans leading-relaxed">{product.description}</p>
          <ul className="text-gray-400 text-[10px] mt-3 space-y-1.5 list-disc pl-4 font-sans tracking-wide">
            <li>Premium fibers woven for structural longevity.</li>
            <li>Dry clean only to maintain thread sheen.</li>
            <li>Delivered in protective signature VELNOX dust bag.</li>
          </ul>
        </div>

        <div>
          <h4 className="text-[10px] font-bold uppercase tracking-widest text-brand-dark mb-2 font-sans">
            Shipping & Returns
          </h4>
          <p className="text-gray-400 text-xs font-sans leading-relaxed">
            Enjoy complimentary standard courier service globally. Orders are dispatched from Mumbai
            atelier within 48 hours. Returns accepted on unused creations within 14 days of
            delivery.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsInfo;
