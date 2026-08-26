import { useState, useRef, useEffect } from "react";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router";
import { useSellerProduct } from "../hooks/useSellerProduct";

const Input = ({
  label,
  id,
  type,
  value,
  onChange,
  onBlur,
  error,
  touched,
  rightElement,
  ...props
}) => {
  return (
    <div className="relative mb-6">
      <input
        type={type}
        id={id}
        name={id}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder=" "
        className={`peer block w-full px-0 py-3 text-base text-brand-dark bg-transparent border-b transition-all focus:outline-none placeholder-transparent ${
          touched && error
            ? "border-red-500 focus:border-red-500"
            : "border-gray-200 focus:border-brand-accent"
        }`}
        {...props}
      />
      <label
        htmlFor={id}
        className={`absolute left-0 top-3 text-sm transition-all duration-300 origin-[0_0] -translate-y-5 scale-75 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:text-gray-400 peer-focus:scale-75 peer-focus:-translate-y-5 cursor-text ${
          touched && error
            ? "text-red-500 peer-focus:text-red-500"
            : "text-gray-400 peer-focus:text-brand-accent"
        }`}
      >
        {label}
      </label>
      {rightElement && (
        <div className="absolute right-0 bottom-3 flex items-center">{rightElement}</div>
      )}
      {touched && error && (
        <p className="text-red-500 text-xs mt-1 transition-all duration-300 font-sans tracking-wide">
          {error}
        </p>
      )}
    </div>
  );
};

const TextArea = ({ label, id, value, onChange, onBlur, error, touched, rows = 3, ...props }) => {
  return (
    <div className="relative mb-6">
      <textarea
        id={id}
        name={id}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        rows={rows}
        placeholder=" "
        className={`peer block w-full px-0 py-3 text-base text-brand-dark bg-transparent border-b transition-all focus:outline-none placeholder-transparent resize-none ${
          touched && error
            ? "border-red-500 focus:border-red-500"
            : "border-gray-200 focus:border-brand-accent"
        }`}
        {...props}
      />
      <label
        htmlFor={id}
        className={`absolute left-0 top-3 text-sm transition-all duration-300 origin-[0_0] -translate-y-5 scale-75 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:text-gray-400 peer-focus:scale-75 peer-focus:-translate-y-5 cursor-text ${
          touched && error
            ? "text-red-500 peer-focus:text-red-500"
            : "text-gray-400 peer-focus:text-brand-accent"
        }`}
      >
        {label}
      </label>
      {touched && error && (
        <p className="text-red-500 text-xs mt-1 transition-all duration-300 font-sans tracking-wide">
          {error}
        </p>
      )}
    </div>
  );
};

