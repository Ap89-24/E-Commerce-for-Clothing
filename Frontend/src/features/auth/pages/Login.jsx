

import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router';
import { useAuthActions } from '../hooks/useAuth';
import ContinueWithGoogle from '../components/ContinueWithGoogle';

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
            ? 'border-red-500 focus:border-red-500'
            : 'border-gray-200 focus:border-brand-accent'
        }`}
      />
      <label
        htmlFor={id}
        className={`absolute left-0 top-3 text-sm transition-all duration-300 origin-[0_0] -translate-y-5 scale-75 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:text-gray-400 peer-focus:scale-75 peer-focus:-translate-y-5 cursor-text ${
          touched && error
            ? 'text-red-500 peer-focus:text-red-500'
            : 'text-gray-400 peer-focus:text-brand-accent'
        }`}
      >
        {label}
      </label>
      {rightElement && (
        <div className="absolute right-0 bottom-3 flex items-center">
          {rightElement}
        </div>
      )}
      {touched && error && (
        <p className="text-red-500 text-xs mt-1 transition-all duration-300 font-sans tracking-wide">
          {error}
        </p>
      )}
    </div>
  );
};

const Login = () => {
  const { handleLogin } = useAuthActions();
  const navigate = useNavigate();
  const { loading, error: apiError, user } = useSelector((state) => state.auth);

  // Form State
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [toast, setToast] = useState(null);

  // Helper to show toasts
  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  // Sync API errors
  useEffect(() => {
    if (apiError) {
      showToast('error', apiError);
    }
  }, [apiError]);

  // Sync Successful Login
  useEffect(() => {
    if (user) {
      showToast('success', 'Logged in successfully. Redirecting...');
    }
  }, [user]);

  // Validation function
  const validate = (name, value) => {
    let error = '';
    if (name === 'email') {
      if (!value.trim()) {
        error = 'Email Address is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        error = 'Please enter a valid email address';
      }
    } else if (name === 'password') {
      if (!value) {
        error = 'Password is required';
      } else if (value.length < 6) {
        error = 'Password must be at least 6 characters';
      }
    }
    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (touched[name]) {
      const error = validate(name, value);
      setErrors((prev) => ({ ...prev, [name]: error }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const error = validate(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Mark all fields as touched
    const allTouched = {};
    const validationErrors = {};
    
    Object.keys(formData).forEach((key) => {
      allTouched[key] = true;
      const error = validate(key, formData[key]);
      if (error) {
        validationErrors[key] = error;
      }
    });

    setTouched(allTouched);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      showToast('error', 'Please correct the errors in the form.');
      return;
    }

    try {
      await handleLogin({
        email: formData.email,
        password: formData.password
      });
      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (err) {
      console.error("Login failed", err);
    }
  };

  return (
    <div className="relative min-h-screen bg-brand-light flex flex-col font-sans selection:bg-brand-accent selection:text-white">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-6 left-6 right-6 md:left-auto md:right-6 md:max-w-sm z-50 animate-fade-in">
          <div className={`p-4 rounded-xl border shadow-lg flex items-start space-x-3 bg-white ${
            toast.type === 'success' ? 'border-emerald-500/20 shadow-emerald-500/5' : 'border-red-500/20 shadow-red-500/5'
          }`}>
            <div className="flex-shrink-0 mt-0.5">
              {toast.type === 'success' ? (
                <svg className="h-5 w-5 text-emerald-500" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              )}
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-brand-dark">
                {toast.type === 'success' ? 'Success' : 'Authentication Error'}
              </h3>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">{toast.message}</p>
            </div>
            <button 
              type="button"
              onClick={() => setToast(null)}
              className="text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

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
              Curated Elegance.<br />Timeless Style.
            </h1>
            <p className="text-neutral-400 font-sans text-xs md:text-sm tracking-wider uppercase">
              Join Velnox
            </p>
          </div>
        </div>

        {/* Right column: Form Card - full width on mobile, half width on desktop */}
        <div className="w-full md:w-1/2 bg-white flex items-center justify-center p-6 sm:p-12 md:p-16 lg:p-24">
          <div className="w-full max-w-md animate-fade-up">
            {user ? (
              // Success Screen
              <div className="text-center py-8 animate-fade-up">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-brand-accent/10 border border-brand-accent/20 text-brand-accent mb-6">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </div>
                <h2 className="font-serif text-3xl font-medium tracking-tight text-brand-dark mb-3">
                  Welcome to Velnox
                </h2>
                <p className="text-gray-500 text-sm max-w-sm mx-auto mb-8 font-sans leading-relaxed">
                  You have logged in successfully. Welcome to a curated world of premium fashion and timeless collections.
                </p>
                <div>
                  <Link 
                    to="/" 
                    className="inline-flex items-center justify-center w-full bg-brand-dark hover:bg-neutral-800 text-white font-medium h-12 rounded-xl transition-all duration-300 transform hover:scale-[1.01] active:scale-[0.99] tracking-wider uppercase text-xs"
                  >
                    Go to Homepage
                  </Link>
                </div>
              </div>
            ) : (
              // Login form screen
              <>
                {/* Brand Header */}
                <div className="mb-10">
                  <div className="font-serif text-2xl tracking-[0.25em] text-brand-dark mb-8 select-none">
                    VELNOX
                  </div>
                  <h2 className="font-serif text-3xl tracking-tight text-brand-dark mb-2">
                    Sign In
                  </h2>
                  <p className="text-gray-400 text-sm">
                    Enter your credentials to access your curated collections and orders.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Email Address */}
                  <Input
                    label="Email Address"
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={errors.email}
                    touched={touched.email}
                  />

                  {/* Password */}
                  <Input
                    label="Password"
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={errors.password}
                    touched={touched.password}
                    rightElement={
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-gray-400 hover:text-brand-dark transition-colors focus:outline-none p-1"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? (
                          // Eye off icon
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                          </svg>
                        ) : (
                          // Eye icon
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                          </svg>
                        )}
                      </button>
                    }
                  />
                  <ContinueWithGoogle />

                  {/* Actions */}
                  <div className="space-y-4 pt-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-brand-dark hover:bg-neutral-800 text-white font-medium h-12 rounded-xl transition-all duration-300 transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center tracking-wider uppercase text-xs"
                    >
                      {loading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Signing In...
                        </>
                      ) : (
                        'Sign In'
                      )}
                    </button>

                    <div className="text-center pt-2">
                      <Link 
                        to="/register" 
                        className="text-xs text-gray-400 hover:text-brand-dark transition-colors tracking-wide"
                      >
                        Don't have an account? Register
                      </Link>
                    </div>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Login;
