import React, { useState, useRef } from "react";

const ProductGallery = ({
  product,
  activeImageIdx,
  setActiveImageIdx,
  setLightboxOpen,
  setLightboxImageIdx,
}) => {
  const [zoomStyle, setZoomStyle] = useState({ display: "none" });
  const [isZooming, setIsZooming] = useState(false);
  const mainImageRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!mainImageRef.current) return;
    const { left, top, width, height } = mainImageRef.current.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomStyle({
      display: "block",
      backgroundPosition: `${x}% ${y}%`,
    });
  };

  return (
    <div className="lg:col-span-7 flex flex-col md:flex-row gap-5 items-start">
      {/* Small Portrait Thumbnails (shows next to main display on desktop, below on mobile) */}
      {product.images && product.images.length > 1 && (
        <div className="order-2 md:order-1 flex md:flex-col gap-3 w-full md:w-20 overflow-x-auto md:overflow-x-visible no-scrollbar py-1">
          {product.images.map((img, index) => (
            <button
              key={index}
              onClick={() => setActiveImageIdx(index)}
              className={`flex-shrink-0 w-16 h-20 md:w-20 md:h-24 rounded-xl overflow-hidden border-2 transition-all duration-300 relative ${
                index === activeImageIdx
                  ? "border-brand-accent scale-[1.02] shadow-sm"
                  : "border-neutral-100 hover:border-brand-accent/50"
              }`}
            >
              <img src={img.url} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* Main Portrait Showcase Container with magnifier */}
      <div className="order-1 md:order-2 flex-grow w-full relative aspect-[3/4] bg-neutral-50 rounded-2xl overflow-hidden border border-neutral-100/60 shadow-sm group">
        {product.images && product.images.length > 0 ? (
          <>
            <img
              ref={mainImageRef}
              src={product.images[activeImageIdx]?.url}
              alt={product.title}
              className="w-full h-full object-cover cursor-zoom-in transition-transform duration-300 group-hover:opacity-0"
              onClick={() => {
                setLightboxImageIdx(activeImageIdx);
                setLightboxOpen(true);
              }}
              onMouseMove={handleMouseMove}
              onMouseEnter={() => setIsZooming(true)}
              onMouseLeave={() => {
                setIsZooming(false);
                setZoomStyle({ display: "none" });
              }}
            />
            {/* High resolution desktop magnifier background layer */}
            <div
              className="absolute inset-0 pointer-events-none transition-opacity duration-300 bg-no-repeat cursor-zoom-in"
              style={{
                ...zoomStyle,
                backgroundImage: `url(${product.images[activeImageIdx]?.url})`,
                backgroundSize: "220%",
                opacity: isZooming ? 1 : 0,
              }}
            />
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs font-serif uppercase tracking-widest bg-neutral-100">
            No Image Available
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductGallery;
