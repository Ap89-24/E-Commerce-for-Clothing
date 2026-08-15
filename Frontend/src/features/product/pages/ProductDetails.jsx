import { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router";
import { useSelector } from "react-redux";
import { useSellerProduct } from "../hooks/useSellerProduct";

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
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { handleGetProductById, handleUpdateProduct } = useSellerProduct();
  const { user } = useSelector((state) => state.auth);
  const { loading: updateLoading } = useSelector((state) => state.product);

  const fileInputRef = useRef(null);

  const [product, setProduct] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(true);
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  const [loaderVisible, setLoaderVisible] = useState(true);
  const [loaderFadeOut, setLoaderFadeOut] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [toast, setToast] = useState(null);

  // Edit Mode States
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    priceAmount: "",
    priceCurrency: "INR",
  });
  const [remainingImages, setRemainingImages] = useState([]);
  const [newFiles, setNewFiles] = useState([]);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    const fetchProduct = async () => {
      setLoadingDetails(true);
      const result = await handleGetProductById(id);
      if (result && result.success) {
        setProduct(result.product);
        setErrorMsg("");
      } else {
        setErrorMsg(result?.error || "Failed to load product details.");
      }
      setLoadingDetails(false);
    };
    if (id) {
      fetchProduct();
    }
  }, [id, handleGetProductById]);

  // Handle entry loader fading transitions synchronized with loading details
  useEffect(() => {
    if (!loadingDetails) {
      setLoaderFadeOut(true);
      const timer = setTimeout(() => {
        setLoaderVisible(false);
      }, 700);
      return () => clearTimeout(timer);
    } else {
      setLoaderVisible(true);
      setLoaderFadeOut(false);
    }
  }, [loadingDetails]);

  const handleStartEdit = () => {
    if (!product) return;
    setEditForm({
      title: product.title,
      description: product.description,
      priceAmount: product.price?.priceAmount || "",
      priceCurrency: product.price?.priceCurrency || "INR",
    });
    setRemainingImages(product.images || []);
    setNewFiles([]);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    // Revoke local object URLs to prevent memory leaks
    newFiles.forEach((fileObj) => URL.revokeObjectURL(fileObj.previewUrl));
    setIsEditing(false);
  };

  const handleRemoveRemainingImage = (index) => {
    setRemainingImages((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleAddImageFiles = (e) => {
    const files = Array.from(e.target.files);
    const totalCurrentCount = remainingImages.length + newFiles.length;
    if (totalCurrentCount + files.length > 8) {
      showToast("error", "A maximum of 8 images are allowed per product.");
      return;
    }

    const validFiles = [];
    for (const file of files) {
      if (file.size > 5 * 1024 * 1024) {
        showToast("error", `File ${file.name} is too large. Max limit is 5MB.`);
        continue;
      }
      validFiles.push({
        file,
        previewUrl: URL.createObjectURL(file),
      });
    }

    setNewFiles((prev) => [...prev, ...validFiles]);
  };

  const handleRemoveNewFile = (index) => {
    setNewFiles((prev) => {
      const target = prev[index];
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((_, idx) => idx !== index);
    });
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editForm.title.trim() || !editForm.description.trim() || !editForm.priceAmount) {
      showToast("error", "All fields are required.");
      return;
    }

    const totalCount = remainingImages.length + newFiles.length;
    if (totalCount === 0) {
      showToast("error", "At least one product image is required.");
      return;
    }

    const formData = new FormData();
    formData.append("title", editForm.title.trim());
    formData.append("description", editForm.description.trim());
    formData.append("priceAmount", editForm.priceAmount);
    formData.append("priceCurrency", editForm.priceCurrency);
    formData.append("remainingImages", JSON.stringify(remainingImages));

    newFiles.forEach((fileObj) => {
      formData.append("images", fileObj.file);
    });

    const result = await handleUpdateProduct(id, formData);
    if (result && result.success) {
      setProduct(result.product);
      newFiles.forEach((fileObj) => URL.revokeObjectURL(fileObj.previewUrl));
      setNewFiles([]);
      setIsEditing(false);
      setActiveImageIdx(0);
      showToast("success", "Product updated successfully!");
    } else {
      showToast("error", result?.error || "Failed to update product.");
    }
  };

  const isOwner =
    product &&
    user &&
    (product.seller === user._id ||
      product.seller === user.id ||
      product.seller?._id === user._id ||
      product.seller?._id === user.id);

  return (
    <div className="relative min-h-screen bg-brand-light flex flex-col font-sans selection:bg-brand-accent selection:text-white">
      {/* Toast Alert */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-6 py-4 rounded-xl shadow-xl border animate-fade-in transition-all duration-300 ${
            toast.type === "success"
              ? "bg-white border-emerald-100 text-emerald-800"
              : "bg-white border-red-100 text-red-800"
          }`}
        >
          <div
            className={`w-2 h-2 rounded-full ${toast.type === "success" ? "bg-emerald-500" : "bg-red-500"}`}
          />
          <span className="text-xs font-semibold uppercase tracking-wider">{toast.message}</span>
        </div>
      )}

      {/* Velnox Brand Entry Shimmer Loader */}
      {loaderVisible && (
        <div
          className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-brand-dark transition-opacity duration-700 ease-in-out select-none ${
            loaderFadeOut ? "opacity-0 pointer-events-none" : "opacity-100"
          }`}
        >
          <div className="text-center animate-fade-up">
            <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl tracking-[0.3em] text-white font-light mb-6 transition-all duration-1000 transform hover:scale-[1.01]">
              VELNOX
            </h1>
            <div className="h-[1px] w-24 bg-brand-accent mx-auto animate-pulse" />
            <span className="text-[10px] tracking-[0.4em] font-semibold text-brand-accent uppercase mt-4 block animate-fade-in">
              Product Details
            </span>
          </div>
        </div>
      )}

      {/* Navigation Top Bar */}
      <header className="border-b border-neutral-100 bg-white sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link
            to="/"
            className="font-serif text-2xl tracking-[0.2em] text-brand-dark hover:text-brand-accent transition-colors"
          >
            VELNOX
          </Link>
          <Link
            to="/seller-products"
            className="inline-flex items-center justify-center bg-brand-dark hover:bg-neutral-800 text-white font-medium px-6 h-11 rounded-lg transition-all duration-300 tracking-wider uppercase text-[10px] border border-transparent"
          >
            Atelier Gallery
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow max-w-6xl mx-auto px-6 py-12 md:py-16 w-full flex flex-col">
        {/* Back navigation button */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-400 hover:text-brand-dark transition-colors mb-8 self-start group cursor-pointer"
        >
          <svg
            className="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to creations
        </button>

        {/* Product Details Wrapper */}
        {!loaderVisible && (
          <div className="flex-grow animate-fade-in">
            {errorMsg ? (
              // Error State Display
              <div className="max-w-lg mx-auto text-center py-20 px-6 bg-white border border-neutral-100 rounded-2xl shadow-sm animate-fade-up">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-50 text-red-500 mb-6">
                  <svg
                    className="w-8 h-8"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
                    />
                  </svg>
                </div>
                <h3 className="font-serif text-2xl font-medium tracking-tight text-brand-dark mb-3">
                  Atelier Article Error
                </h3>
                <p className="text-gray-400 text-sm mb-8 leading-relaxed">{errorMsg}</p>
                <Link
                  to="/seller-products"
                  className="inline-flex items-center justify-center bg-brand-dark hover:bg-neutral-800 text-white font-medium px-8 h-12 rounded-xl transition-all duration-300 tracking-wider uppercase text-xs shadow-md"
                >
                  Return to Catalog
                </Link>
              </div>
            ) : (
              product && (
                // Split view product showcase
                <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-start">
                  {/* Left Column: Image Showcase / Image Editor */}
                  <div className="w-full lg:w-1/2 flex flex-col gap-6">
                    {isEditing ? (
                      // Image Editor UI in Edit Mode
                      <div className="bg-white border border-neutral-100 rounded-2xl p-6 shadow-sm animate-fade-in w-full">
                        <span className="text-[10px] tracking-wider uppercase font-semibold text-brand-accent block mb-4">
                          Curate Product Gallery
                        </span>

                        <div className="grid grid-cols-3 gap-4 mb-6">
                          {/* Remaining images list */}
                          {remainingImages.map((img, idx) => (
                            <div
                              key={`remaining-${idx}`}
                              className="relative aspect-square rounded-xl overflow-hidden border border-neutral-100"
                            >
                              <img src={img.url} className="w-full h-full object-cover" alt="" />
                              <button
                                type="button"
                                onClick={() => handleRemoveRemainingImage(idx)}
                                className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-neutral-900/80 hover:bg-neutral-900 text-white flex items-center justify-center text-xs shadow transition-all hover:scale-105"
                              >
                                &times;
                              </button>
                            </div>
                          ))}

                          {/* New files list */}
                          {newFiles.map((fileObj, idx) => (
                            <div
                              key={`new-${idx}`}
                              className="relative aspect-square rounded-xl overflow-hidden border border-brand-accent/20"
                            >
                              <img
                                src={fileObj.previewUrl}
                                className="w-full h-full object-cover"
                                alt=""
                              />
                              <button
                                type="button"
                                onClick={() => handleRemoveNewFile(idx)}
                                className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-neutral-900/80 hover:bg-neutral-900 text-white flex items-center justify-center text-xs shadow transition-all hover:scale-105"
                              >
                                &times;
                              </button>
                            </div>
                          ))}

                          {/* Upload Trigger card if under 8 */}
                          {remainingImages.length + newFiles.length < 8 && (
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              className="aspect-square rounded-xl border border-dashed border-neutral-200 hover:border-brand-accent hover:bg-brand-accent/5 flex flex-col items-center justify-center gap-2 text-neutral-400 hover:text-brand-accent transition-all duration-300"
                            >
                              <svg
                                className="w-6 h-6"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth="1.5"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M12 4v16m8-8H4"
                                />
                              </svg>
                              <span className="text-[10px] tracking-wider uppercase font-medium">
                                Add Photo
                              </span>
                            </button>
                          )}
                        </div>

                        <input
                          ref={fileInputRef}
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleAddImageFiles}
                          className="hidden"
                        />

                        <p className="text-[10px] text-gray-400 leading-relaxed font-sans">
                          * Retain up to 8 portrait frames (max 5MB per file). Click &times; to
                          delete frames from curation.
                        </p>
                      </div>
                    ) : (
                      // Standard Display View for Images
                      <>
                        {/* Main Active Portrait View Container */}
                        <div className="relative aspect-[3/4] overflow-hidden bg-neutral-50 rounded-2xl border border-neutral-100/50 shadow-sm">
                          {product.images && product.images.length > 0 ? (
                            <img
                              src={product.images[activeImageIdx]?.url}
                              alt={product.title}
                              className="w-full h-full object-cover transition-all duration-500"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-neutral-400 bg-neutral-200">
                              No Image Available
                            </div>
                          )}
                        </div>

                        {/* Small Thumbnails Carousel Grid */}
                        {product.images && product.images.length > 1 && (
                          <div className="grid grid-cols-4 gap-4">
                            {product.images.map((img, index) => (
                              <button
                                key={index}
                                onClick={() => setActiveImageIdx(index)}
                                className={`aspect-square rounded-xl overflow-hidden border-2 transition-all duration-300 relative ${
                                  index === activeImageIdx
                                    ? "border-brand-accent scale-[1.02] shadow-sm"
                                    : "border-neutral-100 hover:border-brand-accent/40"
                                }`}
                              >
                                <img
                                  src={img.url}
                                  alt={`${product.title} thumbnail ${index + 1}`}
                                  className="w-full h-full object-cover"
                                />
                                {index !== activeImageIdx && (
                                  <div className="absolute inset-0 bg-white/20 hover:bg-transparent transition-colors duration-200" />
                                )}
                              </button>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {/* Right Column: Details / Edit Form */}
                  <div className="w-full lg:w-1/2 animate-fade-up">
                    {isEditing ? (
                      // Edit Mode Form Area
                      <form
                        onSubmit={handleSaveEdit}
                        className="bg-white border border-neutral-100 rounded-2xl p-6 sm:p-8 shadow-sm"
                      >
                        <span className="text-[10px] tracking-[0.3em] font-bold text-brand-accent uppercase mb-4 block">
                          Edit curation details
                        </span>

                        {/* Edit Title */}
                        <div className="mb-6">
                          <label className="text-gray-400 text-[10px] uppercase tracking-wider block mb-1">
                            Article Title
                          </label>
                          <input
                            type="text"
                            required
                            value={editForm.title}
                            onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                            className="w-full bg-transparent border-b border-neutral-200 focus:border-brand-accent py-2 outline-none font-serif text-2xl text-brand-dark transition-colors"
                          />
                        </div>

                        {/* Edit Price amount & currency */}
                        <div className="grid grid-cols-3 gap-6 mb-6">
                          <div className="col-span-2">
                            <label className="text-gray-400 text-[10px] uppercase tracking-wider block mb-1">
                              Price Amount
                            </label>
                            <input
                              type="number"
                              required
                              min="0"
                              step="0.01"
                              value={editForm.priceAmount}
                              onChange={(e) =>
                                setEditForm({ ...editForm, priceAmount: e.target.value })
                              }
                              className="w-full bg-transparent border-b border-neutral-200 focus:border-brand-accent py-2 outline-none font-sans text-lg text-brand-dark transition-colors"
                            />
                          </div>
                          <div>
                            <label className="text-gray-400 text-[10px] uppercase tracking-wider block mb-1">
                              Currency
                            </label>
                            <select
                              value={editForm.priceCurrency}
                              onChange={(e) =>
                                setEditForm({ ...editForm, priceCurrency: e.target.value })
                              }
                              className="w-full bg-transparent border-b border-neutral-200 focus:border-brand-accent py-2 outline-none font-sans text-sm text-brand-dark cursor-pointer transition-colors"
                            >
                              {Object.keys(CURRENCY_SYMBOLS).map((curr) => (
                                <option key={curr} value={curr}>
                                  {curr} ({CURRENCY_SYMBOLS[curr]})
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {/* Edit Description */}
                        <div className="mb-8">
                          <label className="text-gray-400 text-[10px] uppercase tracking-wider block mb-2">
                            Description & Composition
                          </label>
                          <textarea
                            required
                            rows={5}
                            value={editForm.description}
                            onChange={(e) =>
                              setEditForm({ ...editForm, description: e.target.value })
                            }
                            className="w-full bg-transparent border border-neutral-200 focus:border-brand-accent p-4 rounded-xl outline-none font-sans text-sm text-brand-dark leading-relaxed resize-none transition-colors"
                          />
                        </div>

                        {/* Edit Form Actions */}
                        <div className="flex gap-4">
                          <button
                            type="submit"
                            disabled={updateLoading}
                            className="flex-1 inline-flex items-center justify-center bg-brand-dark hover:bg-neutral-800 text-white font-medium h-12 rounded-xl transition-all duration-300 tracking-wider uppercase text-[10px] disabled:opacity-50 cursor-pointer"
                          >
                            {updateLoading ? "Saving Curation..." : "Save Curation"}
                          </button>
                          <button
                            type="button"
                            onClick={handleCancelEdit}
                            disabled={updateLoading}
                            className="flex-1 inline-flex items-center justify-center border border-neutral-200 hover:border-brand-dark text-brand-dark font-medium h-12 rounded-xl transition-all duration-300 tracking-wider uppercase text-[10px] cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    ) : (
                      // Standard Display Panel
                      <>
                        <span className="text-[10px] tracking-[0.3em] font-bold text-brand-accent uppercase mb-3 block">
                          Atelier Designer Collection
                        </span>
                        <h1 className="font-serif text-3xl md:text-5xl text-brand-dark font-light tracking-tight leading-tight mb-4">
                          {product.title}
                        </h1>
                        <div className="h-[1px] w-full bg-neutral-100 my-6" />

                        {/* Price Showcase */}
                        <div className="mb-6">
                          <span className="text-gray-400 text-xs font-sans block mb-1">
                            Retail Valuation
                          </span>
                          <span className="text-3xl font-serif text-brand-dark tracking-wide font-medium">
                            {formatPrice(product.price?.priceAmount, product.price?.priceCurrency)}
                          </span>
                        </div>

                        {/* Conditionally render Edit Button or Verified Badge */}
                        <div className="flex flex-col sm:flex-row gap-4 items-start mb-8">
                          <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-100/50 rounded-xl px-4 py-2 text-emerald-800 text-xs font-medium">
                            <svg
                              className="w-4 h-4 text-emerald-500"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                              />
                            </svg>
                            Verified Designer Article
                          </div>

                          {isOwner && (
                            <button
                              onClick={handleStartEdit}
                              className="inline-flex items-center gap-2 border border-brand-accent/30 hover:border-brand-accent bg-transparent text-brand-accent hover:bg-brand-accent/5 transition-all duration-300 rounded-xl px-4 py-2 text-xs font-semibold cursor-pointer"
                            >
                              <svg
                                className="w-3.5 h-3.5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth="2"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                                />
                              </svg>
                              Edit Curation
                            </button>
                          )}
                        </div>

                        {/* Description Section */}
                        <div className="mb-8">
                          <h4 className="text-xs font-semibold uppercase tracking-wider text-brand-dark mb-3 font-sans">
                            Atelier Description
                          </h4>
                          <p className="text-gray-500 text-sm font-sans leading-relaxed whitespace-pre-line">
                            {product.description}
                          </p>
                        </div>

                        <div className="h-[1px] w-full bg-neutral-100 my-8" />

                        {/* Technical details list */}
                        <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-xs font-sans border border-neutral-100 p-5 rounded-2xl bg-neutral-50/50">
                          <div>
                            <span className="text-gray-400 block mb-1">Catalog ID</span>
                            <span className="font-mono text-brand-dark select-all">
                              {product._id}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-400 block mb-1">Availability Status</span>
                            <span className="text-emerald-700 font-semibold uppercase tracking-wide text-[10px]">
                              Published Live
                            </span>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </main>

      {/* Premium minimal footer */}
      <footer className="border-t border-neutral-100 bg-white py-8 mt-20">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400 font-light">
          <span>&copy; {new Date().getFullYear()} VELNOX. All Rights Reserved.</span>
          <span className="uppercase tracking-[0.2em] text-[10px] text-brand-accent">
            Atelier Designer Portal
          </span>
        </div>
      </footer>
    </div>
  );
};

export default ProductDetails;
