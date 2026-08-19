import React from "react";

const SizeGuideModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
      <div
        className="absolute inset-0 bg-neutral-950/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      <div className="bg-white rounded-3xl border border-neutral-100 p-6 md:p-8 max-w-lg w-full shadow-2xl relative z-10 animate-fade-up">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-serif text-xl tracking-tight text-brand-dark">
            Atelier Size Dimensions
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-brand-dark text-2xl font-bold cursor-pointer"
            aria-label="Close size guide"
          >
            &times;
          </button>
        </div>

        <p className="text-gray-400 text-xs mb-6 font-sans leading-relaxed">
          * Sizes are calculated in inches. Measurements reflect clothing parameters when draped
          flat. Choose larger size if you prefer loose style fit.
        </p>

        {/* Sizing grid table */}
        <div className="border border-neutral-100 rounded-2xl overflow-hidden font-sans text-xs">
          <div className="grid grid-cols-4 bg-neutral-50 text-gray-500 font-bold uppercase tracking-widest text-[8px] p-3 text-center border-b border-neutral-100">
            <span>Size Label</span>
            <span>Chest</span>
            <span>Waist</span>
            <span>Length</span>
          </div>
          <div className="divide-y divide-neutral-100 text-center">
            {[
              { label: "XS", chest: '34"', waist: '28"', length: '27.5"' },
              { label: "S", chest: '36"', waist: '30"', length: '28"' },
              { label: "M", chest: '38"', waist: '32"', length: '28.5"' },
              { label: "L", chest: '40"', waist: '34"', length: '29"' },
              { label: "XL", chest: '42"', waist: '36"', length: '29.5"' },
              { label: "XXL", chest: '44"', waist: '38"', length: '30"' },
            ].map((row) => (
              <div key={row.label} className="grid grid-cols-4 p-3 text-brand-dark font-medium">
                <span className="font-bold text-brand-accent">{row.label}</span>
                <span>{row.chest}</span>
                <span>{row.waist}</span>
                <span>{row.length}</span>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-6 inline-flex items-center justify-center bg-brand-dark hover:bg-neutral-800 text-white font-medium h-11 rounded-xl transition-all tracking-wider uppercase text-[10px] cursor-pointer"
        >
          Understand & Close
        </button>
      </div>
    </div>
  );
};

export default SizeGuideModal;
