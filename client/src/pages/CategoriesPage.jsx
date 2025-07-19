import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Skeleton } from "../components/ui/skeleton";
import { Search, Grid3X3, List, Filter, Package, Layers, Sparkles, X, RefreshCw, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import axios from "../lib/axios";
import toast from "react-hot-toast";

const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [viewMode, setViewMode] = useState("grid");
  const [filterFeatured, setFilterFeatured] = useState("all");
  const [searchTimeout, setSearchTimeout] = useState(null);
  const [hasLoaded, setHasLoaded] = useState(false);
  
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

  // Debounced search function
  const debouncedSearch = useCallback((query) => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    const timeout = setTimeout(() => {
      fetchCategories(query, 1); // Reset to page 1 when searching
    }, 300);
    
    setSearchTimeout(timeout);
  }, [searchTimeout]);

  // Initial fetch on mount
  useEffect(() => {
    fetchCategories("", 1);
  }, []);

  // Fetch when sort/filter changes (debounced to prevent excessive calls)
  useEffect(() => {
    if (hasLoaded) {
      const timeoutId = setTimeout(() => {
        fetchCategories("", 1);
      }, 300);
      return () => clearTimeout(timeoutId);
    }
  }, [sortBy, sortOrder, filterFeatured, itemsPerPage]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTimeout]);

  const fetchCategories = async (searchTerm = searchQuery, page = currentPage) => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        search: searchTerm.trim(),
        sortBy,
        sortOrder,
        page: page.toString(),
        limit: itemsPerPage.toString(),
        ...(filterFeatured && filterFeatured !== "all" && { featured: filterFeatured })
      };

      const queryString = new URLSearchParams(params).toString();
      const response = await axios.get(`/v1/categories?${queryString}`);
      
      if (response.data.success) {
        const data = response.data.data;
        setCategories(data.data || data);
        setHasLoaded(true);
        
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
        setError("Failed to fetch categories");
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      setError(error.response?.data?.message || "Failed to fetch categories");
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    setCurrentPage(1); // Reset to first page when searching
    debouncedSearch(value);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setCurrentPage(1);
    fetchCategories("", 1);
  };

  const handleSortChange = (value) => {
    const [field, order] = value.split("-");
    setSortBy(field);
    setSortOrder(order);
    setCurrentPage(1); // Reset to first page when sorting
  };

  const handleFilterChange = (value) => {
    setFilterFeatured(value);
    setCurrentPage(1); // Reset to first page when filtering
  };

  const handleRefresh = () => {
    setHasLoaded(false);
    setCurrentPage(1);
    fetchCategories("", 1);
  };

  // Pagination handlers
  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      fetchCategories(searchQuery, page);
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

  const CategoryCard = ({ category }) => (
    <motion.div variants={itemVariants}>
      <Link to={`/categories/${category._id}/products`}>
        <Card className="group h-full cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 border-2 hover:border-blue-500/20 bg-white/80 backdrop-blur-sm">
          <CardHeader className="p-0">
            <div className="relative overflow-hidden rounded-t-lg">
              <img
                src={category.image}
                alt={category.name}
                loading="lazy"
                className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110"
                onError={(e) => {
                  e.target.src = "https://via.placeholder.com/400x300?text=Category+Image";
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <h3 className="text-white font-bold text-xl mb-2">
                  {category.name}
                </h3>
                <Badge variant="secondary" className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                  {category.productCount || 0} products
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <p className="text-gray-600 text-sm line-clamp-2 mb-4 leading-relaxed">
              {category.description}
            </p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {category.featured && (
                  <Badge variant="destructive" className="text-xs bg-gradient-to-r from-red-500 to-pink-500">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Featured
                  </Badge>
                )}
                <Badge variant="outline" className="text-xs">
                  {category.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
              <Package className="h-5 w-5 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );

  const CategoryListItem = ({ category }) => (
    <motion.div variants={itemVariants}>
      <Link to={`/categories/${category._id}/products`}>
        <Card className="group cursor-pointer transition-all duration-300 hover:shadow-lg hover:border-blue-500/20 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-6">
              <div className="relative w-24 h-24 flex-shrink-0">
                <img
                  src={category.image}
                  alt={category.name}
                  loading="lazy"
                  className="w-full h-full object-cover rounded-xl transition-transform duration-300 group-hover:scale-105"
                  onError={(e) => {
                    e.target.src = "https://via.placeholder.com/96x96?text=Category";
                  }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-3">
                  <h3 className="font-bold text-xl truncate text-gray-900">
                    {category.name}
                  </h3>
                  {category.featured && (
                    <Badge variant="destructive" className="text-xs bg-gradient-to-r from-red-500 to-pink-500">
                      <Sparkles className="w-3 h-3 mr-1" />
                      Featured
                    </Badge>
                  )}
                </div>
                <p className="text-gray-600 text-sm line-clamp-2 mb-3 leading-relaxed">
                  {category.description}
                </p>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Package className="w-4 h-4" />
                    {category.productCount || 0} products
                  </span>
                  <span>•</span>
                  <span className={category.isActive ? "text-green-600" : "text-red-600"}>
                    {category.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Layers className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
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
              <Package size={32} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Error Loading Categories
            </h1>
            <p className="text-gray-600 mb-8">{error}</p>
            <Button 
              onClick={fetchCategories} 
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
              <Layers size={28} className="text-white" />
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-4xl lg:text-6xl font-bold text-gray-900 mb-4"
            >
              Explore <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Categories</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-lg text-gray-600 mb-6 leading-relaxed max-w-2xl mx-auto"
            >
              Discover our curated collection of product categories. Find exactly what you're looking for with our organized selection.
            </motion.p>
          </div>
        </div>
      </motion.section>

      {/* Categories Section */}
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
                  {/* Search */}
                  <div className="relative flex-1">
                    <Search className={`absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 transition-colors duration-300 ${searchQuery ? 'text-blue-500' : 'text-gray-400'}`} />
                    <Input
                      placeholder="Search categories by name or description..."
                      value={searchQuery}
                      onChange={handleSearch}
                      className={`pl-12 pr-12 py-3 bg-gray-50 border-2 rounded-xl focus:ring-4 transition-all duration-300 ${
                        searchQuery 
                          ? 'border-blue-500 focus:border-blue-500 focus:ring-blue-100' 
                          : 'border-gray-200 focus:border-blue-500 focus:ring-blue-100'
                      }`}
                    />
                    {searchQuery && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearSearch}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all duration-200"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  {/* Sort */}
                  <Select value={`${sortBy}-${sortOrder}`} onValueChange={handleSortChange}>
                    <SelectTrigger className="w-full sm:w-40 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                      <SelectItem value="name-desc">Name (Z-A)</SelectItem>
                      <SelectItem value="productCount-desc">Most Products</SelectItem>
                      <SelectItem value="productCount-asc">Least Products</SelectItem>
                      <SelectItem value="createdAt-desc">Newest</SelectItem>
                      <SelectItem value="createdAt-asc">Oldest</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Filter */}
                  <Select value={filterFeatured} onValueChange={handleFilterChange}>
                    <SelectTrigger className="w-full sm:w-40 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300">
                      <SelectValue placeholder="Filter by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="true">Featured Only</SelectItem>
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

          {/* Search Results Indicator */}
          {searchQuery && !loading && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="mb-6"
            >
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Search className="h-5 w-5 text-blue-600" />
                    <span className="text-blue-900 font-medium">
                      Search results for "{searchQuery}"
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearSearch}
                    className="text-blue-600 hover:text-blue-800 hover:bg-blue-100"
                  >
                    Clear search
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Categories Grid/List */}
          {loading ? (
            <LoadingSkeleton />
          ) : categories.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center py-16"
            >
              <div className="w-24 h-24 bg-gradient-to-br from-gray-400 to-gray-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Package className="h-12 w-12 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                {searchQuery ? "No categories found" : "No categories available"}
              </h3>
              <p className="text-gray-600 mb-8 text-lg">
                {searchQuery 
                  ? `No categories match your search for "${searchQuery}". Try different keywords or check your spelling.`
                  : filterFeatured !== "all"
                  ? "No featured categories are available at the moment."
                  : "No categories are available at the moment."
                }
              </p>
              {(searchQuery || filterFeatured !== "all") && (
                <Button
                  onClick={() => {
                    setSearchQuery("");
                    setFilterFeatured("all");
                  }}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300"
                >
                  Clear All Filters
                </Button>
              )}
            </motion.div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
                  : "space-y-6"
              }
            >
              {categories.map((category) =>
                viewMode === "grid" ? (
                  <CategoryCard key={category._id} category={category} />
                ) : (
                  <CategoryListItem key={category._id} category={category} />
                )
              )}
            </motion.div>
          )}

          {/* Results Count */}
          {!loading && categories.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="mt-12 text-center"
            >
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
                <div className="flex items-center justify-center gap-3">
                  <p className="text-gray-600 font-medium">
                    {searchQuery 
                      ? `Found ${totalItems} category${totalItems !== 1 ? "ies" : "y"} matching "${searchQuery}"`
                      : `Showing ${totalItems} category${totalItems !== 1 ? "ies" : "y"}`
                    }
                  </p>
                  {hasLoaded && !searchQuery && (
                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
                      Cached
                    </span>
                  )}
                </div>
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
                      Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} categories
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

          {/* Items per page */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="mt-12 flex justify-center items-center gap-4"
          >
            <span className="text-gray-700 font-medium">Items per page:</span>
            <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select items per page" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="6">6</SelectItem>
                <SelectItem value="12">12</SelectItem>
                <SelectItem value="24">24</SelectItem>
                <SelectItem value="48">48</SelectItem>
              </SelectContent>
            </Select>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default CategoriesPage; 