import { useState } from "react";
import { useNavigate } from "react-router";
import { useSelector } from "react-redux";
import { useAuthActions } from "../hooks/useAuth";

const Input = ({ label, id, type, value, onChange, onBlur, error, touched, rightElement }) => {
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

const CompleteProfile = () => {
  const navigate = useNavigate();

  const { handleCompleteProfile } = useAuthActions();

  const { loading } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    contact: "",
    role: "USER",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await handleCompleteProfile(formData);

      if (formData.role === "SELLER") {
        navigate("/create-product");
      } else {
        navigate("/");
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="relative min-h-screen bg-brand-light flex flex-col font-sans selection:bg-brand-accent selection:text-white">
      {/* Main split viewport layout */}
      <main className="flex-grow flex flex-col md:flex-row min-h-screen">
        {/* Left column: Fashion editorial image - shown as top banner on mobile, side column on desktop */}
        <div className="relative w-full md:w-1/2 h-72 md:h-auto overflow-hidden bg-neutral-900 flex items-end">
          <img
            src="https://images.unsplash.com/photo-1552109871-65411bb81b4c?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            alt="VELNOX Editorial Collection"
            className="absolute inset-0 w-full h-full object-cover opacity-80 scale-105 animate-fade-in"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/40 to-transparent" />

          <div className="relative p-8 md:p-16 z-10 w-full animate-fade-up">
            <span className="text-[10px] tracking-[0.3em] font-semibold text-brand-accent uppercase mb-3 block">
              Festival / Wedding Collection
            </span>
            <h1 className="font-serif text-3xl md:text-5xl lg:text-6xl text-white font-light tracking-tight leading-[1.1] mb-4">
              Curated Elegance.
              <br />
              Timeless Style.
            </h1>
            <p className="text-neutral-400 font-sans text-xs md:text-sm tracking-wider uppercase">
              Join Velnox
            </p>
          </div>
        </div>

        {/* Right column: Form Card - full width on mobile, half width on desktop */}
        <div className="w-full md:w-1/2 bg-white flex items-center justify-center p-6 sm:p-12 md:p-16 lg:p-24">
          <div className="w-full max-w-md animate-fade-up">
            {/* Brand Header */}
            <div className="mb-10">
              <div className="font-serif text-2xl tracking-[0.25em] text-brand-dark mb-8 select-none">
                VELNOX
              </div>
              <h2 className="font-serif text-3xl tracking-tight text-brand-dark mb-2">
                Complete Your Profile
              </h2>
              <p className="text-gray-400 text-sm">Just one more step to continue.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Contact Number */}
              <Input
                label="Contact Number"
                id="contact"
                type="text"
                value={formData.contact}
                onChange={handleChange}
                onBlur={() => {}}
                error=""
                touched={false}
              />

              {/* Account Type (Role Selection) */}
              <div className="relative mb-8">
                <select
                  name="role"
                  id="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="peer block w-full px-0 py-3 text-base text-brand-dark bg-transparent border-b border-gray-200 focus:outline-none focus:border-brand-accent transition-all appearance-none cursor-pointer"
                >
                  <option value="USER" className="bg-white text-brand-dark">
                    Buyer
                  </option>
                  <option value="SELLER" className="bg-white text-brand-dark">
                    Seller
                  </option>
                </select>
                <label
                  htmlFor="role"
                  className="absolute left-0 -top-3.5 text-xs text-gray-400 peer-focus:text-brand-accent transition-all duration-300 pointer-events-none cursor-text"
                >
                  Account Type
                </label>
                <div className="absolute right-0 bottom-4 pointer-events-none text-gray-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-4 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-brand-dark hover:bg-neutral-800 text-white font-medium h-12 rounded-xl transition-all duration-300 transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center tracking-wider uppercase text-xs"
                >
                  {loading ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
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
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Saving...
                    </>
                  ) : (
                    "Continue"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CompleteProfile;
