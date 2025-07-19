import { useState, useCallback } from "react";
import { useUserStore } from "../stores/useUserStore";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

export const useAuthForm = (isLogin = true) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const { login, signup, loading } = useUserStore();
  const navigate = useNavigate();

  const validateForm = useCallback(() => {
    const newErrors = {};

    // Email validation
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

            // Password validation
        if (!formData.password) {
          newErrors.password = "Password is required";
        } else if (formData.password.length < 8) {
          newErrors.password = "Password must be at least 8 characters";
        } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])[A-Za-z\d!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(formData.password)) {
          newErrors.password = "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character";
        }

    // Signup specific validations
    if (!isLogin) {
      if (!formData.name) {
        newErrors.name = "Name is required";
      } else if (formData.name.length < 2) {
        newErrors.name = "Name must be at least 2 characters";
      }

      if (!formData.phone) {
        newErrors.phone = "Phone number is required";
      } else if (!/^\+?[\d\s-()]+$/.test(formData.phone)) {
        newErrors.phone = "Phone number is invalid";
      }

      if (!formData.confirmPassword) {
        newErrors.confirmPassword = "Please confirm your password";
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, isLogin]);

  const handleChange = useCallback(
    e => {
      const { name, value } = e.target;
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));

      // Clear error when user starts typing
      if (errors[name]) {
        setErrors(prev => ({
          ...prev,
          [name]: "",
        }));
      }
    },
    [errors]
  );

  const handleSubmit = useCallback(
    async e => {
      e.preventDefault();

      if (!validateForm()) {
        toast.error("Please fix the errors in the form");
        return;
      }

      try {
        let result;
        if (isLogin) {
          result = await login(formData.email, formData.password);
        } else {
          result = await signup(formData);
        }

        if (result && result.success) {
          if (isLogin) {
            toast.success("Login successful!");
            navigate("/");
          } else {
            // For signup, show success message and redirect to login
            toast.success("Account created successfully! Please check your email to confirm your account.");
            navigate("/login");
          }
        } else if (result && !result.success) {
          // Error is already handled in the store, but we can add component-specific logic here
          console.log("Auth failed:", result.message);
        }
      } catch (error) {
        // Error is already handled in the store
        console.error("Auth error:", error);
      }
    },
    [formData, isLogin, login, signup, navigate, validateForm]
  );

  const resetForm = useCallback(() => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
    });
    setErrors({});
  }, []);

  return {
    formData,
    errors,
    loading,
    handleChange,
    handleSubmit,
    resetForm,
    setFormData,
    setErrors,
  };
};
