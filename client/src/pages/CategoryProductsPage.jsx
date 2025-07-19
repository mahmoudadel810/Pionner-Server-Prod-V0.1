import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Skeleton } from "../components/ui/skeleton";
import { Search, Grid3X3, List, Filter, ArrowLeft, Package, Star, ShoppingCart, Heart } from "lucide-react";
import axios from "../lib/axios";
import toast from "react-hot-toast";
import { useCartStore } from "../stores/useCartStore";
import { useWishlistStore } from "../stores/useWishlistStore";
import { useUserStore } from "../stores/useUserStore";

const CategoryProductsPage = () => {
  const { id } = useParams();
  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [viewMode, setViewMode] = useState("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const { user } = useUserStore();
  const { toggleCart, isInCart } = useCartStore();
  const { addToWishlist, removeFromWishlist, wishlist } = useWishlistStore();

  useEffect(() => {
    fetchCategoryAndProducts();
  }, [id, searchQuery, sortBy, sortOrder, currentPage]);

  const fetchCategoryAndProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch category details
      const categoryResponse = await axios.get(`/v1/categories/${id}`);
      if (categoryResponse.data.success) {
        setCategory(categoryResponse.data.data);
      }

      // Fetch products for this category
      const params = new URLSearchParams({
        page: currentPage,
        limit: 12,
        sortBy,
        sortOrder,
        ...(searchQuery && { search: searchQuery })
      });

      const productsResponse = await axios.get(`/v1/categories/${id}/products?${params}`);
      
      if (productsResponse.data.success) {
        setProducts(productsResponse.data.data.data || productsResponse.data.data);
        setTotalPages(productsResponse.data.pagination?.totalPages || 1);
      } else {
        setError("Failed to fetch products");
      }
    } catch (error) {
      console.error("Error fetching category products:", error);
      setError(error.response?.data?.message || "Failed to fetch products");
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleSortChange = (value) => {
    const [field, order] = value.split("-");
    setSortBy(field);
    setSortOrder(order);
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
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };

  const ProductCard = ({ product }) => {
    const isInWishlist = wishlist.some(item => item._id === product._id);

    return (
      <motion.div variants={itemVariants}>
        <Card className="group h-full cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 border-2 hover:border-primary/20">
          <CardHeader className="p-0">
            <div className="relative overflow-hidden rounded-t-lg">
              <Link to={`/product/${product._id}`}>
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110"
                  onError={(e) => {
                    e.target.src = "https://via.placeholder.com/400x300?text=Product+Image";
                  }}
                />
              </Link>
              <div className="absolute top-2 right-2">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0 bg-white/80 hover:bg-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleWishlistToggle(product);
                  }}
                >
                  <Heart 
                    className={`h-4 w-4 ${isInWishlist ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} 
                  />
                </Button>
              </div>
              {product.isFeatured && (
                <div className="absolute top-2 left-2">
                  <Badge variant="destructive" className="text-xs">
                    Featured
                  </Badge>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <Link to={`/product/${product._id}`}>
              <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                {product.name}
              </h3>
            </Link>
            
            {/* Category Badge */}
            <div className="mb-2">
              <Badge variant="outline" className="text-xs">
                {product.categoryId?.name || product.category}
              </Badge>
            </div>

            <p className="text-muted-foreground text-sm line-clamp-2 mb-3">
              {product.description}
            </p>

            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-medium">4.5</span>
                <span className="text-xs text-muted-foreground">(24)</span>
              </div>
              <span className="text-lg font-bold text-primary">
                ${product.price.toFixed(2)}
              </span>
            </div>

            <Button
              onClick={(e) => {
                e.stopPropagation();
                handleToggleCart(product);
              }}
              className={`w-full ${
                isInCart(product._id)
                  ? "bg-red-500 hover:bg-red-600"
                  : ""
              }`}
              size="sm"
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              {isInCart(product._id) ? "Remove from Cart" : "Add to Cart"}
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  const ProductListItem = ({ product }) => {
    const isInWishlist = wishlist.some(item => item._id === product._id);

    return (
      <motion.div variants={itemVariants}>
        <Card className="group cursor-pointer transition-all duration-300 hover:shadow-md hover:border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <Link to={`/product/${product._id}`} className="relative w-32 h-32 flex-shrink-0">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover rounded-lg"
                  onError={(e) => {
                    e.target.src = "https://via.placeholder.com/128x128?text=Product";
                  }}
                />
                {product.isFeatured && (
                  <Badge variant="destructive" className="absolute top-2 left-2 text-xs">
                    Featured
                  </Badge>
                )}
              </Link>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <Link to={`/product/${product._id}`}>
                      <h3 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors">
                        {product.name}
                      </h3>
                    </Link>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="text-xs">
                        {product.categoryId?.name || product.category}
                      </Badge>
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs font-medium">4.5</span>
                        <span className="text-xs text-muted-foreground">(24)</span>
                      </div>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleWishlistToggle(product);
                    }}
                  >
                    <Heart 
                      className={`h-4 w-4 ${isInWishlist ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} 
                    />
                  </Button>
                </div>
                
                <p className="text-muted-foreground text-sm line-clamp-2 mb-3">
                  {product.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold text-primary">
                    ${product.price.toFixed(2)}
                  </span>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleCart(product);
                    }}
                    className={isInCart(product._id) ? "bg-red-500 hover:bg-red-600" : ""}
                    size="sm"
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    {isInCart(product._id) ? "Remove from Cart" : "Add to Cart"}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  const LoadingSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, index) => (
        <Card key={index} className="h-full">
          <CardHeader className="p-0">
            <Skeleton className="w-full h-48 rounded-t-lg" />
          </CardHeader>
          <CardContent className="p-4">
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2 mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-2/3 mb-3" />
            <div className="flex justify-between items-center mb-3">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-6 w-20" />
            </div>
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  );

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-4">
            Error Loading Products
          </h1>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button onClick={fetchCategoryAndProducts} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Link to="/categories">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Categories
            </Button>
          </Link>
        </div>
        
        {category && (
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-lg overflow-hidden">
              <img
                src={category.image}
                alt={category.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = "https://via.placeholder.com/64x64?text=Category";
                }}
              />
            </div>
            <div>
              <h1 className="text-3xl font-bold">{category.name}</h1>
              <p className="text-muted-foreground">{category.description}</p>
            </div>
          </div>
        )}
      </div>

      {/* Filters and Search */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={searchQuery}
              onChange={handleSearch}
              className="pl-10"
            />
          </div>

          {/* Sort */}
          <Select value={`${sortBy}-${sortOrder}`} onValueChange={handleSortChange}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name-asc">Name (A-Z)</SelectItem>
              <SelectItem value="name-desc">Name (Z-A)</SelectItem>
              <SelectItem value="price-asc">Price (Low to High)</SelectItem>
              <SelectItem value="price-desc">Price (High to Low)</SelectItem>
              <SelectItem value="createdAt-desc">Newest</SelectItem>
              <SelectItem value="createdAt-asc">Oldest</SelectItem>
            </SelectContent>
          </Select>

          {/* View Mode */}
          <div className="flex border rounded-md">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="rounded-r-none"
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="rounded-l-none"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Products Grid/List */}
      {loading ? (
        <LoadingSkeleton />
      ) : products.length === 0 ? (
        <div className="text-center py-12">
          <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No products found</h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery
              ? "Try adjusting your search criteria"
              : "No products are available in this category at the moment"}
          </p>
          {searchQuery && (
            <Button
              variant="outline"
              onClick={() => setSearchQuery("")}
            >
              Clear Search
            </Button>
          )}
        </div>
      ) : (
        <>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                : "space-y-4"
            }
          >
            {products.map((product) =>
              viewMode === "grid" ? (
                <ProductCard key={product._id} product={product} />
              ) : (
                <ProductListItem key={product._id} product={product} />
              )
            )}
          </motion.div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex justify-center">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      className="w-10 h-10 p-0"
                    >
                      {page}
                    </Button>
                  ))}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Results Count */}
      {!loading && products.length > 0 && (
        <div className="mt-8 text-center text-sm text-muted-foreground">
          Showing {products.length} product{products.length !== 1 ? "s" : ""} in {category?.name}
        </div>
      )}
    </div>
  );
};

export default CategoryProductsPage; 