const CreateProduct = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const { handleCreateProduct } = useSellerProduct();
  const { loading, error: apiError } = useSelector((state) => state.product);
  const { user } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priceAmount: "",
    priceCurrency: "INR",
  });

  const [images, setImages] = useState([]);
  const [variants, setVariants] = useState([]);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [openGalleryIdx, setOpenGalleryIdx] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [success, setSuccess] = useState(false);
  const [toast, setToast] = useState(null);

  const [loaderVisible, setLoaderVisible] = useState(true);
  const [loaderFadeOut, setLoaderFadeOut] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => {
      setLoaderFadeOut(true);
    }, 600);
    const removeTimer = setTimeout(() => {
      setLoaderVisible(false);
    }, 1300);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  // Sync API errors as toasts
  useEffect(() => {
    if (apiError) {
      showToast("error", apiError);
    }
  }, [apiError]);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  const validateField = (name, value, currentImages = images) => {
    let error = "";
    if (name === "title") {
      if (!value.trim()) error = "Product title is required";
      else if (value.trim().length < 3) error = "Title must be at least 3 characters";
    } else if (name === "description") {
      if (!value.trim()) error = "Description is required";
      else if (value.trim().length < 10) error = "Description must be at least 10 characters";
    } else if (name === "priceAmount") {
      if (!value) error = "Price is required";
      else if (isNaN(value) || Number(value) <= 0)
        error = "Please enter a valid price greater than 0";
    } else if (name === "images") {
      if (currentImages.length === 0) error = "At least one product image is required";
      else if (currentImages.length > 8) error = "Maximum 8 images allowed";
    }
    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (touched[name]) {
      const error = validateField(name, value);
      setErrors((prev) => ({ ...prev, [name]: error }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const error = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  // Image Upload Logic
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    addImages(files);
  };

  const addImages = (files) => {
    const validImages = [];
    let fileError = "";

    files.forEach((file) => {
      // Validate image format
      if (!file.type.startsWith("image/")) {
        fileError = "Only image files are allowed";
        return;
      }
      // Limit to 5MB per file
      if (file.size > 5 * 1024 * 1024) {
        fileError = "Each image must be smaller than 5MB";
        return;
      }
      validImages.push({
        file,
        previewUrl: URL.createObjectURL(file),
      });
    });

    if (fileError) {
      showToast("error", fileError);
    }

    if (validImages.length > 0) {
      setImages((prev) => {
        const newImages = [...prev, ...validImages].slice(0, 8);
        // Validate image list size
        const error = validateField("images", null, newImages);
        setErrors((prevErrors) => ({ ...prevErrors, images: error }));
        return newImages;
      });
    }

    // Reset file input value
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeImage = (indexToRemove) => {
    setImages((prev) => {
      const filtered = prev.filter((_, idx) => idx !== indexToRemove);
      // Revoke object URL to avoid memory leak
      URL.revokeObjectURL(prev[indexToRemove].previewUrl);
      const error = validateField("images", null, filtered);
      setErrors((prevErrors) => ({ ...prevErrors, images: error }));
      return filtered;
    });
  };

  // Drag and Drop
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    addImages(files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Mark all as touched
    const newTouched = {
      title: true,
      description: true,
      priceAmount: true,
      images: true,
    };
    setTouched(newTouched);

    const titleError = validateField("title", formData.title);
    const descError = validateField("description", formData.description);
    const priceError = validateField("priceAmount", formData.priceAmount);
    const imagesError = validateField("images", null, images);

    // Validate variants
    let variantErrors = [];
    const uniqueVariants = new Set();

    variants.forEach((v, idx) => {
      let vErr = {};
      if (!v.attributes.color || !v.attributes.color.trim()) {
        vErr.color = "Color is required";
      }
      if (!v.priceAmount) {
        vErr.priceAmount = "Price is required";
      } else if (isNaN(v.priceAmount) || Number(v.priceAmount) < 0) {
        vErr.priceAmount = "Price must be non-negative";
      }
      if (v.stock === undefined || v.stock === "") {
        vErr.stock = "Stock is required";
      } else if (isNaN(v.stock) || Number(v.stock) < 0) {
        vErr.stock = "Stock must be non-negative";
      }

      const combination = `${v.attributes.size?.toLowerCase()}-${v.attributes.color?.trim().toLowerCase()}`;
      if (uniqueVariants.has(combination)) {
        vErr.duplicate = "Duplicate variant combination";
      } else {
        uniqueVariants.add(combination);
      }

      if (Object.keys(vErr).length > 0) {
        variantErrors[idx] = vErr;
      }
    });

    const newErrors = {
      title: titleError,
      description: descError,
      priceAmount: priceError,
      images: imagesError,
      variants: variantErrors.length > 0 ? variantErrors : null,
    };

    setErrors(newErrors);

    const hasErrors =
      Object.values(newErrors).some((err) => err && typeof err === "string") ||
      variantErrors.length > 0;

    if (hasErrors) {
      showToast("error", "Please fix form errors before submitting.");
      return;
    }

    // Format variants to match the backend schema (nesting priceAmount and priceCurrency inside a 'price' object)
    const formattedVariants = variants.map((v) => ({
      stock: Number(v.stock ?? 0),
      price: {
        priceAmount: Number(v.priceAmount),
        priceCurrency: v.priceCurrency || formData.priceCurrency || "INR",
      },
      attributes: v.attributes,
      imageIndices: v.imageIndices,
    }));

    // Build FormData
    const submissionData = new FormData();
    submissionData.append("title", formData.title.trim());
    submissionData.append("description", formData.description.trim());
    submissionData.append("priceAmount", formData.priceAmount);
    submissionData.append("priceCurrency", formData.priceCurrency);
    submissionData.append("variants", JSON.stringify(formattedVariants));

    images.forEach((img) => {
      submissionData.append("images", img.file);
    });

    const result = await handleCreateProduct(submissionData);

    if (result && result.success) {
      setSuccess(true);
      showToast("success", "Product uploaded successfully!");
      // Reset form
      setFormData({
        title: "",
        description: "",
        priceAmount: "",
        priceCurrency: "INR",
      });
      setImages([]);
      setVariants([]);
    }
  };

  return (
    <div className="relative min-h-screen bg-brand-light flex flex-col font-sans selection:bg-brand-accent selection:text-white">
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
              Atelier Portal
            </span>
          </div>
        </div>
      )}

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

      {/* Main split viewport layout */}
      <main className="flex-grow flex flex-col md:flex-row min-h-screen">
        {/* Left column: Fashion editorial image - top banner on mobile, side column on desktop */}
        <div className="relative w-full md:w-1/2 h-64 md:h-auto overflow-hidden bg-neutral-900 flex items-end">
          <img
            src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1200&auto=format&fit=crop"
            alt="VELNOX Atelier Collection"
            className="absolute inset-0 w-full h-full object-cover opacity-70 scale-105 animate-fade-in"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/40 to-transparent" />

          <div className="relative p-8 md:p-16 z-10 w-full animate-fade-up">
            <span className="text-[10px] tracking-[0.3em] font-semibold text-brand-accent uppercase mb-3 block">
              VELNOX Atelier / Designer Portal
            </span>
            <h1 className="font-serif text-3xl md:text-5xl lg:text-6xl text-white font-light tracking-tight leading-[1.1] mb-4">
              Atelier Craft.
              <br />
              Digital Runway.
            </h1>
            <p className="text-neutral-400 font-sans text-xs md:text-sm tracking-wider uppercase">
              Introduce your latest creations to the premium curation.
            </p>
          </div>
        </div>

        {/* Right column: Form Card */}
        <div className="w-full md:w-1/2 bg-white flex items-center justify-center p-6 sm:p-12 md:p-16 lg:p-24 overflow-y-auto">
          <div className="w-full max-w-lg animate-fade-up">
            {success ? (
              // Success Screen
              <div className="text-center py-12 animate-fade-up">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-brand-accent/10 border border-brand-accent/20 text-brand-accent mb-8">
                  <svg
                    className="w-10 h-10"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </div>
                <h2 className="font-serif text-3xl font-medium tracking-tight text-brand-dark mb-4">
                  Product Published
                </h2>
                <p className="text-gray-500 text-sm max-w-sm mx-auto mb-10 font-sans leading-relaxed">
                  Your creation has been cataloged successfully. It is now live in the Velnox
                  premium designer gallery.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={() => setSuccess(false)}
                    className="flex-1 inline-flex items-center justify-center bg-brand-dark hover:bg-neutral-800 text-white font-medium h-12 rounded-xl transition-all duration-300 tracking-wider uppercase text-xs"
                  >
                    Add Another Product
                  </button>
                  <Link
                    to="/"
                    className="flex-1 inline-flex items-center justify-center border border-gray-200 hover:border-brand-dark text-brand-dark font-medium h-12 rounded-xl transition-all duration-300 tracking-wider uppercase text-xs"
                  >
                    Go to Homepage
                  </Link>
                </div>
              </div>
            ) : (
              // Form screen
              <>
                <div className="mb-10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 border-b border-neutral-100 pb-6">
                  <div>
                    <div className="font-serif text-2xl tracking-[0.25em] text-brand-dark mb-4 select-none">
                      VELNOX
                    </div>
                    <h2 className="font-serif text-3xl tracking-tight text-brand-dark mb-2">
                      Create Product
                    </h2>
                    <p className="text-gray-400 text-sm font-sans">
                      Complete the details below to add a new article of clothing to your
                      collection.
                    </p>
                  </div>
                  <div className="w-full sm:w-auto">
                    <Link
                      to="/seller-products"
                      className="inline-flex items-center justify-center border border-gray-200 hover:border-brand-dark text-brand-dark font-medium px-4 h-10 rounded-xl transition-all duration-300 tracking-wider uppercase text-[10px] w-full sm:w-auto"
                    >
                      View Creations
                    </Link>
                  </div>
                </div>
                {/* Active Profile Info Widget */}
                {user && (
                  <div className="mb-8 p-4 bg-neutral-50 border border-neutral-100 rounded-xl flex items-center gap-3">
                    {user.profile ? (
                      <img
                        src={user.profile}
                        alt={user.fullName}
                        className="w-10 h-10 rounded-full object-cover border border-brand-accent/20"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-brand-accent/10 border border-brand-accent/20 flex items-center justify-center text-brand-accent text-sm font-serif animate-pulse">
                        {user.fullName
                          ? user.fullName
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                          : "V"}
                      </div>
                    )}
                    <div className="flex-grow min-w-0">
                      <span className="text-[8px] tracking-wider uppercase font-semibold text-brand-accent block">
                        Active Designer Profile
                      </span>
                      <h4 className="text-xs font-semibold text-brand-dark truncate">
                        {user.fullName}
                      </h4>
                      <p className="text-[10px] text-gray-400 truncate">{user.email}</p>
                    </div>
                    <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full text-[9px] font-semibold border border-emerald-100">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Active
                    </div>
                  </div>
                )}
                <form onSubmit={handleSubmit} noValidate>
                  {/* Product Title */}
                  <Input
                    label="Product Title (e.g. Linen Blend Blazer)"
                    id="title"
                    type="text"
                    value={formData.title}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={errors.title}
                    touched={touched.title}
                    disabled={loading}
                  />

                  {/* Product Description */}
                  <TextArea
                    label="Description & Fabric Composition"
                    id="description"
                    value={formData.description}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={errors.description}
                    touched={touched.description}
                    rows={4}
                    disabled={loading}
                  />

                  {/* Price Section */}
                  <div className="grid grid-cols-3 gap-6 items-end mb-6">
                    <div className="col-span-2">
                      <Input
                        label="Price"
                        id="priceAmount"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.priceAmount}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={errors.priceAmount}
                        touched={touched.priceAmount}
                        disabled={loading}
                      />
                    </div>
                    <div className="relative mb-6">
                      <label
                        htmlFor="priceCurrency"
                        className="absolute left-0 -translate-y-5 scale-75 text-xs text-gray-400"
                      >
                        Currency
                      </label>
                      <select
                        id="priceCurrency"
                        name="priceCurrency"
                        value={formData.priceCurrency}
                        onChange={handleChange}
                        disabled={loading}
                        className="w-full py-3 bg-transparent border-b border-gray-200 text-brand-dark focus:outline-none focus:border-brand-accent transition-all text-base appearance-none cursor-pointer"
                      >
                        <option value="INR">INR (₹)</option>
                        <option value="USD">USD ($)</option>
                        <option value="EUR">EUR (€)</option>
                        <option value="GBP">GBP (£)</option>
                        <option value="JPY">JPY (¥)</option>
                      </select>
                      <div className="absolute right-0 bottom-4 pointer-events-none text-gray-400">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Image Upload Zone */}
                  <div className="mb-8">
                    <label className="block text-sm text-gray-400 mb-3">
                      Product Images (1 to 8 images)
                    </label>
                    <div
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`border border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300 flex flex-col items-center justify-center ${
                        isDragOver
                          ? "border-brand-accent bg-brand-accent/5"
                          : errors.images && touched.images
                            ? "border-red-400 bg-red-50/10"
                            : "border-gray-200 hover:border-brand-accent hover:bg-neutral-50/50"
                      }`}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        id="images"
                        name="images"
                        multiple
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                        disabled={loading}
                      />
                      <svg
                        className={`w-10 h-10 mb-4 transition-transform duration-300 ${isDragOver ? "scale-110 text-brand-accent" : "text-gray-300"}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                        />
                      </svg>
                      <p className="text-xs font-semibold text-brand-dark uppercase tracking-wider mb-1">
                        Upload Product Images
                      </p>
                      <p className="text-xs text-gray-400 font-light">
                        Drag and drop images here, or click to browse (up to 8 files, 5MB max each)
                      </p>
                    </div>
                    {errors.images && touched.images && (
                      <p className="text-red-500 text-xs mt-2 transition-all duration-300 font-sans tracking-wide">
                        {errors.images}
                      </p>
                    )}

                    {/* Previews Grid */}
                    {images.length > 0 && (
                      <div className="grid grid-cols-4 gap-4 mt-6">
                        {images.map((img, index) => (
                          <div
                            key={index}
                            className="relative aspect-square rounded-lg overflow-hidden group border border-gray-100 shadow-sm"
                          >
                            <img
                              src={img.previewUrl}
                              alt={`Upload preview ${index + 1}`}
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeImage(index);
                              }}
                              className="absolute top-1.5 right-1.5 bg-neutral-900/80 hover:bg-neutral-950 text-white rounded-full p-1 opacity-90 transition-all duration-200"
                              title="Remove image"
                              disabled={loading}
                            >
                              <svg
                                className="w-3.5 h-3.5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2.5"
                                  d="M6 18L18 6M6 6l12 12"
                                />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Product Variants section */}
                  <div className="mb-8 border-t border-neutral-100 pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-sm font-semibold text-brand-dark uppercase tracking-wider">
                          Product Variants
                        </h3>
                        <p className="text-xs text-gray-400 font-light mt-0.5">
                          Configure sizes, colors, price, and stock for this product.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setVariants((prev) => [
                            ...prev,
                            {
                              stock: 10,
                              priceAmount: formData.priceAmount || "",
                              priceCurrency: formData.priceCurrency || "INR",
                              attributes: { size: "", color: "" },
                              imageIndices: [],
                            },
                          ])
                        }
                        className="inline-flex items-center justify-center border border-brand-dark hover:bg-neutral-50 text-brand-dark font-medium px-4 h-9 rounded-xl transition-all duration-300 tracking-wider uppercase text-[10px] cursor-pointer"
                      >
                        + Add Variant
                      </button>
                    </div>

                    {variants.length > 0 && (
                      <div className="space-y-6">
                        {variants.map((v, idx) => (
                          <div
                            key={idx}
                            className="p-5 bg-neutral-50 border border-neutral-100 rounded-2xl relative animate-fade-in"
                          >
                            <button
                              type="button"
                              onClick={() =>
                                setVariants((prev) => prev.filter((_, i) => i !== idx))
                              }
                              className="absolute top-4 right-4 text-gray-400 hover:text-red-500 font-bold text-base cursor-pointer px-1"
                              title="Remove variant"
                            >
                              &times;
                            </button>

                            <div className="grid grid-cols-2 gap-4 mb-4">
                              {/* Size Selection */}
                              <div>
                                <label className="block text-[10px] uppercase font-bold tracking-widest text-brand-dark mb-1">
                                  Size
                                </label>
                                <select
                                  value={v.attributes.size || ""}
                                  onChange={(e) =>
                                    setVariants((prev) => {
                                      const updated = [...prev];
                                      updated[idx].attributes = {
                                        ...updated[idx].attributes,
                                        size: e.target.value,
                                      };
                                      return updated;
                                    })
                                  }
                                  className="w-full bg-white border border-neutral-200 text-xs rounded-xl h-11 px-3 outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent/20 cursor-pointer"
                                >
                                  <option value="">None (One Size)</option>
                                  {["XS", "S", "M", "L", "XL", "XXL"].map((sz) => (
                                    <option key={sz} value={sz}>
                                      {sz}
                                    </option>
                                  ))}
                                </select>
                                {errors.variants?.[idx]?.size && (
                                  <p className="text-red-500 text-[10px] mt-1">
                                    {errors.variants[idx].size}
                                  </p>
                                )}
                              </div>

                              {/* Color Hue Input */}
                              <div>
                                <label className="block text-[10px] uppercase font-bold tracking-widest text-brand-dark mb-1">
                                  Color Hue
                                </label>
                                <input
                                  type="text"
                                  placeholder="e.g. Charcoal Black"
                                  value={v.attributes.color || ""}
                                  onChange={(e) =>
                                    setVariants((prev) => {
                                      const updated = [...prev];
                                      updated[idx].attributes = {
                                        ...updated[idx].attributes,
                                        color: e.target.value,
                                      };
                                      return updated;
                                    })
                                  }
                                  className="w-full bg-white border border-neutral-200 text-xs rounded-xl h-11 px-4 outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent/20 text-brand-dark"
                                />
                                {errors.variants?.[idx]?.color && (
                                  <p className="text-red-500 text-[10px] mt-1">
                                    {errors.variants[idx].color}
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4 mb-4">
                              {/* Price Amount Input */}
                              <div className="col-span-2">
                                <label className="block text-[10px] uppercase font-bold tracking-widest text-brand-dark mb-1">
                                  Variant Price
                                </label>
                                <input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  placeholder="Price"
                                  value={v.priceAmount}
                                  onChange={(e) =>
                                    setVariants((prev) => {
                                      const updated = [...prev];
                                      updated[idx].priceAmount = e.target.value;
                                      return updated;
                                    })
                                  }
                                  className="w-full bg-white border border-neutral-200 text-xs rounded-xl h-11 px-4 outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent/20 text-brand-dark"
                                />
                                {errors.variants?.[idx]?.priceAmount && (
                                  <p className="text-red-500 text-[10px] mt-1">
                                    {errors.variants[idx].priceAmount}
                                  </p>
                                )}
                              </div>

                              {/* Stock Input */}
                              <div>
                                <label className="block text-[10px] uppercase font-bold tracking-widest text-brand-dark mb-1">
                                  Stock
                                </label>
                                <input
                                  type="number"
                                  min="0"
                                  placeholder="Stock"
                                  value={v.stock}
                                  onChange={(e) =>
                                    setVariants((prev) => {
                                      const updated = [...prev];
                                      updated[idx].stock = e.target.value;
                                      return updated;
                                    })
                                  }
                                  className="w-full bg-white border border-neutral-200 text-xs rounded-xl h-11 px-4 outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent/20 text-brand-dark"
                                />
                                {errors.variants?.[idx]?.stock && (
                                  <p className="text-red-500 text-[10px] mt-1">
                                    {errors.variants[idx].stock}
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* Image Select Grid */}
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <label className="block text-[10px] uppercase font-bold tracking-widest text-brand-dark">
                                  Variant Images
                                </label>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setOpenGalleryIdx(openGalleryIdx === idx ? null : idx);
                                  }}
                                  className="text-[10px] font-bold text-brand-accent uppercase tracking-widest hover:underline cursor-pointer"
                                >
                                  {openGalleryIdx === idx
                                    ? "Hide Gallery"
                                    : "Select from Product Gallery"}
                                </button>
                              </div>

                              {/* Horizontal list of currently assigned variant images */}
                              <div className="flex flex-wrap gap-2.5 mb-4">
                                {images.map((img, imgIdx) => {
                                  const isSelected = v.imageIndices?.includes(imgIdx);
                                  if (!isSelected) return null; // ONLY show assigned images!
                                  return (
                                    <div
                                      key={imgIdx}
                                      className="relative w-12 h-12 rounded-lg overflow-hidden border border-neutral-200"
                                    >
                                      <img
                                        src={img.previewUrl}
                                        alt=""
                                        className="w-full h-full object-cover"
                                      />
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setVariants((prev) => {
                                            const updated = [...prev];
                                            const currentIndices = updated[idx].imageIndices || [];
                                            updated[idx].imageIndices = currentIndices.filter(
                                              (i) => i !== imgIdx
                                            );
                                            return updated;
                                          });
                                        }}
                                        className="absolute top-0.5 right-0.5. w-4 h-4 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-[8px] font-bold shadow z-10 cursor-pointer border-none"
                                        title="Deselect image"
                                      >
                                        &times;
                                      </button>
                                    </div>
                                  );
                                })}

                                {/* Upload button for this variant */}
                                <button
                                  type="button"
                                  onClick={() => {
                                    const input = document.createElement("input");
                                    input.type = "file";
                                    input.accept = "image/*";
                                    input.onchange = (e) => {
                                      const files = Array.from(e.target.files);
                                      if (files.length > 0) {
                                        const file = files[0];
                                        if (file.size > 5 * 1024 * 1024) {
                                          showToast("error", "Each image must be smaller than 5MB");
                                          return;
                                        }
                                        const previewUrl = URL.createObjectURL(file);
                                        const fileObj = { file, previewUrl };

                                        setImages((prev) => {
                                          const updatedImages = [...prev, fileObj];
                                          const newTotalIndex = updatedImages.length - 1;

                                          setVariants((vPrev) => {
                                            const updatedVariants = [...vPrev];
                                            const currentIndices =
                                              updatedVariants[idx].imageIndices || [];
                                            updatedVariants[idx].imageIndices = [
                                              ...currentIndices,
                                              newTotalIndex,
                                            ];
                                            return updatedVariants;
                                          });

                                          return updatedImages;
                                        });
                                      }
                                    };
                                    input.click();
                                  }}
                                  className="w-12 h-12 rounded-lg border-2 border-dashed border-neutral-300 hover:border-brand-accent flex items-center justify-center cursor-pointer text-gray-400 hover:text-brand-accent transition-all"
                                  title="Upload new image for this variant"
                                >
                                  <svg
                                    className="w-5 h-5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="2.5"
                                      d="M12 4v16m8-8H4"
                                    />
                                  </svg>
                                </button>
                              </div>

                              {/* Collapsible Product Gallery selection grid */}
                              {openGalleryIdx === idx && (
                                <div className="bg-white border border-neutral-200 rounded-xl p-4 mt-2 animate-fade-in mb-4">
                                  <p className="text-[9px] uppercase font-bold tracking-wider text-gray-400 mb-3">
                                    Select images from Product Gallery:
                                  </p>
                                  {images.length === 0 ? (
                                    <p className="text-[10px] text-gray-400 italic">
                                      No images in product gallery. Upload one using the + button.
                                    </p>
                                  ) : (
                                    <div className="flex flex-wrap gap-2">
                                      {images.map((img, imgIdx) => {
                                        const isSelected = v.imageIndices?.includes(imgIdx);
                                        return (
                                          <button
                                            key={imgIdx}
                                            type="button"
                                            onClick={() =>
                                              setVariants((prev) => {
                                                const updated = [...prev];
                                                const currentIndices =
                                                  updated[idx].imageIndices || [];
                                                if (currentIndices.includes(imgIdx)) {
                                                  updated[idx].imageIndices = currentIndices.filter(
                                                    (i) => i !== imgIdx
                                                  );
                                                } else {
                                                  updated[idx].imageIndices = [
                                                    ...currentIndices,
                                                    imgIdx,
                                                  ];
                                                }
                                                return updated;
                                              })
                                            }
                                            className={`relative w-12 h-12 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                                              isSelected
                                                ? "border-brand-accent scale-[1.03] shadow"
                                                : "border-neutral-200 opacity-60 hover:opacity-100"
                                            }`}
                                          >
                                            <img
                                              src={img.previewUrl}
                                              alt=""
                                              className="w-full h-full object-cover"
                                            />
                                            {isSelected && (
                                              <div className="absolute inset-0 bg-brand-accent/10 flex items-center justify-center">
                                                <span className="text-white bg-brand-accent rounded-full w-4 h-4 flex items-center justify-center text-[8px] font-bold shadow">
                                                  ✓
                                                </span>
                                              </div>
                                            )}
                                          </button>
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>

                            {/* Duplicate Warning */}
                            {errors.variants?.[idx]?.duplicate && (
                              <p className="text-red-500 text-xs mt-2 font-medium">
                                {errors.variants[idx].duplicate}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center bg-brand-dark hover:bg-neutral-800 disabled:bg-neutral-400 text-white font-medium h-12 rounded-xl transition-all duration-300 transform hover:scale-[1.01] active:scale-[0.99] disabled:scale-100 disabled:pointer-events-none tracking-wider uppercase text-xs relative overflow-hidden"
                  >
                    {loading ? (
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
                        <span>Publishing Atelier Article...</span>
                      </div>
                    ) : (
                      "Publish Article"
                    )}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default CreateProduct;
