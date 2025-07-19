import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link, useSearchParams } from "react-router-dom";
import { Lock, Eye, EyeOff, ArrowLeft, CheckCircle } from "lucide-react";
import { useUserStore } from "../stores/useUserStore";

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const { resetPassword, loading } = useUserStore();
  const [formData, setFormData] = useState({
    code: searchParams.get("code") || "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordReset, setPasswordReset] = useState(false);
  const [errors, setErrors] = useState({});
  // console.log(errors);

  const handleInputChange = e => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    // Clear error when user starts typing
    if (errors[e.target.name]) {
      console.log("user her");

      setErrors(prev => ({
        ...prev,
        [e.target.name]: "",
      }));
    }
  };
  //validation form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.code.trim()) {
      newErrors.code = "code is required";
    } else if (formData.code.trim().length < 6) {
      newErrors.code = "code must be at least 6 characters";
    }

    if (!formData.newPassword) {
      newErrors.newPassword = "newPassword is required";
    } else if (
      !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(
        formData.newPassword
      )
    ) {
      newErrors.newPassword =
        "newPassword must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)";
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = "newPassword must be at least 8 characters ";
    }

    if (!formData.confirmNewPassword) {
      newErrors.confirmNewPassword = "Please confirm your password";
    } else if (formData.newPassword !== formData.confirmNewPassword) {
      newErrors.confirmNewPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleSubmit = async e => {
    e.preventDefault();
    const isValid = validateForm();
    if (!isValid) return;
    if (formData.newPassword !== formData.confirmNewPassword) {
      // This should be handled by the store, but adding here for immediate feedback
      return;
    }

    try {
      const res = await resetPassword(formData);
      res?.success ? setPasswordReset(true) : setPasswordReset(false);
    } catch (error) {
      // Error is handled in the store
    }
  };

  if (passwordReset) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center py-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          <div className="bg-card rounded-2xl shadow-xl border border-border p-8 text-center">
            <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={32} className="text-green-500" />
            </div>

            <h1 className="text-2xl font-bold text-foreground mb-4">
              Password Reset Successfully
            </h1>

            <p className="text-muted-foreground mb-6">
              Your password has been reset successfully. You can now log in with
              your new password.
            </p>

            <Link
              to="/login"
              className="block w-full bg-primary text-white py-3 px-6 rounded-lg font-medium hover:bg-primary/90 transition-colors duration-300"
            >
              Continue to Login
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <div className="bg-card rounded-2xl shadow-xl border border-border p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <Link
              to="/login"
              className="inline-flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors duration-300 mb-6"
            >
              <ArrowLeft size={20} />
              <span>Back to Login</span>
            </Link>

            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock size={32} className="text-primary" />
            </div>

            <h1 className="text-2xl font-bold text-foreground mb-2">
              Reset Password
            </h1>

            <p className="text-muted-foreground">
              Enter your new password below to reset your account password.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="code"
                className="block text-sm font-medium text-foreground mb-2"
              >
                Reset Code
              </label>
              <input
                type="text"
                id="code"
                name="code"
                value={formData.code}
                onChange={handleInputChange}
                required
                className={`w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-300  ${
                  errors.code
                    ? "border-red-500 focus:border-red-500"
                    : "border-border focus:border-primary"
                }`}
                placeholder=" ******"
              />
            </div>

            {errors.code && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-1 text-sm text-red-500"
              >
                {errors.code}
              </motion.p>
            )}

            <div>
              <label
                htmlFor="newPassword"
                className="block text-sm font-medium text-foreground mb-2"
              >
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="newPassword"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  required
                  minLength={8}
                  className={`w-full pr-10 pl-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-300 ${
                    errors.newPassword
                      ? "border-red-500 focus:border-red-500"
                      : "border-border focus:border-primary"
                  }`}
                  placeholder="M12345m@"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors duration-300  ${
                    errors.newPassword
                      ? "border-red-500 focus:border-red-500"
                      : "border-border focus:border-primary"
                  }`}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.newPassword && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-1 text-sm text-red-500"
                >
                  {errors.newPassword}
                </motion.p>
              )}
            </div>

            <div>
              <label
                htmlFor="confirmNewPassword"
                className="block text-sm font-medium text-foreground mb-2"
              >
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmNewPassword"
                  name="confirmNewPassword"
                  value={formData.confirmNewPassword}
                  onChange={handleInputChange}
                  required
                  minLength={8}
                  className="w-full pr-10 pl-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-300"
                  placeholder="Confirm new password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors duration-300"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </button>
                {errors.confirmNewPassword && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-1 text-sm text-red-500"
                  >
                    {errors.confirmNewPassword}
                  </motion.p>
                )}
              </div>
              {formData.newPassword &&
                formData.confirmNewPassword &&
                formData.newPassword !== formData.confirmNewPassword && (
                  <p className="text-red-500 text-sm mt-1">
                    Passwords do not match
                  </p>
                )}
            </div>

            <motion.button
              type="submit"
              disabled={
                loading || formData.newPassword !== formData.confirmNewPassword
              }
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-primary text-white py-3 px-6 rounded-lg font-medium hover:bg-primary/90 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Resetting...</span>
                </>
              ) : (
                <>
                  <Lock size={20} />
                  <span>Reset Password</span>
                </>
              )}
            </motion.button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">
              Remember your password?{" "}
              <Link
                to="/login"
                className="text-primary hover:text-primary/80 font-medium transition-colors duration-300"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ResetPasswordPage;
