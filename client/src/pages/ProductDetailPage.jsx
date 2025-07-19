import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useParams, useNavigate } from "react-router-dom";
import {
  Heart,
  ShoppingCart,
  Star,
  Truck,
  Shield,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  CreditCard,
} from "lucide-react";
import { useCartStore } from "../stores/useCartStore";
import { useWishlistStore } from "../stores/useWishlistStore";
import { usePaymentStore } from "../stores/usePaymentStore";
import { useUserStore } from "../stores/useUserStore";
import { toast } from "react-hot-toast";
import axios from "../lib/axios";

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useUserStore();
  const { toggleCart, isInCart } = useCartStore();
  const { wishlist, toggleWishlist } = useWishlistStore();
  const { createCheckoutSession, redirectToCheckout } = usePaymentStore();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [isBuyingNow, setIsBuyingNow] = useState(false);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/v1/products/getProduct/${id}`);
      if (response.data && response.data.success) {
        setProduct(response.data.data);
        fetchRelatedProducts(response.data.data.category);
      } else {
        throw new Error("Product not found");
      }
    } catch (error) {
      toast.error("Product not found");
      navigate("/shop");
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedProducts = async category => {
    try {
      const response = await axios.get(`/v1/products/getProductsByCategory/${category}`);
      if (response.data && response.data.success) {
        setRelatedProducts(
          response.data.data.filter(p => p._id !== id).slice(0, 4)
        );
      }
    } catch (error) {
      console.error("Error fetching related products:", error);
    }
  };

  const isProductInCart = isInCart(product?._id);

  const handleToggleCart = async () => {
    if (!user) {
      toast.error("Please login to manage cart");
      navigate("/login");
      return;
    }

    try {
      const result = await toggleCart({ ...product, quantity });
      if (result.success) {
        // Success message is handled in the store
      } else {
        toast.error(result.message || "Failed to update cart");
      }
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error("Please login to manage cart");
        navigate("/login");
      } else {
        toast.error("Failed to update cart");
      }
    }
  };

  const handleWishlistToggle = async () => {
    if (!user) {
      toast.error("Please login to add items to wishlist");
      navigate("/login");
      return;
    }

    try {
      await toggleWishlist(product);
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error("Please login to add items to wishlist");
        navigate("/login");
      }
      // Other errors are already handled in the store
    }
  };

  const handleBuyNow = async () => {
    if (!user) {
      toast.error("Please login to purchase items");
      navigate("/login");
      return;
    }

    setIsBuyingNow(true);
    try {
      // Create a single item cart for immediate checkout
      const singleItem = [{ ...product, quantity }];
      const result = await createCheckoutSession(singleItem);
      
      if (result.success && result.data && result.data.url) {
        redirectToCheckout(result.data.url);
      } else {
        toast.error(result.message || "Failed to create checkout session");
      }
    } catch (error) {
      console.error("Buy now error:", error);
      if (error.response?.status === 401) {
        toast.error("Please login to purchase items");
        navigate("/login");
      } else {
        toast.error("An error occurred during checkout");
      }
    } finally {
      setIsBuyingNow(false);
    }
  };

  const isInWishlist = wishlist.some(item => item._id === product?._id);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) {
    return null;
  }

  const images = [product.image, ...(product.additionalImages || [])];

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <button
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors duration-300"
          >
            <ChevronLeft size={20} />
            <span>Back</span>
          </button>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="space-y-4">
              {/* Main Image */}
              <div className="aspect-square bg-card rounded-2xl overflow-hidden">
                <img
                  src={images[selectedImage]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Thumbnail Images */}
              {images.length > 1 && (
                <div className="flex space-x-4">
                  {images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`aspect-square w-20 bg-card rounded-lg overflow-hidden border-2 transition-all duration-300 ${
                        selectedImage === index
                          ? "border-primary"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <img
                        src={image}
                        alt={`${product.name} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>

          {/* Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-6"
          >
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
                {product.name}
              </h1>
              <p className="text-lg text-muted-foreground mb-6">
                {product.description}
              </p>
            </div>

            {/* Price */}
            <div className="flex items-center space-x-4">
              <span className="text-3xl font-bold text-primary">
                ${product.price}
              </span>
              {product.originalPrice &&
                product.originalPrice > product.price && (
                  <>
                    <span className="text-xl text-muted-foreground line-through">
                      ${product.originalPrice}
                    </span>
                    <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                      -
                      {Math.round(
                        ((product.originalPrice - product.price) /
                          product.originalPrice) *
                          100
                      )}
                      %
                    </span>
                  </>
                )}
            </div>

            {/* Rating */}
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={20}
                    className={
                      i < (product.rating || 0)
                        ? "text-yellow-400 fill-current"
                        : "text-gray-300"
                    }
                  />
                ))}
              </div>
              <span className="text-muted-foreground">
                ({product.reviews?.length || 0} reviews)
              </span>
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Quantity
              </label>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center hover:bg-secondary/80 transition-colors duration-300"
                >
                  -
                </button>
                <span className="w-16 text-center font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center hover:bg-secondary/80 transition-colors duration-300"
                >
                  +
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleToggleCart}
                className={`flex-1 py-3 px-6 rounded-lg font-medium transition-colors duration-300 flex items-center justify-center space-x-2 ${
                  isProductInCart
                    ? "bg-red-500 text-white hover:bg-red-600"
                    : "bg-primary text-white hover:bg-primary/90"
                }`}
              >
                <ShoppingCart size={20} />
                <span>{isProductInCart ? "Remove from Cart" : "Add to Cart"}</span>
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleBuyNow}
                disabled={isBuyingNow}
                className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-green-700 transition-colors duration-300 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isBuyingNow ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <CreditCard size={20} />
                )}
                <span>{isBuyingNow ? "Processing..." : "Buy Now"}</span>
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleWishlistToggle}
                className={`w-12 h-12 rounded-lg border-2 flex items-center justify-center transition-all duration-300 ${
                  isInWishlist
                    ? "bg-red-500 border-red-500 text-white"
                    : "bg-transparent border-border text-foreground hover:border-red-500 hover:text-red-500"
                }`}
              >
                <Heart
                  size={20}
                  className={isInWishlist ? "fill-current" : ""}
                />
              </motion.button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-border">
              <div className="flex items-center space-x-3">
                <Truck size={20} className="text-primary" />
                <div>
                  <p className="font-medium text-foreground">Free Shipping</p>
                  <p className="text-sm text-muted-foreground">
                    On orders over $50
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Shield size={20} className="text-primary" />
                <div>
                  <p className="font-medium text-foreground">Secure Payment</p>
                  <p className="text-sm text-muted-foreground">
                    100% secure checkout
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <RotateCcw size={20} className="text-primary" />
                <div>
                  <p className="font-medium text-foreground">Easy Returns</p>
                  <p className="text-sm text-muted-foreground">
                    30 day return policy
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-20"
          >
            <h2 className="text-2xl font-bold text-foreground mb-8">
              Related Products
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map(relatedProduct => (
                <motion.div
                  key={relatedProduct._id}
                  whileHover={{ y: -5 }}
                  className="bg-card rounded-2xl shadow-lg border border-border overflow-hidden cursor-pointer"
                  onClick={() => navigate(`/product/${relatedProduct._id}`)}
                >
                  <div className="aspect-square overflow-hidden">
                    <img
                      src={relatedProduct.image}
                      alt={relatedProduct.name}
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-foreground mb-2 line-clamp-2">
                      {relatedProduct.name}
                    </h3>
                    <p className="text-2xl font-bold text-primary">
                      ${relatedProduct.price}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}
      </div>
    </div>
  );
};

export default ProductDetailPage;
