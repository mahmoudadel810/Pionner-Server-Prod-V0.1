import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Heart, ShoppingCart, Eye, Star } from "lucide-react";
import { useCartStore } from "../stores/useCartStore";
import { useWishlistStore } from "../stores/useWishlistStore";
import { useUserStore } from "../stores/useUserStore";
import { toast } from "react-hot-toast";

const ProductCard = ({ 
  product, 
  index = 0, 
  onAddToCart, 
  onWishlistToggle, 
  isInWishlist: propIsInWishlist,
  viewMode = "grid" 
}) => {
  const { toggleCart, isInCart } = useCartStore();
  const { wishlist, addToWishlist, removeFromWishlist } = useWishlistStore();
  const { user } = useUserStore();

  const isInWishlist = propIsInWishlist !== undefined ? propIsInWishlist : wishlist.some(item => item._id === product._id);
  const isProductInCart = isInCart(product._id);

  const handleToggleCart = async e => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast.error("Please login to manage cart");
      return;
    }

    try {
      if (onAddToCart) {
        await onAddToCart(product);
      } else {
        const result = await toggleCart(product);
        if (!result.success) {
          toast.error(result.message || "Failed to update cart");
        }
      }
    } catch (error) {
      // Error is already handled in the store or by the result check above
    }
  };

  const handleWishlistToggle = e => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast.error("Please login to manage wishlist");
      return;
    }

    if (onWishlistToggle) {
      onWishlistToggle(product);
    } else {
      if (isInWishlist) {
        removeFromWishlist(product._id);
      } else {
        addToWishlist(product);
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      whileHover={{ y: -5 }}
      className="group bg-card rounded-2xl shadow-lg border border-border overflow-hidden"
    >
      <Link to={`/product/${product._id}`}>
        {/* Product Image */}
        <div className="relative aspect-square overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Action Buttons */}
          <div className="absolute top-4 right-4 space-y-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleWishlistToggle}
              className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-colors duration-300 ${
                isInWishlist
                  ? "bg-red-500 text-white"
                  : "bg-white/90 text-foreground hover:bg-white"
              }`}
              title={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
            >
              <Heart size={20} className={isInWishlist ? "fill-current" : ""} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleToggleCart}
              className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-colors duration-300 ${
                isProductInCart
                  ? "bg-green-500 text-white"
                  : "bg-white/90 text-foreground hover:bg-white"
              }`}
              title={isProductInCart ? "Remove from cart" : "Add to cart"}
            >
              <ShoppingCart size={20} className={isProductInCart ? "fill-current" : ""} />
            </motion.button>
          </div>

          {/* Quick View Button */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors duration-300 flex items-center space-x-2"
            >
              <Eye size={16} />
              <span>Quick View</span>
            </motion.button>
          </div>

          {/* Discount Badge */}
          {product.discount && (
            <div className="absolute top-4 left-4">
              <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                -{product.discount}%
              </span>
            </div>
          )}

          {/* Featured Badge */}
          {product.isFeatured && (
            <div className="absolute top-4 left-4">
              <span className="bg-primary text-white px-2 py-1 rounded-full text-xs font-medium">
                Featured
              </span>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="p-4">
          <h3 className="font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors duration-300">
            {product.name}
          </h3>
          <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
            {product.description}
          </p>

          {/* Rating */}
          <div className="flex items-center space-x-2 mb-3">
            <div className="flex items-center space-x-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={16}
                  className={
                    i < (product.rating || 0)
                      ? "text-yellow-400 fill-current"
                      : "text-gray-300"
                  }
                />
              ))}
            </div>
            <span className="text-xs text-muted-foreground">
              ({product.reviews?.length || 0})
            </span>
          </div>

          {/* Price and Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-primary">
                ${product.price}
              </span>
              {product.originalPrice &&
                product.originalPrice > product.price && (
                  <span className="text-muted-foreground line-through">
                    ${product.originalPrice}
                  </span>
                )}
            </div>

            {/* Category */}
            <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded-full">
              {product.category}
            </span>
          </div>

          {/* Quick Add to Cart Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleToggleCart}
            className={`w-full mt-3 py-2 px-4 rounded-lg font-medium transition-colors duration-300 flex items-center justify-center space-x-2 ${
              isProductInCart
                ? "bg-red-500 text-white hover:bg-red-600"
                : "bg-primary text-white hover:bg-primary/90"
            }`}
          >
            <ShoppingCart size={16} />
            <span>{isProductInCart ? "Remove from Cart" : "Add to Cart"}</span>
          </motion.button>
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;
