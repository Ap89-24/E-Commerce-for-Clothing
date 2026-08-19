import React from "react";

const LightboxModal = ({ isOpen, onClose, product, lightboxImageIdx, setLightboxImageIdx }) => {
  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex flex-col justify-between p-6 animate-fade-in select-none">
      {/* Header */}
      <div className="flex justify-between items-center text-white">
        <span className="text-[10px] tracking-[0.2em] font-light uppercase">
          {product.title} • Image {lightboxImageIdx + 1} of {product.images?.length || 1}
        </span>
        <button
          onClick={onClose}
          className="text-white hover:text-brand-accent p-2 text-3xl font-bold transition-colors cursor-pointer"
          aria-label="Close fullscreen gallery"
        >
          &times;
        </button>
      </div>

      {/* Active Image slider viewport */}
      <div className="flex-grow flex items-center justify-center relative my-4">
        {/* Previous arrow */}
        {product.images && product.images.length > 1 && (
          <button
            onClick={() =>
              setLightboxImageIdx((prev) => (prev === 0 ? product.images.length - 1 : prev - 1))
            }
            className="absolute left-2 p-3 text-white hover:text-brand-accent transition-colors bg-white/5 hover:bg-white/10 rounded-full cursor-pointer text-xl font-bold"
            aria-label="Previous image"
          >
            &#10216;
          </button>
        )}

        <img
          src={product.images[lightboxImageIdx]?.url}
          alt=""
          className="max-w-full max-h-[80vh] object-contain rounded-xl shadow-2xl animate-fade-in"
        />

        {/* Next arrow */}
        {product.images && product.images.length > 1 && (
          <button
            onClick={() =>
              setLightboxImageIdx((prev) => (prev === product.images.length - 1 ? 0 : prev + 1))
            }
            className="absolute right-2 p-3 text-white hover:text-brand-accent transition-colors bg-white/5 hover:bg-white/10 rounded-full cursor-pointer text-xl font-bold"
            aria-label="Next image"
          >
            &#10217;
          </button>
        )}
      </div>

      {/* Thumbnails row at bottom of Lightbox */}
      {product.images && product.images.length > 1 && (
        <div className="flex justify-center gap-3 overflow-x-auto no-scrollbar py-2">
          {product.images.map((img, index) => (
            <button
              key={index}
              onClick={() => setLightboxImageIdx(index)}
              className={`w-12 h-16 rounded-lg overflow-hidden border-2 transition-all duration-300 flex-shrink-0 ${
                index === lightboxImageIdx
                  ? "border-brand-accent scale-[1.03]"
                  : "border-neutral-800 hover:border-brand-accent/50"
              }`}
            >
              <img src={img.url} className="w-full h-full object-cover" alt="" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LightboxModal;
