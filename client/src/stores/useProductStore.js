import { create } from "zustand";
import toast from "react-hot-toast";
import axios from "../lib/axios";

export const useProductStore = create(set => ({
  products: [],
  loading: false,
  error: null,

  setProducts: products => set({ products }),

  createProduct: async productData => {
    set({ loading: true, error: null });
    try {
      const response = await axios.post(
        "/v1/products/createProduct",
        productData
      );
      if (response.data) {
        set(prevState => ({
          products: [...prevState.products, response.data],
          loading: false,
        }));
        toast.success("Product created successfully");
        return { success: true, data: response.data };
      } else {
        throw new Error("Failed to create product");
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.error ||
        error.message ||
        "Failed to create product";
      toast.error(errorMessage);
      set({ loading: false, error: errorMessage });
      return { success: false, message: errorMessage };
    }
  },

  fetchAllProducts: async () => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get("/v1/products/getProducts?limit=50");
      if (response.data && response.data.success) {
        // Handle paginated response
        const products = response.data.data || [];
        set({ products, loading: false });
        return { success: true, data: products };
      } else {
        set({ products: [], loading: false });
        return { success: true, data: [] };
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.error || "Failed to fetch products";
      toast.error(errorMessage);
      set({ error: errorMessage, loading: false, products: [] });
      return { success: false, message: errorMessage };
    }
  },

  fetchProductsByCategory: async category => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get(
        `/v1/products/getProductsByCategory/${category}`
      );
      if (response.data && response.data.success) {
        set({ products: response.data.data, loading: false });
        return { success: true, data: response.data.data };
      } else {
        set({ products: [], loading: false });
        return { success: true, data: [] };
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.error || "Failed to fetch products";
      toast.error(errorMessage);
      set({ error: errorMessage, loading: false, products: [] });
      return { success: false, message: errorMessage };
    }
  },

  deleteProduct: async productId => {
    set({ loading: true, error: null });
    try {
      const response = await axios.delete(
        `/v1/products/deleteProduct/${productId}`
      );
      if (response.data) {
        set(prevProducts => ({
          products: prevProducts.products.filter(
            product => product._id !== productId
          ),
          loading: false,
        }));
        toast.success("Product deleted successfully");
        return { success: true };
      } else {
        throw new Error("Failed to delete product");
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.error || "Failed to delete product";
      toast.error(errorMessage);
      set({ loading: false, error: errorMessage });
      return { success: false, message: errorMessage };
    }
  },

  toggleFeaturedProduct: async productId => {
    set({ loading: true, error: null });
    try {
      const response = await axios.patch(
        `/v1/products/toggleFeaturedProduct/${productId}`
      );
      if (response.data) {
        set(prevProducts => ({
          products: prevProducts.products.map(product =>
            product._id === productId
              ? { ...product, isFeatured: response.data.isFeatured }
              : product
          ),
          loading: false,
        }));
        toast.success("Product updated successfully");
        return { success: true, data: response.data };
      } else {
        throw new Error("Failed to update product");
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.error || "Failed to update product";
      toast.error(errorMessage);
      set({ loading: false, error: errorMessage });
      return { success: false, message: errorMessage };
    }
  },

  fetchFeaturedProducts: async () => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get("/v1/products/getFeaturedProducts");
      if (response.data && response.data.success) {
        set({ products: response.data.data, loading: false });
        return { success: true, data: response.data.data };
      } else {
        set({ products: [], loading: false });
        return { success: true, data: [] };
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.error || "Failed to fetch featured products";
      toast.error(errorMessage);
      set({ error: errorMessage, loading: false, products: [] });
      return { success: false, message: errorMessage };
    }
  },
}));
