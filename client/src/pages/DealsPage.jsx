import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { useProductStore } from "../stores/useProductStore";
import { useCartStore } from "../stores/useCartStore";
import { useWishlistStore } from "../stores/useWishlistStore";
import { useUserStore } from "../stores/useUserStore";
import ProductCard from "../components/ProductCard";
import { toast } from "react-hot-toast";
import LoadingSpinner from "../components/LoadingSpinner";
import { 
  Zap, 
  Flame, 
  TrendingUp, 
  Star, 
  Clock, 
  Percent,
  ShoppingBag,
  Sparkles
} from "lucide-react";

const DealsPage = () => {
  const { products, fetchFeaturedProducts, loading } = useProductStore();
  const { toggleCart, isInCart } = useCartStore();
  const { toggleWishlist, wishlist } = useWishlistStore();
  const { user } = useUserStore();

  useEffect(() => {
    let isMounted = true;
    const fetchDeals = async () => {
      try {
        const result = await fetchFeaturedProducts();
        if (!isMounted) return;

        if (!result?.success) {
          console.log("Failed to fetch featured products:", result?.message);
        }
      } catch (error) {
        if (!isMounted) return;
        console.error("Error fetching featured products:", error);
      }
    };

    fetchDeals();

    return () => {
      isMounted = false;
    };
  }, [fetchFeaturedProducts]);

  const handleToggleCart = async product => {
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
      // Error is already handled by the result check above
    }
  };

  const handleWishlistToggle = async product => {
    if (!user) {
      toast.error("Please login to manage wishlist");
      return;
    }

    try {
      await toggleWishlist(product);
    } catch (error) {
      // Error is already handled in the store
    }
  };

      

  const dealStats = [
    { number: "500+", label: "Active Deals", icon: Zap, color: "from-purple-500 to-purple-600" },
    { number: "24hr", label: "Flash Sales", icon: Flame, color: "from-red-500 to-red-600" },
    { number: "70%", label: "Max Discount", icon: Percent, color: "from-green-500 to-green-600" },
    { number: "10K+", label: "Happy Buyers", icon: ShoppingBag, color: "from-blue-500 to-blue-600" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 pt-20">
        <div className="container mx-auto px-4 py-8">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30">
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative py-24 lg:py-32 overflow-hidden"
      >
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-72 h-72 bg-red-400/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-orange-400/10 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-yellow-400/10 rounded-full blur-3xl"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-red-600 to-orange-600 rounded-2xl mb-8 shadow-lg"
            >
              <Flame size={32} className="text-white" />
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-5xl lg:text-7xl font-bold text-gray-900 mb-6"
            >
              Hot <span className="bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">Deals</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-xl text-gray-600 mb-8 leading-relaxed max-w-2xl mx-auto"
            >
              Discover amazing deals on our featured products. Limited time offers with incredible savings!
            </motion.p>
            
            {/* Deal Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12"
            >
              {dealStats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 + index * 0.1 }}
                  className="flex flex-col items-center p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-white/20"
                >
                  <div className={`w-10 h-10 bg-gradient-to-br ${stat.color} rounded-lg flex items-center justify-center mb-2`}>
                    <stat.icon size={20} className="text-white" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{stat.number}</div>
                  <div className="text-sm text-gray-600 text-center">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </motion.section>

      

      {/* Products Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-red-50/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-red-600 to-orange-600 rounded-2xl mb-6 shadow-lg"
            >
              <Sparkles size={24} className="text-white" />
            </motion.div>
            
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Featured Products</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Handpicked deals on our most popular products
            </p>
          </motion.div>

          {/* Products Grid */}
          {products && products.length > 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
            >
              {products.map((product, index) => (
                <motion.div
                  key={product._id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -5 }}
                >
                  <ProductCard product={product} index={index} />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-12 max-w-md mx-auto">
                <div className="w-16 h-16 bg-gradient-to-br from-gray-400 to-gray-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <TrendingUp size={24} className="text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">No Deals Available</h3>
                <p className="text-gray-600 mb-6">
                  Check back soon for amazing deals and offers!
                </p>
                <div className="w-full h-2 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-red-500 to-orange-500 rounded-full animate-pulse"></div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </section>
    </div>
  );
};

export default DealsPage;
