import { create } from "zustand";
import ApiService from "../lib/api";
import axiosInstance from "../lib/axios";
import { toast } from "react-hot-toast";

export const useUserStore = create((set, get) => ({
  user: null,
  loading: false,
  checkingAuth: false,
  justLoggedOut: false, // Add flag to prevent immediate auth check after logout
  error: null,

  // Initialize user from localStorage on store creation
  initializeUser: () => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        set({ user: userData });
        return userData;
      }
    } catch (error) {
      console.error('Error loading user from localStorage:', error);
      localStorage.removeItem('user'); // Clear corrupted data
    }
    return null;
  },

  signup: async ({ name, email, phone, password, confirmPassword }) => {
    set({ loading: true });

    if (password !== confirmPassword) {
      set({ loading: false });
      toast.error("Passwords do not match");
      return { success: false, message: "Passwords do not match" };
    }

    try {
      const response = await ApiService.auth.signup({
        name,
        email,
        phone,
        password,
        confirmPassword,
      });

      set({ loading: false });

      if (response.data && response.data.success) {
        toast.success("Account created successfully! Please check your email to confirm your account.");
        // Don't set user here since they need to confirm email first
        return response.data;
      } else {
        throw new Error(response.data?.message || "Signup failed");
      }
    } catch (error) {
      set({ loading: false });
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "An error occurred during signup.";
      toast.error(errorMessage);
      return { success: false, message: errorMessage };
    }
  },

  // A more robust login function
  login: async (email, password) => {
    set({ loading: true, justLoggedOut: false }); // Clear logout flag on login
    try {
      const response = await ApiService.auth.login({ email, password });
      if (response.data && response.data.success) {
        // Store user data in localStorage for persistence
        localStorage.setItem('user', JSON.stringify(response.data));
        set({ user: response.data, loading: false, justLoggedOut: false });
        toast.success("Login successful!");
        return response.data;
      } else {
        throw new Error(response.data?.message || "Login failed");
      }
    } catch (error) {
      set({ loading: false });
      
      // Handle specific login errors
      const errorMessage = error.response?.data?.message || error.message || "An error occurred during login.";
      
      // Show toast for login errors
      if (error.response?.status === 400 || error.response?.status === 401) {
        toast.error('Invalid email or password');
      }
      
      return { 
        success: false, 
        message: errorMessage,
        error: error.response?.data?.error || 'login_failed'
      };
    }
  },

  forgetPassword: async email => {
    set({ loading: true });
    try {
      const response = await ApiService.auth.forgotPassword({ email });
      set({ loading: false });

      if (response.data && response.data.success) {
        toast.success("Password reset email sent successfully!");
        return response.data;
      } else {
        throw new Error(response.data?.message || "Failed to send reset email");
      }
    } catch (error) {
      set({ loading: false });
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "An error occurred while sending reset email.";
      toast.error(errorMessage);
      return { success: false, message: errorMessage };
    }
  },

  resetPassword: async ({ code, newPassword, confirmNewPassword }) => {
    set({ loading: true });

    if (newPassword !== confirmNewPassword) {
      set({ loading: false });
      toast.error("New passwords do not match");
      return { success: false, message: "New passwords do not match" };
    }

    try {
      const response = await ApiService.auth.resetPassword({
        code,
        newPassword,
        confirmNewPassword,
      });
      set({ loading: false });

      if (response.data && response.data.success) {
        toast.success("Password reset successfully!");
        return response.data;
      } else {
        throw new Error(response.data?.message || "Password reset failed");
      }
    } catch (error) {
      set({ loading: false });
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "An error occurred while resetting password.";
      toast.error(errorMessage);
      return { success: false, message: errorMessage };
    }
  },

  logout: async () => {
    try {
      // Clear user state immediately and set logout flag
      set({ user: null, checkingAuth: false, justLoggedOut: true });
      
      // Try to logout on server
      await ApiService.auth.logout();
      
      // Clear any stored tokens or auth data
      localStorage.removeItem('user');
      sessionStorage.removeItem('user');
      
      // Clear all stores
      await get().clearAllStores();
      
      // Clear logout flag after a delay to allow for navigation
      setTimeout(() => {
        set({ justLoggedOut: false });
      }, 2000);
      
      toast.success("Logged out successfully");
      return { success: true };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "An error occurred during logout";
      console.error("Logout error:", errorMessage);
      
      // Even if logout fails on server, clear local state
      set({ user: null, checkingAuth: false, justLoggedOut: true });
      localStorage.removeItem('user');
      sessionStorage.removeItem('user');
      
      // Clear all stores even on error
      await get().clearAllStores();
      
      // Clear logout flag after a delay
      setTimeout(() => {
        set({ justLoggedOut: false });
      }, 2000);
      
      toast.success("Logged out successfully");
      return { success: true };
    }
  },

  checkAuth: async (force = false) => {
    // Don't check auth if just logged out (unless forced)
    if (get().justLoggedOut && !force) {
      return;
    }
    
    // If not forced and user is null, don't check (normal behavior)
    if (!force && get().user === null) {
      return;
    }
    
    set({ checkingAuth: true });
    
    // Add timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      set({ checkingAuth: false, user: null });
      console.log("Auth check timed out");
    }, 5000); // 5 second timeout
    
    try {
      const response = await ApiService.profile.get();
      clearTimeout(timeoutId);
      
      if (response.data && response.data.success && response.data.data) {
        // Store updated user data in localStorage
        localStorage.setItem('user', JSON.stringify(response.data));
        set({ user: response.data, checkingAuth: false });
        return { success: true, user: response.data };
      } else {
        set({ checkingAuth: false, user: null });
        return { success: false, user: null };
      }
    } catch (error) {
      clearTimeout(timeoutId);
      // Don't show toast for auth check failures as they're expected for non-authenticated users
      console.log("Auth check failed:", error.response?.data?.message || "No valid session");
      set({ checkingAuth: false, user: null });
      return { success: false, error: error.response?.data?.message || "Auth check failed" };
    }
  },

  clearLogoutFlag: () => {
    set({ justLoggedOut: false });
  },

  // Clear all stores when user logs out
  clearAllStores: async () => {
    try {
      const { useCartStore } = await import('./useCartStore');
      const { useWishlistStore } = await import('./useWishlistStore');
      
      // Clear cart store
      useCartStore.setState({ 
        cart: [], 
        coupon: null, 
        total: 0, 
        subtotal: 0, 
        isCouponApplied: false 
      });
      
      // Clear wishlist store
      useWishlistStore.setState({ 
        wishlist: [], 
        loading: false, 
        error: null 
      });
      
      console.log("All stores cleared successfully");
    } catch (error) {
      console.error("Error clearing stores:", error);
    }
  },

  // Force logout - completely clear everything
  forceLogout: async () => {
    // Clear all state
    set({ user: null, checkingAuth: false, justLoggedOut: true });
    
    // Clear all storage
    localStorage.clear();
    sessionStorage.clear();
    
    // Clear cookies by setting them to expire
    document.cookie = "accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    
    // Clear all stores
    await get().clearAllStores();
    
    // Clear logout flag after delay
    setTimeout(() => {
      set({ justLoggedOut: false });
    }, 2000);
    
    console.log("Force logout completed");
  },

  // Debug function to check current auth state
  debugAuthState: () => {
    const state = get();
    console.log("Current auth state:", {
      user: state.user,
      userData: state.user?.data,
      userName: state.user?.data?.name,
      userEmail: state.user?.data?.email,
      checkingAuth: state.checkingAuth,
      justLoggedOut: state.justLoggedOut,
      hasCookies: document.cookie.includes('refreshToken'),
      localStorage: localStorage.getItem('user'),
      sessionStorage: sessionStorage.getItem('user')
    });
  },

  refreshToken: async () => {
    if (get().checkingAuth) return;

    set({ checkingAuth: true });
    try {
      const response = await ApiService.auth.refreshToken();
      set({ checkingAuth: false });
      return response.data;
    } catch (error) {
      // Clear user state and stop checking auth on refresh failure
      set({ user: null, checkingAuth: false });
      console.error("Token refresh failed:", error.response?.data?.message || error.message);
      throw error;
    }
  },

  // Direct user setter to avoid triggering auth checks
  setUser: (userData) => {
    set({ user: userData });
  },
}));

