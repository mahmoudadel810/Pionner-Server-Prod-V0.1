import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle, Package, Mail, Home, ShoppingBag, AlertCircle, Loader2 } from "lucide-react";
import { usePaymentStore } from "../stores/usePaymentStore";
import { useCartStore } from "../stores/useCartStore";
import { useUserStore } from "../stores/useUserStore";
import { toast } from "react-hot-toast";

const PurchaseSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const { handleCheckoutSuccess } = usePaymentStore();
  const { clearCart } = useCartStore();
  const { user, checkAuth, clearLogoutFlag } = useUserStore();
  
  const sessionId = searchParams.get('session_id');
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const processPaymentSuccess = async () => {
      if (sessionId && !orderDetails) { // Only process if we have sessionId and haven't processed yet
        try {
          setLoading(true);
          
          // Force authentication check regardless of current user state
          // This is needed because Stripe redirect might clear the auth state
          try {
            // Clear any logout flags that might prevent auth check
            clearLogoutFlag();
            
            // Check if we have any stored authentication data
            const hasRefreshToken = document.cookie.includes('refreshToken');
            console.log('Has refresh token:', hasRefreshToken);
            
            if (hasRefreshToken) {
              const authResult = await checkAuth(true); // Force auth check
              console.log('Auth check result:', authResult);
              // Wait a bit for the auth state to update
              await new Promise(resolve => setTimeout(resolve, 500));
            } else {
              console.log('No refresh token found, user needs to login again');
            }
          } catch (authError) {
            console.log('Auth check failed, continuing with payment processing:', authError);
          }
          
          const result = await handleCheckoutSuccess(sessionId);
          if (result.success) {
            setOrderDetails(result.data);
            // Clear the cart after successful payment
            try {
              await clearCart();
            } catch (cartError) {
              console.log('Cart clear error (non-critical):', cartError);
              // Don't fail the whole process if cart clearing fails
            }
          }
        } catch (error) {
          console.error('Error processing payment success:', error);
          setError('Failed to process payment confirmation');
        } finally {
          setLoading(false);
        }
      } else if (!sessionId) {
        setLoading(false);
        setError('No session ID found');
      }
    };

    processPaymentSuccess();
  }, [sessionId, handleCheckoutSuccess, clearCart, checkAuth, orderDetails]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center py-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-2xl"
        >
          <div className="bg-card rounded-2xl shadow-xl border border-border p-8 text-center">
            <div className="w-24 h-24 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Loader2 size={48} className="text-blue-500 animate-spin" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-4">
              Processing Your Order...
            </h1>
            <p className="text-muted-foreground">
              Please wait while we confirm your payment and create your order.
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center py-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-2xl"
        >
          <div className="bg-card rounded-2xl shadow-xl border border-border p-8 text-center">
            <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle size={48} className="text-red-500" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-4">
              Something Went Wrong
            </h1>
            <p className="text-muted-foreground mb-6">
              {error}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/login"
                className="flex-1 bg-primary text-white py-3 px-6 rounded-lg font-medium hover:bg-primary/90 transition-colors duration-300"
              >
                Login to View Orders
              </Link>
              <Link
                to="/"
                className="flex-1 bg-secondary text-foreground py-3 px-6 rounded-lg font-medium hover:bg-secondary/80 transition-colors duration-300"
              >
                Go Home
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-2xl"
      >
        <div className="bg-card rounded-2xl shadow-xl border border-border p-8 text-center">
          {/* Success Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle size={48} className="text-green-500" />
          </motion.div>

          {/* Success Message */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <h1 className="text-3xl font-bold text-foreground mb-4">
              Order Confirmed!
            </h1>

            <p className="text-lg text-muted-foreground mb-8">
              Thank you for your purchase! Your order has been successfully
              placed and is being processed.
            </p>
          </motion.div>

          {/* Order Details */}
          {orderDetails && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-background rounded-xl p-6 mb-8 text-left"
            >
              <h2 className="text-xl font-semibold text-foreground mb-4">
                Order Details
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Order ID:</span>
                  <span className="font-medium">{orderDetails.orderId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <span className="font-medium text-green-600">Processing</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment:</span>
                  <span className="font-medium text-green-600">Paid</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* What's Next Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-background rounded-xl p-6 mb-8"
          >
            <h2 className="text-xl font-semibold text-foreground mb-4">
              What's Next?
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex flex-col items-center space-y-3">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Mail size={24} className="text-primary" />
                </div>
                <div className="text-center">
                  <h3 className="font-medium text-foreground mb-1">
                    Confirmation Email
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    You'll receive an order confirmation email shortly
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-center space-y-3">
                <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                  <Package size={24} className="text-blue-500" />
                </div>
                <div className="text-center">
                  <h3 className="font-medium text-foreground mb-1">
                    Order Processing
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    We'll start processing your order immediately
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-center space-y-3">
                <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
                  <CheckCircle size={24} className="text-green-500" />
                </div>
                <div className="text-center">
                  <h3 className="font-medium text-foreground mb-1">
                    Shipping Updates
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Track your order status in your profile
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Link
              to="/profile"
              className="flex-1 bg-primary text-white py-3 px-6 rounded-lg font-medium hover:bg-primary/90 transition-colors duration-300 flex items-center justify-center space-x-2"
            >
              <Package size={20} />
              <span>View Orders</span>
            </Link>

            <Link
              to="/shop"
              className="flex-1 bg-secondary text-foreground py-3 px-6 rounded-lg font-medium hover:bg-secondary/80 transition-colors duration-300 flex items-center justify-center space-x-2"
            >
              <ShoppingBag size={20} />
              <span>Continue Shopping</span>
            </Link>

            <Link
              to="/"
              className="flex-1 bg-background border border-border text-foreground py-3 px-6 rounded-lg font-medium hover:bg-background/80 transition-colors duration-300 flex items-center justify-center space-x-2"
            >
              <Home size={20} />
              <span>Go Home</span>
            </Link>
          </motion.div>

          {/* Additional Info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-8 pt-8 border-t border-border"
          >
            <p className="text-sm text-muted-foreground">
              Need help? Contact our support team at{" "}
              <a
                href="mailto:support@electroshop.com"
                className="text-primary hover:text-primary/80"
              >
                support@electroshop.com
              </a>
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default PurchaseSuccessPage;
