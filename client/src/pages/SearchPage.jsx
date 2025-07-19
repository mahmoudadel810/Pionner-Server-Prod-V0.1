import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Skeleton } from "../components/ui/skeleton";
import { Search, Grid3X3, List, Filter, Package, Star, ShoppingCart, Heart, Eye, X, RefreshCw, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import axios from "../lib/axios";
import toast from "react-hot-toast";
import { useCartStore } from "../stores/useCartStore";
import { useWishlistStore } from "../stores/useWishlistStore";
import { useUserStore } from "../stores/useUserStore";

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get('q') || '';
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState(query);
  const [sortBy, setSortBy] = useState("relevance");
  const [viewMode, setViewMode] = useState("grid");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [priceRange, setPriceRange] = useState("all");
  const [searchTimeout, setSearchTimeout] = useState(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [paginationInfo, setPaginationInfo] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    hasNextPage: false,
    hasPrevPage: false
  });

  const { toggleCart, isInCart } = useCartStore();
  const { wishlist, addToWishlist, removeFromWishlist } = useWishlistStore();
  const { user } = useUserStore();

  // Debounced search function
  const debouncedSearch = useCallback((query) => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    const timeout = setTimeout(() => {
      fetchProducts(query, 1);
    }, 300);
    
    setSearchTimeout(timeout);
  }, [searchTimeout]);

  // Fetch products on mount and when query changes
  useEffect(() => {
    if (query) {
      setSearchQuery(query);
      fetchProducts(query, 1);
    }
  }, [query]);

  // Fetch when filters change
  useEffect(() => {
    if (query) {
      const timeoutId = setTimeout(() => {
        fetchProducts(query, 1);
      }, 300);
      return () => clearTimeout(timeoutId);
    }
  }, [sortBy, categoryFilter, priceRange, itemsPerPage]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTimeout]);

  const fetchProducts = async (searchTerm = searchQuery, page = currentPage) => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        search: searchTerm.trim(),
        sortBy,
        page: page.toString(),
        limit: itemsPerPage.toString(),
        ...(categoryFilter && categoryFilter !== "all" && { category: categoryFilter }),
        ...(priceRange && priceRange !== "all" && { priceRange })
      };

      const queryString = new URLSearchParams(params).toString();
      const response = await axios.get(`/v1/products/search?${queryString}`);
      
      if (response.data.success) {
        const data = response.data.data;
        setProducts(data.data || data);
        
        // Update pagination info
        if (data.pagination) {
          const paginationData = {
            currentPage: data.pagination.currentPage || page,
            totalPages: data.pagination.totalPages || 1,
            totalItems: data.pagination.totalItems || 0,
            hasNextPage: data.pagination.hasNextPage || false,
            hasPrevPage: data.pagination.hasPrevPage || false
          };
          setPaginationInfo(paginationData);
          setCurrentPage(paginationData.currentPage);
          setTotalPages(paginationData.totalPages);
          setTotalItems(paginationData.totalItems);
        }
      } else {
        setError("Failed to fetch products");
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      setError(error.response?.data?.message || "Failed to fetch products");
      toast.error("Failed to load search results");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    setCurrentPage(1);
    debouncedSearch(value);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setCurrentPage(1);
    navigate("/search");
  };

  const handleSortChange = (value) => {
    setSortBy(value);
    setCurrentPage(1);
  };

  const handleCategoryFilterChange = (value) => {
    setCategoryFilter(value);
    setCurrentPage(1);
  };

  const handlePriceRangeChange = (value) => {
    setPriceRange(value);
    setCurrentPage(1);
  };

  const handleRefresh = () => {
    setCurrentPage(1);
    fetchProducts(query, 1);
  };

  // Pagination handlers
  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      fetchProducts(query, page);
    }
  };

  const goToNextPage = () => {
    if (paginationInfo.hasNextPage) {
      goToPage(currentPage + 1);
    }
  };

  const goToPrevPage = () => {
    if (paginationInfo.hasPrevPage) {
      goToPage(currentPage - 1);
    }
  };

  const goToFirstPage = () => {
    goToPage(1);
  };

  const goToLastPage = () => {
    goToPage(totalPages);
  };

  const handleItemsPerPageChange = (value) => {
    setItemsPerPage(parseInt(value));
    setCurrentPage(1);
  };

  const handleToggleCart = async (product) => {
    if (!user) {
      toast.error("Please login to manage cart");
      return;
    }

    try {
      const result = await toggleCart(product);
      if (result.success) {
        // Success message is handled in the store
      } else {
        toast.error(result.message || "Failed to update cart");
      }
    } catch (error) {
      toast.error("Failed to update cart");
    }
  };

  const handleWishlistToggle = async (product) => {
    if (!user) {
      toast.error("Please login to manage wishlist");
      return;
    }

    try {
      const isInWishlist = wishlist.some(item => item._id === product._id);
      if (isInWishlist) {
        await removeFromWishlist(product._id);
      } else {
        await addToWishlist(product);
      }
    } catch (error) {
      toast.error("Failed to update wishlist");
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3
      }
    }
  };

  const ProductCard = ({ product }) => (
    <motion.div variants={itemVariants}>
      <Card className="group h-full cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 border-2 hover:border-blue-500/20 bg-white/80 backdrop-blur-sm">
        <CardHeader className="p-0">
          <div className="relative overflow-hidden rounded-t-lg">
            <img
              src={product.image}
              alt={product.name}
              loading="lazy"
              className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110"
              onError={(e) => {
                e.target.src = "https://via.placeholder.com/400x300?text=Product+Image";
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
            <div className="absolute top-4 right-4 flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleWishlistToggle(product);
                }}
                className="w-8 h-8 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border-0"
              >
                <Heart 
                  size={16} 
                  className={wishlist.some(item => item._id === product._id) ? "fill-red-500 text-red-500" : ""} 
                />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/product/${product._id}`);
                }}
                className="w-8 h-8 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border-0"
              >
                <Eye size={16} />
              </Button>
            </div>
            <div className="absolute bottom-4 left-4 right-4">
              <h3 className="text-white font-bold text-lg mb-2 line-clamp-2">
                {product.name}
              </h3>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                  ${product.price}
                </Badge>
                <div className="flex items-center gap-1">
                  <Star size={14} className="text-yellow-400 fill-yellow-400" />
                  <span className="text-white text-sm">{product.rating || 4.5}</span>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <p className="text-gray-600 text-sm line-clamp-2 mb-4 leading-relaxed">
            {product.description}
          </p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {product.category}
              </Badge>
              {product.featured && (
                <Badge variant="destructive" className="text-xs bg-gradient-to-r from-red-500 to-pink-500">
                  Featured
                </Badge>
              )}
            </div>
            <Button
              variant={isInCart(product._id) ? "destructive" : "default"}
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleToggleCart(product);
              }}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            >
              {isInCart(product._id) ? (
                <>
                  <ShoppingCart size={16} className="mr-1" />
                  Remove
                </>
              ) : (
                <>
                  <ShoppingCart size={16} className="mr-1" />
                  Add to Cart
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  const LoadingSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, index) => (
        <Card key={index} className="h-full bg-white/80 backdrop-blur-sm">
          <CardHeader className="p-0">
            <Skeleton className="w-full h-48 rounded-t-lg" />
          </CardHeader>
          <CardContent className="p-6">
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-2/3 mb-4" />
            <div className="flex gap-2">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-6 w-20" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 flex items-center justify-center">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-md mx-auto">
            <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Search size={32} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Search Error
            </h1>
            <p className="text-gray-600 mb-8">{error}</p>
            <Button 
              onClick={handleRefresh} 
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300"
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30">
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative py-16 lg:py-24 overflow-hidden"
      >
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-400/10 rounded-full blur-3xl"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl mb-6 shadow-lg"
            >
              <Search size={28} className="text-white" />
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-4xl lg:text-6xl font-bold text-gray-900 mb-4"
            >
              Search <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Results</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-lg text-gray-600 mb-6 leading-relaxed max-w-2xl mx-auto"
            >
              {query ? `Searching for "${query}"` : "Enter a search term to find products"}
            </motion.p>

            {/* Search Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="max-w-2xl mx-auto"
            >
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search for products..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="w-full pl-12 pr-12 py-4 bg-white border-2 border-gray-200 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300 text-lg"
                />
                {searchQuery && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={clearSearch}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-10 w-10 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all duration-200"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                )}
              </form>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Search Results Section */}
      {query && (
        <section className="pb-20">
          <div className="container mx-auto px-4">
            {/* Filters and Search */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="mb-8"
            >
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-6">
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-4">
                    {/* Sort */}
                    <Select value={sortBy} onValueChange={handleSortChange}>
                      <SelectTrigger className="w-full sm:w-40 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300">
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="relevance">Relevance</SelectItem>
                        <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                        <SelectItem value="name-desc">Name (Z-A)</SelectItem>
                        <SelectItem value="price-asc">Price: Low to High</SelectItem>
                        <SelectItem value="price-desc">Price: High to Low</SelectItem>
                        <SelectItem value="rating-desc">Highest Rated</SelectItem>
                        <SelectItem value="createdAt-desc">Newest</SelectItem>
                      </SelectContent>
                    </Select>

                    {/* Category Filter */}
                    <Select value={categoryFilter} onValueChange={handleCategoryFilterChange}>
                      <SelectTrigger className="w-full sm:w-40 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300">
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        <SelectItem value="smartphones">Smartphones</SelectItem>
                        <SelectItem value="laptops">Laptops</SelectItem>
                        <SelectItem value="gaming">Gaming</SelectItem>
                        <SelectItem value="audio">Audio</SelectItem>
                        <SelectItem value="tablets">Tablets</SelectItem>
                      </SelectContent>
                    </Select>

                    {/* Price Range */}
                    <Select value={priceRange} onValueChange={handlePriceRangeChange}>
                      <SelectTrigger className="w-full sm:w-40 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300">
                        <SelectValue placeholder="Price Range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Prices</SelectItem>
                        <SelectItem value="0-100">Under $100</SelectItem>
                        <SelectItem value="100-500">$100 - $500</SelectItem>
                        <SelectItem value="500-1000">$500 - $1000</SelectItem>
                        <SelectItem value="1000+">Over $1000</SelectItem>
                      </SelectContent>
                    </Select>

                    {/* View Mode */}
                    <div className="flex border-2 border-gray-200 rounded-xl overflow-hidden bg-gray-50">
                      <Button
                        variant={viewMode === "grid" ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setViewMode("grid")}
                        className="rounded-r-none bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0"
                      >
                        <Grid3X3 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant={viewMode === "list" ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setViewMode("list")}
                        className="rounded-l-none bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0"
                      >
                        <List className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Items per page */}
                    <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
                      <SelectTrigger className="w-28 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300">
                        <SelectValue placeholder="Per page" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="6">6 per page</SelectItem>
                        <SelectItem value="12">12 per page</SelectItem>
                        <SelectItem value="24">24 per page</SelectItem>
                        <SelectItem value="48">48 per page</SelectItem>
                      </SelectContent>
                    </Select>

                    {/* Refresh Button */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRefresh}
                      disabled={loading}
                      className="px-4 py-3 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all duration-300"
                    >
                      <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                      Refresh
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Search Results */}
            {loading ? (
              <LoadingSkeleton />
            ) : products.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="text-center py-16"
              >
                <div className="w-24 h-24 bg-gradient-to-br from-gray-400 to-gray-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <Search className="h-12 w-12 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  No products found
                </h3>
                <p className="text-gray-600 mb-8 text-lg">
                  No products match your search for "{query}". Try different keywords or check your spelling.
                </p>
                <Button
                  onClick={() => {
                    setSearchQuery("");
                    navigate("/search");
                  }}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300"
                >
                  Clear Search
                </Button>
              </motion.div>
            ) : (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
              >
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </motion.div>
            )}

            {/* Results Count */}
            {!loading && products.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="mt-12 text-center"
              >
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
                  <p className="text-gray-600 font-medium">
                    Found {totalItems} product{totalItems !== 1 ? "s" : ""} matching "{query}"
                  </p>
                </div>
              </motion.div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="mt-12"
              >
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8">
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
                    {/* Pagination Info */}
                    <div className="text-center sm:text-left">
                      <p className="text-gray-600 font-medium">
                        Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} products
                      </p>
                    </div>

                    {/* Pagination Controls */}
                    <div className="flex items-center gap-2">
                      {/* First Page */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={goToFirstPage}
                        disabled={!paginationInfo.hasPrevPage || loading}
                        className="rounded-xl px-3 py-2 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
                      >
                        <ChevronsLeft className="h-4 w-4" />
                      </Button>

                      {/* Previous Page */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={goToPrevPage}
                        disabled={!paginationInfo.hasPrevPage || loading}
                        className="rounded-xl px-3 py-2 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>

                      {/* Page Numbers */}
                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          let pageNum;
                          if (totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (currentPage <= 3) {
                            pageNum = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                          } else {
                            pageNum = currentPage - 2 + i;
                          }

                          return (
                            <Button
                              key={pageNum}
                              variant={currentPage === pageNum ? "default" : "outline"}
                              size="sm"
                              onClick={() => goToPage(pageNum)}
                              disabled={loading}
                              className={`rounded-xl px-3 py-2 min-w-[40px] transition-all duration-200 ${
                                currentPage === pageNum
                                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0"
                                  : "hover:bg-blue-50 hover:border-blue-300"
                              }`}
                            >
                              {pageNum}
                            </Button>
                          );
                        })}
                      </div>

                      {/* Next Page */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={goToNextPage}
                        disabled={!paginationInfo.hasNextPage || loading}
                        className="rounded-xl px-3 py-2 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>

                      {/* Last Page */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={goToLastPage}
                        disabled={!paginationInfo.hasNextPage || loading}
                        className="rounded-xl px-3 py-2 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
                      >
                        <ChevronsRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </section>
      )}
    </div>
  );
};

export default SearchPage; 