// Subscribe to user state changes to clear other stores when user becomes null
useUserStore.subscribe(
  (state) => state.user,
  (user) => {
    if (user === null) {
      // Clear other stores when user becomes null
      setTimeout(async () => {
        try {
          const { useCartStore } = await import('./useCartStore');
          const { useWishlistStore } = await import('./useWishlistStore');
          
          useCartStore.setState({ 
            cart: [], 
            coupon: null, 
            total: 0, 
            subtotal: 0, 
            isCouponApplied: false 
          });
          
          useWishlistStore.setState({ 
            wishlist: [], 
            loading: false, 
            error: null 
          });
          
          console.log("Stores cleared due to user state change");
        } catch (error) {
          console.error("Error clearing stores on user change:", error);
        }
      }, 100); // Small delay to ensure logout process completes
    }
  }
);

// Axios interceptor for token refresh
let refreshPromise = null;

axiosInstance.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
    
    // Handle 401 errors (token refresh) - but only for non-auth endpoints and when user exists
    if (error.response?.status === 401 && 
        !originalRequest._retry && 
        !originalRequest.url?.includes('/auth/') &&
        useUserStore.getState().user &&
        document.cookie.includes('refreshToken')) { // Only try refresh if refresh token exists
      originalRequest._retry = true;

      try {
        if (refreshPromise) {
          await refreshPromise;
          return axiosInstance(originalRequest);
        }

        refreshPromise = useUserStore.getState().refreshToken();
        await refreshPromise;
        refreshPromise = null;

        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // If refresh token fails, clear user state and don't retry
        refreshPromise = null;
        console.error("Token refresh failed, logging out user:", refreshError.message);
        useUserStore.getState().logout();
        return Promise.reject(error); // Return the original error, not the refresh error
      }
    }
    
    return Promise.reject(error);
  }
);
