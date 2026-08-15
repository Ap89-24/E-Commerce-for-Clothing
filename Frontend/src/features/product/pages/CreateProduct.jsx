import { useState, useRef, useEffect } from "react";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router";
import { useSellerProduct } from "../hooks/useSellerProduct";

const Input = ({ label, id, type, value, onChange, onBlur, error, touched, rightElement, ...props }) => {
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

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priceAmount: "",
    priceCurrency: "INR",
  });

  const [images, setImages] = useState([]);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isDragOver, setIsDragOver] = useState(false);
  const [success, setSuccess] = useState(false);
  const [toast, setToast] = useState(null);

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
      else if (isNaN(value) || Number(value) <= 0) error = "Please enter a valid price greater than 0";
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

    const newErrors = {
      title: titleError,
      description: descError,
      priceAmount: priceError,
      images: imagesError,
    };

    setErrors(newErrors);

    const hasErrors = Object.values(newErrors).some((err) => !!err);
    if (hasErrors) {
      showToast("error", "Please fix form errors before submitting.");
      return;
    }

    // Build FormData
    const submissionData = new FormData();
    submissionData.append("title", formData.title.trim());
    submissionData.append("description", formData.description.trim());
    submissionData.append("priceAmount", formData.priceAmount);
    submissionData.append("priceCurrency", formData.priceCurrency);
    
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
    }
  };

  return (
    <div className="relative min-h-screen bg-brand-light flex flex-col font-sans selection:bg-brand-accent selection:text-white">
      {/* Toast Alert */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-6 py-4 rounded-xl shadow-xl border animate-fade-in transition-all duration-300 ${
          toast.type === "success" 
            ? "bg-white border-emerald-100 text-emerald-800" 
            : "bg-white border-red-100 text-red-800"
        }`}>
          <div className={`w-2 h-2 rounded-full ${toast.type === "success" ? "bg-emerald-500" : "bg-red-500"}`} />
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
                  Your creation has been cataloged successfully. It is now live in the Velnox premium designer gallery.
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
                <div className="mb-10">
                  <div className="font-serif text-2xl tracking-[0.25em] text-brand-dark mb-8 select-none">
                    VELNOX
                  </div>
                  <h2 className="font-serif text-3xl tracking-tight text-brand-dark mb-2">
                    Create Product
                  </h2>
                  <p className="text-gray-400 text-sm font-sans">
                    Complete the details below to add a new article of clothing to your collection.
                  </p>
                </div>

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
                      <label htmlFor="priceCurrency" className="absolute left-0 -translate-y-5 scale-75 text-xs text-gray-400">
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
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Image Upload Zone */}
                  <div className="mb-8">
                    <label className="block text-sm text-gray-400 mb-3">Product Images (1 to 8 images)</label>
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
                          <div key={index} className="relative aspect-square rounded-lg overflow-hidden group border border-gray-100 shadow-sm">
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
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
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
                        <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
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
