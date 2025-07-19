import React from "react";
import { motion } from "framer-motion";
import { Heart, Trash2, ShoppingCart, Eye } from "lucide-react";
import { useWishlistStore } from "../stores/useWishlistStore";
import { useCartStore } from "../stores/useCartStore";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

const WishlistPage = () => {
  const { wishlist, removeFromWishlist, loading } = useWishlistStore();
  const { toggleCart, isInCart } = useCartStore();
  const navigate = useNavigate();

  const handleToggleCart = async product => {
    try {
      const result = await toggleCart(product);
      if (result.success) {
        // Success message is handled in the store
      } else {
        toast.error(result.message || "Failed to update cart");
      }
    } catch (error) {
      // Error is already handled by the result check above
    }
  };

  const handleRemoveFromWishlist = async productId => {
    try {
      await removeFromWishlist(productId);
    } catch (error) {
      // Error is already handled in the store
    }
  };

  const handleViewProduct = productId => {
    navigate(`/product/${productId}`);
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-foreground mb-2">
            My Wishlist
          </h1>
          <p className="text-muted-foreground">
            {wishlist.length} {wishlist.length === 1 ? "item" : "items"} in your
            wishlist
          </p>
        </motion.div>

        {wishlist.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="text-center py-20"
          >
            <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart size={48} className="text-primary" />
            </div>
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              Your wishlist is empty
            </h2>
            <p className="text-muted-foreground mb-8">
              Start adding products to your wishlist to save them for later
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/shop")}
              className="bg-primary text-white px-8 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors duration-300"
            >
              Start Shopping
            </motion.button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlist.map((product, index) => (
              <motion.div
                key={product._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="bg-card rounded-2xl shadow-lg border border-border overflow-hidden group"
              >
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
                      onClick={() => handleViewProduct(product._id)}
                      className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors duration-300"
                    >
                      <Eye size={20} className="text-foreground" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleRemoveFromWishlist(product._id)}
                      className="w-10 h-10 bg-red-500/90 rounded-full flex items-center justify-center shadow-lg hover:bg-red-500 transition-colors duration-300"
                    >
                      <Trash2 size={20} className="text-white" />
                    </motion.button>
                  </div>
                </div>

                {/* Product Info */}
                <div className="p-4">
                  <h3 className="font-semibold text-foreground mb-2 line-clamp-2">
                    {product.name}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                    {product.description}
                  </p>

                  <div className="flex items-center justify-between mb-4">
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
                    {product.discount && (
                      <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                        -{product.discount}%
                      </span>
                    )}
                  </div>

                  {/* Add to Cart Button */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleToggleCart(product)}
                    className={`w-full py-2 px-4 rounded-lg transition-colors duration-300 flex items-center justify-center space-x-2 ${
                      isInCart(product._id)
                        ? "bg-red-500 text-white hover:bg-red-600"
                        : "bg-primary text-white hover:bg-primary/90"
                    }`}
                  >
                    <ShoppingCart size={16} />
                    <span>{isInCart(product._id) ? "Remove from Cart" : "Add to Cart"}</span>
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistPage;
