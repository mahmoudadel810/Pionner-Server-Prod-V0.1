import { create } from "zustand";
import axios from "../lib/axios";
import { toast } from "react-hot-toast";

export const useCartStore = create((set, get) => ({
  cart: [],
  coupon: null,
  total: 0,
  subtotal: 0,
  isCouponApplied: false,

  // Helper function to check if product is in cart
  isInCart: (productId) => {
    const { cart } = get();
    return cart.some(item => item._id === productId);
  },

  getMyCoupon: async () => {
    try {
      const response = await axios.get("/v1/coupons/getCoupon");
      if (response.data) {
        set({ coupon: response.data });
        return { success: true, data: response.data };
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch coupon";
      toast.error(errorMessage);
      return { success: false, message: errorMessage };
    }
  },

  applyCoupon: async code => {
    try {
      const response = await axios.post("/v1/coupons/validateCoupon", { code });
      if (response.data) {
        set({ coupon: response.data, isCouponApplied: true });
        get().calculateTotals();
        toast.success("Coupon applied successfully");
        return { success: true, data: response.data };
      } else {
        throw new Error("Invalid coupon response");
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to apply coupon";
      toast.error(errorMessage);
      return { success: false, message: errorMessage };
    }
  },

  removeCoupon: () => {
    set({ coupon: null, isCouponApplied: false });
    get().calculateTotals();
    toast.success("Coupon removed");
    return { success: true };
  },

  getCartItems: async () => {
    try {
      const response = await axios.get("/v1/cart/getCartProducts");
      if (response.data && response.data.success) {
        const cartItems = response.data.data || [];
        set({ cart: cartItems });
        // Calculate totals after state update
        setTimeout(() => {
          get().calculateTotals();
        }, 0);
        return { success: true, data: cartItems };
      } else {
        set({ cart: [] });
        return { success: true, data: [] };
      }
    } catch (error) {
      // Don't show toast for authentication errors - they're expected for non-authenticated users
      if (error.response?.status === 401) {
        set({ cart: [] });
        return { success: false, message: "Authentication required" };
      }
      
      set({ cart: [] });
      const errorMessage =
        error.response?.data?.message || "Failed to fetch cart items";
      toast.error(errorMessage);
      return { success: false, message: errorMessage };
    }
  },

  clearCart: async () => {
    try {
      await axios.post("/v1/cart/removeFromCart", {});
      set({ cart: [], coupon: null, total: 0, subtotal: 0 });
      toast.success("Cart cleared successfully");
      return { success: true };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to clear cart";
      toast.error(errorMessage);
      return { success: false, message: errorMessage };
    }
  },

  toggleCart: async product => {
    try {
      const { cart } = get();
      const existingItem = cart.find(item => item._id === product._id);
      
      if (existingItem) {
        // Product is in cart, remove it
        const response = await axios.post("/v1/cart/removeFromCart", {
          productId: product._id,
        });

        if (response.data && response.data.success) {
          set(prevState => ({
            cart: prevState.cart.filter(item => item._id !== product._id),
          }));
          get().calculateTotals();
          toast.success("Product removed from cart");
          return { success: true, action: "removed", data: response.data };
        } else {
          throw new Error("Failed to remove product from cart");
        }
      } else {
        // Product is not in cart, add it
        const response = await axios.post("/v1/cart/addToCart", {
          productId: product._id,
        });

        if (response.data && response.data.success) {
          set(prevState => ({
            cart: [...prevState.cart, { ...product, quantity: 1 }],
          }));
          
          // Calculate totals after state update
          setTimeout(() => {
            get().calculateTotals();
          }, 0);
          
          toast.success("Product added to cart");
          return { success: true, action: "added", data: response.data };
        } else {
          throw new Error("Failed to add product to cart");
        }
      }
    } catch (error) {
      // Handle authentication errors
      if (error.response?.status === 401) {
        return { success: false, message: "Please login to manage cart" };
      }
      
      const errorMessage =
        error.response?.data?.message || "Failed to update cart";
      toast.error(errorMessage);
      return { success: false, message: errorMessage };
    }
  },

  // Keep the original addToCart for backward compatibility
  addToCart: async product => {
    try {
      const response = await axios.post("/v1/cart/addToCart", {
        productId: product._id,
      });

      if (response.data && response.data.success) {
        // Update cart state based on server response
        set(prevState => {
          const existingItem = prevState.cart.find(
            item => item._id === product._id
          );
          const newCart = existingItem
            ? prevState.cart.map(item =>
                item._id === product._id
                  ? { ...item, quantity: item.quantity + 1 }
                  : item
              )
            : [...prevState.cart, { ...product, quantity: 1 }];
          return { cart: newCart };
        });
        
        // Calculate totals after state update
        setTimeout(() => {
          get().calculateTotals();
        }, 0);
        
        toast.success("Product added to cart");
        return { success: true, data: response.data };
      } else {
        throw new Error("Failed to add product to cart");
      }
    } catch (error) {
      // Handle authentication errors - even if interceptor retries, we should still show auth error
      if (error.response?.status === 401) {
        // Don't update cart state for auth errors
        return { success: false, message: "Please login to add items to cart" };
      }
      
      const errorMessage =
        error.response?.data?.message || "Failed to add product to cart";
      toast.error(errorMessage);
      return { success: false, message: errorMessage };
    }
  },

  removeFromCart: async productId => {
    try {
      await axios.post(`/v1/cart/removeFromCart`, { productId });
      set(prevState => ({
        cart: prevState.cart.filter(item => item._id !== productId),
      }));
      get().calculateTotals();
      toast.success("Product removed from cart");
      return { success: true };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to remove product from cart";
      toast.error(errorMessage);
      return { success: false, message: errorMessage };
    }
  },

  updateQuantity: async (productId, quantity) => {
    if (quantity === 0) {
      return get().removeFromCart(productId);
    }

    try {
      const response = await axios.put(`/v1/cart/updateQuantity/${productId}`, {
        quantity,
      });

      if (response.data) {
        set(prevState => ({
          cart: prevState.cart.map(item =>
            item._id === productId ? { ...item, quantity } : item
          ),
        }));
        get().calculateTotals();
        return { success: true, data: response.data };
      } else {
        throw new Error("Failed to update quantity");
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to update quantity";
      toast.error(errorMessage);
      return { success: false, message: errorMessage };
    }
  },

  calculateTotals: () => {
    const { cart, coupon } = get();
    const subtotal = cart.reduce(
      (sum, item) => sum + (item.price || 0) * (item.quantity || 1),
      0
    );
    let total = subtotal;

    if (coupon && coupon.discountPercentage) {
      const discount = subtotal * (coupon.discountPercentage / 100);
      total = subtotal - discount;
    }

    // Only update if values actually changed to prevent infinite loops
    const currentState = get();
    if (currentState.subtotal !== subtotal || currentState.total !== total) {
      set({ subtotal, total });
    }
    
    return { subtotal, total };
  },
}));
