import React, { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useProductStore } from "../stores/useProductStore";
import { useUserStore } from "../stores/useUserStore";
import { useCartStore } from "../stores/useCartStore";
import { useWishlistStore } from "../stores/useWishlistStore";
import axios from "../lib/axios";
import CategoryItem from "../components/CategoryItem";
import FeaturedProducts from "../components/FeaturedProducts";
import HeroSlider from "../components/HeroSlider";
import Navbar from "../components/Navbar";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Avatar } from "../components/ui/avatar";
import { 
  ShoppingBag, 
  Sparkles, 
  TrendingUp, 
  Mic, 
  MicOff,
  Bot,
  Zap,
  Star,
  Eye,
  Heart,
  ShoppingCart,
  ArrowRight,
  ChevronRight,
  ChevronLeft,
  Play,
  Pause,
  Volume2,
  Award,
  Target,
  Users,
  Globe,
  Shield,
  Clock,
  Gift,
  Crown,
  Brain,
  Cpu,
  Smartphone,
  Laptop,
  Gamepad2,
  Home,
  Headphones,
  Tablet,
  MessageCircle,
  X,
  Send,
  Search,
  Filter,
  Sparkles as SparklesIcon
} from "lucide-react";
import { toast } from "react-hot-toast";

// Categories data
const categories = [
  {
    name: "Smartphones",
    icon: Smartphone,
    href: "/shop?category=smartphones",
    gradient: "from-blue-500 to-purple-600",
    description: "Latest smartphones and mobile devices"
  },
  {
    name: "Laptops",
    icon: Laptop,
    href: "/shop?category=laptops",
    gradient: "from-purple-500 to-pink-600",
    description: "High-performance laptops and notebooks"
  },
  {
    name: "Gaming",
    icon: Gamepad2,
    href: "/shop?category=gaming",
    gradient: "from-green-500 to-emerald-600",
    description: "Gaming accessories and peripherals"
  },
  {
    name: "Smart Home",
    icon: Home,
    href: "/shop?category=smart-home",
    gradient: "from-orange-500 to-red-600",
    description: "Smart home devices and automation"
  },
  {
    name: "Audio",
    icon: Headphones,
    href: "/shop?category=audio",
    gradient: "from-pink-500 to-rose-600",
    description: "Headphones, speakers, and audio equipment"
  },
  {
    name: "Tablets",
    icon: Tablet,
    href: "/shop?category=tablets",
    gradient: "from-indigo-500 to-blue-600",
    description: "Tablets and e-readers"
  }
];

const HomePage = () => {
  const { products, fetchAllProducts, loading } = useProductStore();
  const { user } = useUserStore();
  const { cart, toggleCart, isInCart } = useCartStore();
  const { wishlist } = useWishlistStore();
  const navigate = useNavigate();
  
  // State
  const [featuredProducts, setFeaturedProducts] = useState([]);

  // Animation refs
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  useEffect(() => {
    fetchAllProducts();
    fetchFeaturedProducts();
  }, [fetchAllProducts]);

  // Fetch featured products
  const fetchFeaturedProducts = useCallback(async () => {
    try {
      const response = await axios.get('/products/getFeaturedProducts');
      if (response.data.success) {
        setFeaturedProducts(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching featured products:', error);
    }
  }, []);

  // Get products by category
  const getProductsByCategory = useCallback((categoryName) => {
    return products.filter(product => product.category.toLowerCase() === categoryName.toLowerCase());
  }, [products]);

  // Get actual product counts for each category
  const getCategoryProductCount = useCallback((categoryName) => {
    return getProductsByCategory(categoryName).length;
  }, [getProductsByCategory]);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30" ref={containerRef}>
      {/* Hero Section with Integrated Navbar */}
      <section className="relative">
        <HeroSlider />
        <div className="absolute top-0 left-0 w-full z-50">
          <Navbar />
        </div>
      </section>

      {/* Category Products Preview */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-orange-500 bg-clip-text text-transparent mb-6">
              Explore by Category
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover amazing products from each category, handpicked for you
            </p>
          </div>

          {categories.map((category, categoryIndex) => {
            const categoryProducts = getProductsByCategory(category.name);
            if (categoryProducts.length === 0) return null;

            return (
              <div key={category.name} className="mb-16">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 bg-gradient-to-br ${category.gradient} rounded-xl flex items-center justify-center`}>
                      <category.icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">{category.name}</h3>
                      <p className="text-gray-600">{category.description}</p>
                    </div>
                  </div>
                  <Button
                    onClick={() => navigate(category.href)}
                    variant="outline"
                    className="hidden md:flex items-center gap-2"
                  >
                    View All
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {categoryProducts.slice(0, 4).map((product, productIndex) => (
                    <motion.div
                      key={product._id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: (categoryIndex * 0.1) + (productIndex * 0.1) }}
                      whileHover={{ y: -5, scale: 1.02 }}
                      className="group cursor-pointer"
                      onClick={() => navigate(`/product/${product._id}`)}
                    >
                      <Card className="h-full bg-white/95 backdrop-blur-lg shadow-lg border border-gray-200/50 rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-300">
                        <div className="relative">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          {product.isFeatured && (
                            <Badge className="absolute top-2 left-2 bg-gradient-to-r from-yellow-500 to-orange-600 text-white">
                              Featured
                            </Badge>
                          )}
                        </div>
                        <CardContent className="p-4">
                          <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                            {product.name}
                          </h3>
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                            {product.description}
                          </p>
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-2xl font-bold text-blue-600">
                              ${product.price.toFixed(2)}
                            </span>
                            <div className="flex items-center gap-1 text-sm text-gray-500">
                              <Star className="w-4 h-4 text-yellow-500 fill-current" />
                              <span>4.8</span>
                            </div>
                          </div>
                          <Button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleCart(product);
                            }}
                            className={`w-full rounded-xl ${
                              isInCart(product._id)
                                ? "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white"
                                : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                            }`}
                          >
                            <ShoppingCart className="w-4 h-4 mr-2" />
                            {isInCart(product._id) ? "Remove from Cart" : "Add to Cart"}
                          </Button>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>

                {categoryProducts.length > 4 && (
                  <div className="text-center mt-8">
                    <Button
                      onClick={() => navigate(category.href)}
                      variant="outline"
                      className="md:hidden"
                    >
                      View All {categoryProducts.length} Products
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Featured Products Section */}
      {!loading && featuredProducts?.length > 0 && (
        <FeaturedProducts featuredProducts={featuredProducts} />
      )}

      {/* Enhanced CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 via-purple-600 to-orange-500 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Experience the Future of Shopping
          </h2>
            <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto">
              Join millions of users who trust our platform for their shopping needs. 
              Get personalized recommendations, smart search, and seamless shopping experience.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                variant="secondary" 
                size="lg" 
                className="px-8 py-4 text-lg bg-white text-blue-600 hover:bg-gray-100 rounded-2xl shadow-lg"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Start Shopping Now
            </Button>
            {!user && (
              <Button
                variant="outline"
                size="lg"
                  className="px-8 py-4 text-lg bg-white/10 border-white/20 text-white hover:bg-white/20 rounded-2xl"
              >
                  <Crown className="w-5 h-5 mr-2" />
                  Join Premium
              </Button>
            )}
          </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
