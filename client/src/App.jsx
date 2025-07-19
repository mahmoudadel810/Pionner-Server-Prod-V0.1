import React, { Suspense, lazy, useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Toaster } from "react-hot-toast";

// Lazy load pages with better chunk splitting
const HomePage = lazy(() => import("./pages/HomePage"));
const ShopPage = lazy(() => import("./pages/ShopPage"));
const DealsPage = lazy(() => import("./pages/DealsPage"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const CategoriesPage = lazy(() => import("./pages/CategoriesPage"));
const CategoryProductsPage = lazy(() => import("./pages/CategoryProductsPage"));
const SearchPage = lazy(() => import("./pages/SearchPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const SignUpPage = lazy(() => import("./pages/SignUpPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const CartPage = lazy(() => import("./pages/CartPage"));
const CheckoutPage = lazy(() => import("./pages/CheckoutPage"));
const WishlistPage = lazy(() => import("./pages/WishlistPage"));
const ProductDetailPage = lazy(() => import("./pages/ProductDetailPage"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const ForgetPasswordPage = lazy(() => import("./pages/ForgetPasswordPage"));
const ResetPasswordPage = lazy(() => import("./pages/ResetPasswordPage"));
const EmailConfirmationPage = lazy(() => import("./pages/EmailConfirmationPage"));
const PurchaseSuccessPage = lazy(() => import("./pages/PurchaseSuccessPage"));
const PurchaseCancelPage = lazy(() => import("./pages/PurchaseCancelPage"));

// Components
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import LoadingSpinner from "./components/LoadingSpinner";

// Stores
import { useUserStore } from "./stores/useUserStore";
import { useCartStore } from "./stores/useCartStore";
import { useWishlistStore } from "./stores/useWishlistStore";

// Utilities
import { preloadCommonComponents } from "./lib/dynamicImports";

import "./App.css";

// Preload critical pages for better UX
const preloadCriticalPages = () => {
  // Preload shop and product pages as they're commonly accessed
  const shopPromise = import("./pages/ShopPage");
  const productPromise = import("./pages/ProductDetailPage");
  
  // Preload auth pages if user is not logged in
  if (!localStorage.getItem('token')) {
    import("./pages/LoginPage");
    import("./pages/SignUpPage");
  }
};

const AppContent = () => {
  const location = useLocation();
  const { user, checkAuth, checkingAuth, justLoggedOut, initializeUser } = useUserStore();
  const { getCartItems } = useCartStore();
  const { fetchWishlist } = useWishlistStore();

  useEffect(() => {
    // Initialize user from localStorage first
    const storedUser = initializeUser();
    
    // Only check auth if user hasn't just logged out and no stored user
    if (!justLoggedOut && !storedUser) {
      checkAuth();
    }
    // Preload critical pages after initial load
    const timer = setTimeout(preloadCriticalPages, 2000);
    // Preload common UI components
    preloadCommonComponents();
    return () => clearTimeout(timer);
  }, [justLoggedOut, initializeUser]); // Removed checkAuth from dependencies

  useEffect(() => {
    if (user) {
      getCartItems().catch(error => {
        // Silently handle cart fetch errors for authenticated users
        console.log("Cart fetch error:", error);
      });
      fetchWishlist().catch(error => {
        // Silently handle wishlist fetch errors for authenticated users
        console.log("Wishlist fetch error:", error);
      });
    }
  }, [user]); // Removed getCartItems and fetchWishlist from dependencies

  if (checkingAuth) {
    return <LoadingSpinner />;
  }

  // Don't show the global navbar on the homepage since it has its own integrated navbar
  const showGlobalNavbar = location.pathname !== "/";
  // Don't show footer on auth pages and admin dashboard
  const showFooter = !["/login", "/signup", "/forget-password", "/reset-password", "/admin"].includes(location.pathname);

  return (
    <div className="min-h-screen bg-background">
      {showGlobalNavbar && <Navbar />}

      <Suspense fallback={<LoadingSpinner />}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className={showGlobalNavbar ? "pt-20" : ""}
        >
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/shop" element={<ShopPage />} />
            <Route path="/deals" element={<DealsPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/categories/:id/products" element={<CategoryProductsPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/product/:id" element={<ProductDetailPage />} />

            {/* Auth Routes */}
            <Route
              path="/login"
              element={!user ? <LoginPage /> : <Navigate to="/" />}
            />
            <Route
              path="/signup"
              element={!user ? <SignUpPage /> : <Navigate to="/" />}
            />
            <Route path="/forget-password" element={<ForgetPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/confirm-email/:token" element={<EmailConfirmationPage />} />

            {/* Protected Routes */}
            <Route
              path="/profile"
              element={user ? <ProfilePage /> : <Navigate to="/login" />}
            />
            <Route
              path="/cart"
              element={user ? <CartPage /> : <Navigate to="/login" />}
            />
            <Route
              path="/checkout"
              element={user ? <CheckoutPage /> : <Navigate to="/login" />}
            />
            <Route
              path="/wishlist"
              element={user ? <WishlistPage /> : <Navigate to="/login" />}
            />
            <Route
              path="/purchase-success"
              element={<PurchaseSuccessPage />}
            />
            <Route
              path="/purchase-cancel"
              element={<PurchaseCancelPage />}
            />

            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                user?.role === "admin" ? (
                  <AdminDashboard />
                ) : (
                  <Navigate to="/login" />
                )
              }
            />

            {/* Catch all */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </motion.div>
      </Suspense>

      {showFooter && <Footer />}

      <Toaster
        position="bottom-right"
        reverseOrder={false}
        gutter={8}
        containerClassName=""
        containerStyle={{
          bottom: "20px",
          right: "20px",
        }}
        toastOptions={{
          duration: 4000,
          style: {
            background: "rgba(255, 255, 255, 0.95)",
            color: "#374151",
            border: "1px solid rgba(209, 213, 219, 0.5)",
            borderRadius: "12px",
            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
            backdropFilter: "blur(10px)",
            fontSize: "14px",
            fontWeight: "500",
            padding: "16px 20px",
            maxWidth: "400px",
            zIndex: 9999,
            cursor: "pointer",
            marginTop: "0",
            marginBottom: "0",
          },
          success: {
            style: {
              background: "rgba(34, 197, 94, 0.95)",
              color: "white",
              border: "1px solid rgba(34, 197, 94, 0.3)",
            },
            iconTheme: {
              primary: "white",
              secondary: "#22c55e",
            },
          },
          error: {
            style: {
              background: "rgba(239, 68, 68, 0.95)",
              color: "white",
              border: "1px solid rgba(239, 68, 68, 0.3)",
            },
            iconTheme: {
              primary: "white",
              secondary: "#ef4444",
            },
          },
          loading: {
            style: {
              background: "rgba(59, 130, 246, 0.95)",
              color: "white",
              border: "1px solid rgba(59, 130, 246, 0.3)",
            },
            iconTheme: {
              primary: "white",
              secondary: "#3b82f6",
            },
          },
        }}
      />
    </div>
  );
};

const App = () => {
  return <AppContent />;
};

export default App;
