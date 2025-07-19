import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useSearchParams } from "react-router-dom";
import {
  Filter,
  Grid,
  List,
  Search,
  SlidersHorizontal,
  ChevronDown,
} from "lucide-react";
import { useProductStore } from "../stores/useProductStore";
import { useCartStore } from "../stores/useCartStore";
import { useWishlistStore } from "../stores/useWishlistStore";
import ProductCard from "../components/ProductCard";
import { toast } from "react-hot-toast";

const ShopPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    category: searchParams.get("category") || "",
    priceRange: [0, 1000],
    sortBy: "newest",
  });

  const { products, fetchAllProducts, loading } = useProductStore();
  const { toggleCart, isInCart } = useCartStore();
  const { toggleWishlist, wishlist } = useWishlistStore();

  useEffect(() => {
    let isMounted = true;
    const fetchProducts = async () => {
      try {
        const result = await fetchAllProducts();
        if (!isMounted) return;

        if (!result?.success) {
          console.log("Failed to fetch products:", result?.message);
        }
      } catch (error) {
        if (!isMounted) return;
        console.error("Error fetching products:", error);
      }
    };

    fetchProducts();

    return () => {
      isMounted = false;
    };
  }, [fetchAllProducts]);

  useEffect(() => {
    const category = searchParams.get("category");
    if (category) {
      setFilters(prev => ({ ...prev, category }));
    }
  }, [searchParams]);

  const handleToggleCart = async product => {
    try {
      const result = await toggleCart(product);
      if (!result.success) {
        toast.error(result.message || "Failed to update cart");
      }
    } catch (error) {
      // Error is already handled by the result check above
    }
  };

  const handleWishlistToggle = async product => {
    try {
      await toggleWishlist(product);
    } catch (error) {
      // Error is already handled in the store
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleCategoryChange = category => {
    handleFilterChange("category", category);
    if (category) {
      setSearchParams({ category });
    } else {
      setSearchParams({});
    }
  };

  const filteredProducts = products.filter(product => {
    if (filters.category) {
      // Normalize both the product category and filter category for comparison
      const normalizedProductCategory = product.category.toLowerCase().replace(/\s+/g, '-');
      const normalizedFilterCategory = filters.category.toLowerCase();
      
      if (normalizedProductCategory !== normalizedFilterCategory) {
        return false;
      }
    }
    
    if (
      product.price < filters.priceRange[0] ||
      product.price > filters.priceRange[1]
    ) {
      return false;
    }
    return true;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (filters.sortBy) {
      case "price-low":
        return a.price - b.price;
      case "price-high":
        return b.price - a.price;
      case "name":
        return a.name.localeCompare(b.name);
      case "newest":
      default:
        return new Date(b.createdAt) - new Date(a.createdAt);
    }
  });

  const categories = [
    "smartphones",
    "laptops", 
    "gaming",
    "smart-home",
    "audio",
    "tablets"
  ];

  const FilterSection = () => (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: showFilters ? "auto" : 0 }}
      className="overflow-hidden"
    >
      <div className="bg-white/95 backdrop-blur-lg shadow-lg border border-gray-200/50 rounded-xl p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">Category</label>
            <select
              value={filters.category}
              onChange={e => handleCategoryChange(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-gray-50 focus:bg-white transition-all duration-200"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>
                  {category.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                </option>
              ))}
            </select>
          </div>

          {/* Price Range Filter */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              Price Range
            </label>
            <div className="flex space-x-2">
              <input
                type="number"
                placeholder="Min"
                value={filters.priceRange[0]}
                onChange={e =>
                  handleFilterChange("priceRange", [
                    parseInt(e.target.value) || 0,
                    filters.priceRange[1],
                  ])
                }
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-gray-50 focus:bg-white transition-all duration-200"
              />
              <span className="flex items-center text-gray-500">-</span>
              <input
                type="number"
                placeholder="Max"
                value={filters.priceRange[1]}
                onChange={e =>
                  handleFilterChange("priceRange", [
                    filters.priceRange[0],
                    parseInt(e.target.value) || 1000,
                  ])
                }
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-gray-50 focus:bg-white transition-all duration-200"
              />
            </div>
          </div>

          {/* Sort Filter */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">Sort By</label>
            <select
              value={filters.sortBy}
              onChange={e => handleFilterChange("sortBy", e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-gray-50 focus:bg-white transition-all duration-200"
            >
              <option value="newest">Newest First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="name">Name: A to Z</option>
            </select>
          </div>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 pt-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-orange-500 bg-clip-text text-transparent">
            {filters.category
              ? filters.category.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
              : "All Products"}
          </h1>
          <p className="text-gray-600 text-lg">
            {sortedProducts.length} products found
          </p>
        </motion.div>

        {/* Filters Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6"
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 px-4 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all duration-200 bg-white/95 backdrop-blur-sm shadow-sm"
          >
            <Filter size={20} className="text-gray-600" />
            <span className="font-medium text-gray-700">Filters</span>
            <ChevronDown
              size={16}
              className={`transition-transform duration-200 text-gray-500 ${showFilters ? "rotate-180" : ""}`}
            />
          </motion.button>

          {/* View Mode Toggle */}
          <div className="flex items-center space-x-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setViewMode("grid")}
              className={`p-2.5 rounded-xl transition-all duration-200 ${
                viewMode === "grid"
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                  : "bg-white/95 backdrop-blur-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 border border-gray-200 shadow-sm"
              }`}
            >
              <Grid size={20} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setViewMode("list")}
              className={`p-2.5 rounded-xl transition-all duration-200 ${
                viewMode === "list"
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                  : "bg-white/95 backdrop-blur-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 border border-gray-200 shadow-sm"
              }`}
            >
              <List size={20} />
            </motion.button>
          </div>
        </motion.div>

        {/* Filters */}
        <FilterSection />

        {/* Products Grid */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="relative">
              <div className="w-12 h-12 border-4 border-gray-200 rounded-full animate-spin"></div>
              <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-t-blue-600 rounded-full animate-spin"></div>
            </div>
          </div>
        ) : sortedProducts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <div className="bg-white/95 backdrop-blur-lg shadow-lg border border-gray-200/50 rounded-xl p-8 max-w-md mx-auto">
              <h2 className="text-2xl font-bold mb-4 text-gray-900">No products found</h2>
              <p className="text-gray-600">
                Try adjusting your filters or search criteria.
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`grid gap-6 ${
              viewMode === "grid"
                ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                : "grid-cols-1"
            }`}
          >
            {sortedProducts.map((product, index) => (
              <ProductCard
                key={product._id}
                product={product}
                index={index}
                onAddToCart={handleToggleCart}
                onWishlistToggle={handleWishlistToggle}
                isInWishlist={wishlist.some(item => item._id === product._id)}
                viewMode={viewMode}
              />
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ShopPage;
