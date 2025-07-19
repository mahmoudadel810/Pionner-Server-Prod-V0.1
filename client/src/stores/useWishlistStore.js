import { create } from "zustand";
import axios from "../lib/axios";
import { toast } from "react-hot-toast";

export const useWishlistStore = create((set, get) => ({
  wishlist: [],
  loading: false,
  error: null,

  // Fetch user's wishlist from server
  fetchWishlist: async () => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get("/v1/wishlist");
      if (response.data && response.data.success) {
        set({ wishlist: response.data.data, loading: false });
        return { success: true, data: response.data.data };
      } else {
        set({ wishlist: [], loading: false });
        return { success: true, data: [] };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to fetch wishlist";
      set({ error: errorMessage, loading: false, wishlist: [] });
      return { success: false, message: errorMessage };
    }
  },

  // Add product to wishlist
  addToWishlist: async (product) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.post("/v1/wishlist/add", {
        productId: product._id,
      });

      if (response.data && response.data.success) {
        set(prevState => ({
          wishlist: [...prevState.wishlist, response.data.data],
          loading: false,
        }));
        toast.success("Product added to wishlist");
        return { success: true, data: response.data.data };
      } else {
        throw new Error("Failed to add product to wishlist");
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to add product to wishlist";
      toast.error(errorMessage);
      set({ error: errorMessage, loading: false });
      return { success: false, message: errorMessage };
    }
  },

  // Remove product from wishlist
  removeFromWishlist: async (productId) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.delete(`/v1/wishlist/remove/${productId}`);
      
      if (response.data && response.data.success) {
        set(prevState => ({
          wishlist: prevState.wishlist.filter(item => item._id !== productId),
          loading: false,
        }));
        toast.success("Product removed from wishlist");
        return { success: true };
      } else {
        throw new Error("Failed to remove product from wishlist");
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to remove product from wishlist";
      toast.error(errorMessage);
      set({ error: errorMessage, loading: false });
      return { success: false, message: errorMessage };
    }
  },

  // Clear wishlist
  clearWishlist: async () => {
    set({ loading: true, error: null });
    try {
      const response = await axios.delete("/v1/wishlist/clear");
      
      if (response.data && response.data.success) {
        set({ wishlist: [], loading: false });
        toast.success("Wishlist cleared successfully");
        return { success: true };
      } else {
        throw new Error("Failed to clear wishlist");
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to clear wishlist";
      toast.error(errorMessage);
      set({ error: errorMessage, loading: false });
      return { success: false, message: errorMessage };
    }
  },

  // Check if product is in wishlist
  isInWishlist: (productId) => {
    return get().wishlist.some(item => item._id === productId);
  },

  // Get wishlist count
  getWishlistCount: () => {
    return get().wishlist.length;
  },

  // Toggle wishlist status (add/remove)
  toggleWishlist: async (product) => {
    const isInWishlist = get().isInWishlist(product._id);
    
    if (isInWishlist) {
      return get().removeFromWishlist(product._id);
    } else {
      return get().addToWishlist(product);
    }
  },
}));
