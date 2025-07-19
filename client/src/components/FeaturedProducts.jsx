import { useEffect, useState } from "react";
import { ShoppingCart, ChevronLeft, ChevronRight, Heart } from "lucide-react";
import { useCartStore } from "../stores/useCartStore";
import { useWishlistStore } from "../stores/useWishlistStore";
import { useUserStore } from "../stores/useUserStore";
import { Card, CardContent, CardFooter } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const FeaturedProducts = ({ featuredProducts }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(4);
  const { toggleCart, isInCart } = useCartStore();
  const { toggleWishlist, wishlist, fetchWishlist } = useWishlistStore();
  const { user } = useUserStore();
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) setItemsPerPage(1);
      else if (window.innerWidth < 1024) setItemsPerPage(2);
      else if (window.innerWidth < 1280) setItemsPerPage(3);
      else setItemsPerPage(4);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fetch wishlist when component mounts
  useEffect(() => {
    if (user) {
      fetchWishlist().catch(error => {
        console.log("Wishlist fetch error:", error);
      });
    }
  }, [fetchWishlist, user]);

  const nextSlide = () => {
    setCurrentIndex(prevIndex =>
      Math.min(prevIndex + itemsPerPage, featuredProducts.length - itemsPerPage)
    );
  };

  const prevSlide = () => {
    setCurrentIndex(prevIndex => Math.max(prevIndex - itemsPerPage, 0));
  };

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

  const handleToggleWishlist = async product => {
    if (!user) {
      toast.error("Please log in to manage your wishlist.");
      
      return;
    }
    try {
      const result = await toggleWishlist(product);
      if (!result.success) {
        toast.error(result.message || "Failed to update wishlist");
      }
    } catch (error) {
      // Error is already handled by the result check above
    }
  };

  // Check if product is in wishlist
  const isInWishlist = (productId) => {
    return wishlist.some(item => item._id === productId);
  };

  const isStartDisabled = currentIndex === 0;
  const isEndDisabled = currentIndex >= featuredProducts.length - itemsPerPage;

  if (!featuredProducts || featuredProducts.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent mb-4">
            Featured Products
          </h2>
          <p className="text-muted-foreground text-lg">
            Discover our handpicked selection of premium products
          </p>
        </div>

        <div className="relative">
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-300 ease-in-out"
              style={{
                transform: `translateX(-${currentIndex * (100 / itemsPerPage)}%)`,
              }}
            >
              {featuredProducts.map(product => (
                <div
                  key={product._id}
                  className="w-full sm:w-1/2 lg:w-1/3 xl:w-1/4 flex-shrink-0 px-2"
                >
                  <Card 
                    className="h-full group hover:shadow-lg transition-all duration-300 border-border/50 hover:border-primary/30 cursor-pointer"
                    onClick={() => navigate(`/product/${product._id}`)}
                  >
                    <CardContent className="p-0">
                      <div className="relative overflow-hidden">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        {product.isFeatured && (
                          <Badge className="absolute top-2 left-2 bg-primary text-primary-foreground">
                            Featured
                          </Badge>
                        )}
                        <Button
                          size="icon"
                          variant="ghost"
                          className="absolute top-2 right-2 bg-background/80 hover:bg-background/90 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleWishlist(product);
                          }}
                        >
                          <Heart className={`h-4 w-4 ${isInWishlist(product._id) ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
                        </Button>
                      </div>
                    </CardContent>

                    <CardFooter className="p-4 flex flex-col items-start space-y-3">
                      <div className="w-full">
                        <h3 className="font-semibold text-lg mb-1 line-clamp-2 group-hover:text-primary transition-colors">
                          {product.name}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                          {product.description}
                        </p>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-2xl font-bold text-primary">
                            ${product.price.toFixed(2)}
                          </span>
                          {product.oldPrice && (
                            <span className="text-sm text-muted-foreground line-through">
                              ${product.oldPrice.toFixed(2)}
                            </span>
                          )}
                        </div>
                      </div>

                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleCart(product);
                        }}
                        className={`w-full transition-colors ${
                          isInCart(product._id)
                            ? "bg-red-500 hover:bg-red-600 text-white"
                            : "group-hover:bg-primary group-hover:text-primary-foreground"
                        }`}
                        size="sm"
                      >
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        {isInCart(product._id) ? "Remove from Cart" : "Add to Cart"}
                      </Button>
                    </CardFooter>
                  </Card>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Buttons */}
          <Button
            onClick={prevSlide}
            disabled={isStartDisabled}
            variant="outline"
            size="icon"
            className={`absolute top-1/2 -left-4 transform -translate-y-1/2 ${
              isStartDisabled
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-primary hover:text-primary-foreground"
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>

          <Button
            onClick={nextSlide}
            disabled={isEndDisabled}
            variant="outline"
            size="icon"
            className={`absolute top-1/2 -right-4 transform -translate-y-1/2 ${
              isEndDisabled
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-primary hover:text-primary-foreground"
            }`}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;