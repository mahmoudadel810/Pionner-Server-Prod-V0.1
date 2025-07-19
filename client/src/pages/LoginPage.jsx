import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, ArrowRight, AlertCircle } from "lucide-react";
import { useUserStore } from "../stores/useUserStore";
import { toast } from "react-hot-toast";

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const { login, loading } = useUserStore();
  const navigate = useNavigate();

  const handleChange = e => {
    const { name, value } = e.target;

    // Update form data
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    // Real-time validation
    const newErrors = { ...errors };

    if (name === "email") {
      if (!value.trim()) {
        newErrors.email = "Email is required";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        newErrors.email = "Please enter a valid email address";
      } else if (value.length > 254) {
        newErrors.email = "Email is too long";
      } else {
        delete newErrors.email;
      }
    }

    if (name === "password") {
      if (!value) {
        newErrors.password = "Password is required";
      } else if (value.length < 8) {
        newErrors.password = "Password must be at least 8 characters";
      } else if (value.length > 128) {
        newErrors.password = "Password is too long";
      } else if (!/[a-z]/.test(value)) {
        newErrors.password =
          "Password must contain at least one lowercase letter";
      } else if (!/[A-Z]/.test(value)) {
        newErrors.password =
          "Password must contain at least one uppercase letter";
      } else if (!/\d/.test(value)) {
        newErrors.password = "Password must contain at least one number";
      } else if (!/[@$!%*?&#]/.test(value)) {
        newErrors.password =
          "Password must contain at least one special character !@#$...";
      } else {
        delete newErrors.password;
      }
    }

    setErrors(newErrors);
  };

  const handleBlur = e => {
    const { name } = e.target;
    setTouched(prev => ({
      ...prev,
      [name]: true,
    }));
  };

  const handleSubmit = async e => {
    e.preventDefault();

    // Mark all fields as touched
    setTouched({ email: true, password: true });

    // Comprehensive validation
    const newErrors = {};

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    } else if (formData.email.length > 254) {
      newErrors.email = "Email is too long";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    } else if (formData.password.length > 128) {
      newErrors.password = "Password is too long";
    } else if (!/[a-z]/.test(formData.password)) {
      newErrors.password =
        "Password must contain at least one lowercase letter";
    } else if (!/[A-Z]/.test(formData.password)) {
      newErrors.password =
        "Password must contain at least one uppercase letter";
    } else if (!/\d/.test(formData.password)) {
      newErrors.password = "Password must contain at least one number";
    } else if (!/[@$!%*?&#]/.test(formData.password)) {
      newErrors.password =
        "Password must contain at least one special character !@#$...";
    }

    setErrors(newErrors);

    // If there are validation errors, don't submit
    if (Object.keys(newErrors).length > 0) {
      toast.error("Please fix the errors before submitting");
      return;
    }

    try {
      const loginData = await login(formData.email.trim(), formData.password);

      if (loginData && loginData.success) {
        navigate("/");
      } else {
        // Handle specific login errors that don't come from the server
        if (loginData && loginData.error) {
          switch (loginData.error) {
            case "invalid_credentials":
              setErrors({
                email: "Invalid email or password",
                password: "Invalid email or password",
              });
              break;
            case "account_locked":
              toast.error("Account is locked. Please contact support.");
              break;
            case "email_not_verified":
              toast.error("Please verify your email address first");
              break;
            default:
              // Let axios interceptor handle server errors
              break;
          }
        }
      }
    } catch (error) {
      console.error("Login error:", error);

      // Handle network and other errors (not server response errors)
      if (error.name === "NetworkError" || error.code === "NETWORK_ERROR") {
        toast.error(
          "Network error. Please check your connection and try again."
        );
      } else if (error.request && !error.response) {
        // Request was made but no response received
        toast.error("No response from server. Please try again.");
      } else if (!error.response) {
        // Something else happened (not a server error)
        toast.error("An unexpected error occurred. Please try again.");
      }
      // For server response errors (400, 401, 403, etc.), let axios interceptor handle them
    }
  };

  const getInputClassName = fieldName => {
    const hasError = errors[fieldName] && touched[fieldName];
    const hasValue = formData[fieldName] && formData[fieldName].length > 0;

    return `w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-300 ${
      hasError
        ? "border-red-500 focus:border-red-500 focus:ring-red-500/50 bg-red-50"
        : hasValue
          ? "border-green-500 focus:border-primary focus:ring-primary/50"
          : "border-border focus:border-primary focus:ring-primary/50"
    }`;
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-md w-full space-y-8"
      >
        {/* Header */}
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-600 to-orange-500 rounded-full flex items-center justify-center mb-6"
          >
            <span className="text-white font-bold text-2xl">E</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-3xl font-bold text-foreground"
          >
            Welcome back
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-2 text-muted-foreground"
          >
            Sign in to your account to continue
          </motion.p>
        </div>

        {/* Form */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-8 space-y-6"
          onSubmit={handleSubmit}
          noValidate
        >
          <div className="space-y-4">
            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-foreground mb-2"
              >
                Email address *
              </label>
              <div className="relative">
                <Mail
                  className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                    errors.email && touched.email
                      ? "text-red-500"
                      : "text-muted-foreground"
                  }`}
                  size={20}
                />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={getInputClassName("email")}
                  placeholder="Enter your email"
                  maxLength={254}
                />
                {errors.email && touched.email && (
                  <AlertCircle
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-500"
                    size={20}
                  />
                )}
              </div>
              {errors.email && touched.email && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-1 text-sm text-red-500 flex items-center"
                >
                  <AlertCircle size={14} className="mr-1" />
                  {errors.email}
                </motion.p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-foreground mb-2"
              >
                Password *
              </label>
              <div className="relative">
                <Lock
                  className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                    errors.password && touched.password
                      ? "text-red-500"
                      : "text-muted-foreground"
                  }`}
                  size={20}
                />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={
                    showPassword
                      ? getInputClassName("password")
                      : getInputClassName("password")
                  }
                  placeholder="Enter your password"
                  maxLength={128}
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
                  {errors.password && touched.password && (
                    <AlertCircle className="text-red-500" size={20} />
                  )}
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-muted-foreground hover:text-foreground transition-colors duration-300"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
              {errors.password && touched.password && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-1 text-sm text-red-500 flex items-center"
                >
                  <AlertCircle size={14} className="mr-1" />
                  {errors.password}
                </motion.p>
              )}
              {/* Password Requirements */}
              <div className="mt-2 text-xs text-muted-foreground">
                <p>Password must contain:</p>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li
                    className={
                      formData.password.length >= 8 ? "text-green-600" : ""
                    }
                  >
                    At least 8 characters
                  </li>
                  <li
                    className={
                      /[a-z]/.test(formData.password) ? "text-green-600" : ""
                    }
                  >
                    One lowercase letter
                  </li>
                  <li
                    className={
                      /[A-Z]/.test(formData.password) ? "text-green-600" : ""
                    }
                  >
                    One uppercase letter
                  </li>
                  <li
                    className={
                      /[@$!%*?&#]/.test(formData.password)
                        ? "text-green-600"
                        : ""
                    }
                  >
                    One special character !@#$...
                  </li>
                  <li
                    className={
                      /\d/.test(formData.password) ? "text-green-600" : ""
                    }
                  >
                    One number
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Forgot Password Link */}
          <div className="flex items-center justify-between">
            <Link
              to="/forget-password"
              className="text-sm text-primary hover:text-primary/80 transition-colors duration-300"
            >
              Forgot your password?
            </Link>
          </div>

          {/* Submit Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading || Object.keys(errors).length > 0}
            className="w-full btn-primary py-3 text-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Signing in...
              </div>
            ) : (
              <div className="flex items-center justify-center">
                Sign in
                <ArrowRight size={20} className="ml-2" />
              </div>
            )}
          </motion.button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-background text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

          {/* Social Login Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              className="w-full flex items-center justify-center px-4 py-2 border border-border rounded-lg hover:bg-secondary transition-colors duration-300"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Google
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              className="w-full flex items-center justify-center px-4 py-2 border border-border rounded-lg hover:bg-secondary transition-colors duration-300"
            >
              <svg
                className="w-5 h-5 mr-2"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
              </svg>
              Apple
            </motion.button>
          </div>

          {/* Sign Up Link */}
          <div className="text-center">
            <p className="text-muted-foreground">
              Don't have an account?{" "}
              <Link
                to="/signup"
                className="text-primary hover:text-primary/80 font-medium transition-colors duration-300"
              >
                Sign up
              </Link>
            </p>
          </div>
        </motion.form>
      </motion.div>
    </div>
  );
};

export default LoginPage;
