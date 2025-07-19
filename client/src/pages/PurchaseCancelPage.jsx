import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { XCircle, ShoppingCart, Home, RefreshCw } from "lucide-react";

const PurchaseCancelPage = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-2xl"
      >
        <div className="bg-card rounded-2xl shadow-xl border border-border p-8 text-center">
          {/* Cancel Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <XCircle size={48} className="text-red-500" />
          </motion.div>

          {/* Cancel Message */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <h1 className="text-3xl font-bold text-foreground mb-4">
              Payment Cancelled
            </h1>

            <p className="text-lg text-muted-foreground mb-8">
              Your payment was cancelled. No charges have been made to your
              account. You can try again or contact us if you need assistance.
            </p>
          </motion.div>

          {/* Help Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-background rounded-xl p-6 mb-8"
          >
            <h2 className="text-xl font-semibold text-foreground mb-4">
              Need Help?
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="text-left">
                <h3 className="font-medium text-foreground mb-2">
                  Common Issues:
                </h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Insufficient funds in your account</li>
                  <li>• Payment method not supported</li>
                  <li>• Browser security settings</li>
                  <li>• Network connectivity issues</li>
                </ul>
              </div>

              <div className="text-left">
                <h3 className="font-medium text-foreground mb-2">
                  What You Can Do:
                </h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Try a different payment method</li>
                  <li>• Check your account balance</li>
                  <li>• Contact your bank if needed</li>
                  <li>• Reach out to our support team</li>
                </ul>
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
              to="/cart"
              className="flex-1 bg-primary text-white py-3 px-6 rounded-lg font-medium hover:bg-primary/90 transition-colors duration-300 flex items-center justify-center space-x-2"
            >
              <ShoppingCart size={20} />
              <span>Return to Cart</span>
            </Link>

            <Link
              to="/shop"
              className="flex-1 bg-secondary text-foreground py-3 px-6 rounded-lg font-medium hover:bg-secondary/80 transition-colors duration-300 flex items-center justify-center space-x-2"
            >
              <RefreshCw size={20} />
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

          {/* Support Info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-8 pt-8 border-t border-border"
          >
            <p className="text-sm text-muted-foreground mb-2">
              Having trouble? Our support team is here to help!
            </p>
            <p className="text-sm text-muted-foreground">
              Email:{" "}
              <a
                href="mailto:support@electroshop.com"
                className="text-primary hover:text-primary/80"
              >
                support@electroshop.com
              </a>{" "}
              | Phone:{" "}
              <a
                href="tel:+1234567890"
                className="text-primary hover:text-primary/80"
              >
                +1 (555) 123-4567
              </a>
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default PurchaseCancelPage;
