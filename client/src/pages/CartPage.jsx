import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import {
  Trash2,
  Plus,
  Minus,
  ShoppingCart,
  ArrowLeft,
  CreditCard,
  Truck,
  Shield,
  Heart,
} from "lucide-react";
import { useCartStore } from "../stores/useCartStore";
import { useWishlistStore } from "../stores/useWishlistStore";
import { toast } from "react-hot-toast";
import axios from "../lib/axios";

const CartPage = () => {
  const {
    cart,
    removeFromCart,
    updateQuantity,
    applyCoupon,
    removeCoupon,
    coupon,
    total,
    subtotal,
    isCouponApplied,
    clearCart,
  } = useCartStore();

  const { addToWishlist, wishlist } = useWishlistStore();
  const [couponCode, setCouponCode] = useState("");
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const navigate = useNavigate();

  // Calculate total quantity in cart for display
  const cartItemCount = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);

  const handleQuantityChange = async (productId, newQuantity) => {
    if (newQuantity < 1) {
      await removeFromCart(productId);
    } else {
      await updateQuantity(productId, newQuantity);
    }
  };

  const handleRemoveFromCart = async productId => {
    await removeFromCart(productId);
  };

  const handleMoveToWishlist = async product => {
    try {
      // Temporarily suppress toasts by calling the API directly
      const removeResponse = await axios.post("/v1/cart/removeFromCart", { 
        productId: product._id 
      });
      
      if (removeResponse.data && removeResponse.data.success) {
        // Update cart state manually
        const { cart } = useCartStore.getState();
        useCartStore.setState({
          cart: cart.filter(item => item._id !== product._id)
        });
        useCartStore.getState().calculateTotals();
        
        // Add to wishlist
        const wishlistResponse = await axios.post("/v1/wishlist/add", {
          productId: product._id,
        });
        
        if (wishlistResponse.data && wishlistResponse.data.success) {
          // Update wishlist state manually
          const { wishlist } = useWishlistStore.getState();
          useWishlistStore.setState({
            wishlist: [...wishlist, wishlistResponse.data.data]
          });
          
          // Show single success toast
          toast.success("Product moved to wishlist");
        } else {
          throw new Error("Failed to add to wishlist");
        }
      } else {
        throw new Error("Failed to remove from cart");
      }
    } catch (error) {
      toast.error("Failed to move product to wishlist");
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error("Please enter a coupon code");
      return;
    }

    setIsApplyingCoupon(true);
    try {
      await applyCoupon(couponCode);
      setCouponCode("");
    } catch (error) {
      // Error is handled in the store
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      toast.error("Your cart is empty");
      return;
    }
    navigate("/checkout");
  };

  const EmptyCart = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center py-12"
    >
      <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
        <ShoppingCart size={48} className="text-muted-foreground" />
      </div>
      <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
      <p className="text-muted-foreground mb-8">
        Looks like you haven't added any products to your cart yet.
      </p>
      <Link to="/shop">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="btn-primary px-8 py-3"
        >
          Start Shopping
        </motion.button>
      </Link>
    </motion.div>
  );

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-background pt-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <EmptyCart />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center space-x-4">
            <Link to="/shop">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft size={20} />
                <span>Continue Shopping</span>
              </motion.button>
            </Link>
          </div>
          <h1 className="text-3xl font-bold">Shopping Cart ({cartItemCount})</h1>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {cart.map((item, index) => (
                <motion.div
                  key={item._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="card-modern p-6"
                >
                  <div className="flex items-center space-x-4">
                    {/* Product Image */}
                    <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={
                          item.images?.[0] ||
                          item.image ||
                          "/placeholder-product.jpg"
                        }
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <Link to={`/product/${item._id}`}>
                        <h3 className="font-semibold text-lg hover:text-primary transition-colors">
                          {item.name}
                        </h3>
                      </Link>
                      <p className="text-muted-foreground text-sm mb-2">
                        {item.category}
                      </p>
                      <div className="flex items-center space-x-4">
                        <span className="text-lg font-bold text-primary">
                          ${item.price}
                        </span>
                        {item.originalPrice > item.price && (
                          <span className="text-sm text-muted-foreground line-through">
                            ${item.originalPrice}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center space-x-2">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() =>
                          handleQuantityChange(item._id, item.quantity - 1)
                        }
                        className="w-8 h-8 rounded-full bg-secondary hover:bg-secondary/80 flex items-center justify-center transition-colors"
                      >
                        <Minus size={16} />
                      </motion.button>

                      <span className="w-12 text-center font-medium">
                        {item.quantity}
                      </span>

                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() =>
                          handleQuantityChange(item._id, item.quantity + 1)
                        }
                        className="w-8 h-8 rounded-full bg-secondary hover:bg-secondary/80 flex items-center justify-center transition-colors"
                      >
                        <Plus size={16} />
                      </motion.button>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleMoveToWishlist(item)}
                        className="p-2 text-muted-foreground hover:text-red-500 transition-colors"
                        title="Move to wishlist"
                      >
                        <Heart size={20} />
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleRemoveFromCart(item._id)}
                        className="p-2 text-muted-foreground hover:text-red-500 transition-colors"
                        title="Remove from cart"
                      >
                        <Trash2 size={20} />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Order Summary */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <div className="card-modern p-6 sticky top-24">
              <h2 className="text-xl font-bold mb-6">Order Summary</h2>

              {/* Coupon Section */}
              <div className="mb-6">
                <h3 className="font-semibold mb-3">Have a coupon?</h3>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={e => setCouponCode(e.target.value)}
                    placeholder="Enter coupon code"
                    className="flex-1 px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleApplyCoupon}
                    disabled={isApplyingCoupon || !couponCode.trim()}
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isApplyingCoupon ? "Applying..." : "Apply"}
                  </motion.button>
                </div>

                {coupon && isCouponApplied && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-green-800 font-medium">
                        Coupon applied: {coupon.code}
                      </span>
                      <button
                        onClick={removeCoupon}
                        className="text-green-600 hover:text-green-800"
                      >
                        Remove
                      </button>
                    </div>
                    <p className="text-green-600 text-sm">
                      {coupon.discountPercentage}% off
                    </p>
                  </motion.div>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                {coupon && isCouponApplied && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>
                      -$
                      {(subtotal * (coupon.discountPercentage / 100)).toFixed(
                        2
                      )}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="text-green-600">Free</span>
                </div>
                <hr className="border-border" />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>

              {/* Checkout Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleCheckout}
                className="w-full btn-primary py-4 text-lg font-medium mb-4"
              >
                <div className="flex items-center justify-center space-x-2">
                  <CreditCard size={20} />
                  <span>Proceed to Checkout</span>
                </div>
              </motion.button>

              {/* Features */}
              <div className="space-y-3 text-sm text-muted-foreground">
                <div className="flex items-center space-x-2">
                  <Truck size={16} />
                  <span>Free shipping on orders over $99</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Shield size={16} />
                  <span>30-day money-back guarantee</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
