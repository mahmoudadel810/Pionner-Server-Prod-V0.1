import { create } from "zustand";
import axios from "../lib/axios";
import { toast } from "react-hot-toast";

export const usePaymentStore = create((set, get) => ({
  loading: false,
  error: null,
  checkoutSession: null,

  createCheckoutSession: async (cartItems, coupon = null) => {
    set({ loading: true, error: null });
    try {
      const payload = {
        products: cartItems.map(item => ({
          _id: item._id,
          quantity: item.quantity,
          price: item.price,
          name: item.name,
          image: item.image
        }))
      };

      if (coupon) {
        payload.couponCode = coupon.code;
      }

      const response = await axios.post("/v1/payments/createCheckoutSession", payload);
      
      if (response.data && response.data.success) {
        set({ 
          checkoutSession: response.data.data,
          loading: false 
        });
        return { success: true, data: response.data.data };
      } else {
        throw new Error("Failed to create checkout session");
      }
    } catch (error) {
      const errorMessage = 
        error.response?.data?.message || 
        error.message || 
        "Failed to create checkout session";
      toast.error(errorMessage);
      set({ error: errorMessage, loading: false });
      return { success: false, message: errorMessage };
    }
  },

  handleCheckoutSuccess: async (sessionId) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.post("/v1/payments/checkoutSuccess", {
        sessionId
      });
      
      if (response.data && response.data.success) {
        set({ loading: false });
        // Only show toast if it's a new order, not a duplicate
        if (response.data.message.includes("order created")) {
          toast.success("Payment successful! Your order has been placed.");
        }
        return { success: true, data: response.data.data };
      } else {
        throw new Error("Failed to process payment success");
      }
    } catch (error) {
      const errorMessage = 
        error.response?.data?.message || 
        error.message || 
        "Failed to process payment success";
      toast.error(errorMessage);
      set({ error: errorMessage, loading: false });
      return { success: false, message: errorMessage };
    }
  },

  clearCheckoutSession: () => {
    set({ checkoutSession: null, error: null });
  },

  redirectToCheckout: (checkoutUrl) => {
    if (checkoutUrl) {
      window.location.href = checkoutUrl;
    } else {
      toast.error("No checkout URL available");
    }
  }
})); 