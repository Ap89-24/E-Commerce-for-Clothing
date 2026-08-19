import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router";
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

const SellerProducts = () => {
  const { handleGetAllProducts } = useSellerProduct();
  const { sellerProducts = [], loading } = useSelector((state) => state.product);
  const { user } = useSelector((state) => state.auth);

  const [loaderVisible, setLoaderVisible] = useState(true);
  const [loaderFadeOut, setLoaderFadeOut] = useState(false);

  // Fetch all seller products on component mount
  useEffect(() => {
    handleGetAllProducts();
  }, [handleGetAllProducts]);

  // Handle entry loader fading transitions
  useEffect(() => {
    if (!loading) {
      setLoaderFadeOut(true);
      const timer = setTimeout(() => {
        setLoaderVisible(false);
      }, 700); // duration of opacity transition
      return () => clearTimeout(timer);
    } else {
      setLoaderVisible(true);
      setLoaderFadeOut(false);
    }
  }, [loading]);

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
              Atelier Collection
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
            to="/create-product"
            className="inline-flex items-center justify-center bg-brand-dark hover:bg-neutral-800 text-white font-medium px-6 h-11 rounded-lg transition-all duration-300 tracking-wider uppercase text-[10px] border border-transparent"
          >
            Publish Article
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow max-w-7xl mx-auto px-6 py-12 md:py-16 w-full">
        {/* Header Block */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b border-neutral-100 pb-8">
          <div className="animate-fade-up">
            <span className="text-[10px] tracking-[0.3em] font-bold text-brand-accent uppercase mb-2 block">
              Atelier Catalog
            </span>
            <h2 className="font-serif text-3xl md:text-5xl text-brand-dark font-light tracking-tight leading-none">
              Your Creations
            </h2>
            <p className="text-gray-400 text-sm mt-3 font-sans max-w-md">
              Manage, preview, and monitor the clothing articles you have published to the VELNOX
              editorial showcase.
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
            <span>Total Published:</span>
            <span className="text-base font-serif text-brand-dark bg-neutral-100 px-3 py-1 rounded-md">
              {sellerProducts.length}
            </span>
          </div>
        </div>{" "}
        {/* Profile Card Section */}
        {user && (
          <div className="mb-12 bg-white border border-neutral-100 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center md:items-start gap-6 shadow-sm animate-fade-up">
            <div className="relative">
              {user.profile ? (
                <img
                  src={user.profile}
                  alt={user.fullName}
                  className="w-20 h-20 rounded-full object-cover border border-brand-accent/20"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-brand-accent/10 border border-brand-accent/20 flex items-center justify-center text-brand-accent text-2xl font-serif">
                  {user.fullName
                    ? user.fullName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                    : "V"}
                </div>
              )}
              <span className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full animate-pulse" />
            </div>
            <div className="flex-grow text-center md:text-left">
              <span className="text-[9px] tracking-[0.25em] font-semibold text-brand-accent bg-brand-accent/5 px-3 py-1 rounded-full uppercase inline-block mb-3">
                {user.role} Atelier Resident
              </span>
              <h3 className="font-serif text-2xl text-brand-dark font-medium leading-none mb-2">
                {user.fullName}
              </h3>
              <p className="text-gray-400 text-xs font-sans tracking-wide mb-1">
                Email: {user.email}
              </p>
              {user.contact && (
                <p className="text-gray-400 text-xs font-sans tracking-wide">
                  Contact: {user.contact}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-2 w-full md:w-auto self-stretch md:self-auto justify-center">
              <span className="text-gray-400 text-[10px] tracking-wider uppercase font-semibold text-center md:text-right block">
                Catalog Status
              </span>
              <span className="text-xs font-medium text-emerald-800 bg-emerald-50 px-4 py-2 rounded-xl text-center border border-emerald-100/50">
                Active & Selling
              </span>
            </div>
          </div>
        )}
        {/* Catalog Content */}
        {!loaderVisible && (
          <div className="animate-fade-in">
            {sellerProducts.length === 0 ? (
              // Refined Empty State Catalog Card
              <div className="max-w-lg mx-auto text-center py-20 px-6 bg-white border border-neutral-100 rounded-2xl shadow-sm animate-fade-up">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-brand-accent/5 text-brand-accent mb-6">
                  <svg
                    className="w-8 h-8"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0l-3-3m3 3l3-3M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v-1.5c0 .621.504 1.125 1.125 1.125z"
                    />
                  </svg>
                </div>
                <h3 className="font-serif text-2xl font-medium tracking-tight text-brand-dark mb-3">
                  Atelier Catalog is Empty
                </h3>
                <p className="text-gray-400 text-sm mb-8 leading-relaxed">
                  You haven't cataloged any clothing articles yet. Publish your first creation to
                  showcase it on the runway.
                </p>
                <Link
                  to="/create-product"
                  className="inline-flex items-center justify-center bg-brand-dark hover:bg-neutral-800 text-white font-medium px-8 h-12 rounded-xl transition-all duration-300 tracking-wider uppercase text-xs shadow-md"
                >
                  Publish First Article
                </Link>
              </div>
            ) : (
              // Premium responsive CSS 3:4 grid
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-12">
                {sellerProducts.map((product) => (
                  <Link
                    key={product._id}
                    to={`/seller/product/${product._id}`}
                    className="group flex flex-col cursor-pointer"
                  >
                    {/* Portrait 3:4 Aspect Image Card Container */}
                    <div className="relative aspect-[3/4] overflow-hidden bg-neutral-100 rounded-xl mb-4 border border-neutral-100 shadow-sm">
                      {product.images && product.images.length > 0 ? (
                        <img
                          src={product.images[0].url}
                          alt={product.title}
                          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-neutral-400 bg-neutral-200">
                          No Image
                        </div>
                      )}
                      {/* Smooth Dark overlay on hover */}
                      <div className="absolute inset-0 bg-neutral-950/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>

                    {/* Product Details Block */}
                    <div className="flex flex-col flex-grow">
                      <div className="flex items-start justify-between gap-4">
                        <h3 className="font-serif text-lg text-brand-dark group-hover:text-brand-accent transition-colors duration-300 line-clamp-1">
                          {product.title}
                        </h3>
                      </div>
                      <p className="text-brand-accent font-semibold text-sm mt-1 tracking-wide">
                        {formatPrice(product.price?.priceAmount, product.price?.priceCurrency)}
                      </p>
                      <p className="text-xs text-gray-400 font-light mt-2 line-clamp-2 leading-relaxed">
                        {product.description}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
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

export default SellerProducts;
