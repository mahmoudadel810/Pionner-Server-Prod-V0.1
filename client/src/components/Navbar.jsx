/** @format */

import React, { useState, useEffect, memo, useCallback, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuContent,
  NavigationMenuLink,
} from "./ui/navigation-menu";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { Avatar } from "./ui/avatar";
import {
  Search,
  ShoppingCart,
  User,
  Menu,
  X,
  Heart,
  ChevronDown,
  Smartphone,
  Laptop,
  Gamepad2,
  Home,
  Headphones,
  Tablet,
  LogOut,
  Settings,
  Package,
  Bell,
  Star,
  TrendingUp,
} from "lucide-react";
import { useUserStore } from "../stores/useUserStore";
import { useCartStore } from "../stores/useCartStore";
import { useWishlistStore } from "../stores/useWishlistStore";
import axios from "../lib/axios";
import "../App.css";

const Navbar = memo(() => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const userDropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    if (!showUserDropdown) return;
    function handleClickOutside(event) {
      if (
        userDropdownRef.current &&
        !userDropdownRef.current.contains(event.target)
      ) {
        setShowUserDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showUserDropdown]);

  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, debugAuthState, forceLogout } = useUserStore();
  const { cart } = useCartStore();
  const { wishlist } = useWishlistStore();



  // Handle scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Handle mobile menu body scroll lock
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  // Handle escape key to close mobile menu
  useEffect(() => {
    const handleEscape = e => {
      if (e.key === "Escape" && isMenuOpen) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isMenuOpen]);

  const categories = [
    {
      name: "Smartphones",
      icon: Smartphone,
      href: "/shop?category=smartphones",
      color: "from-blue-500 to-blue-600",
    },
    {
      name: "Laptops",
      icon: Laptop,
      href: "/shop?category=laptops",
      color: "from-purple-500 to-purple-600",
    },
    {
      name: "Gaming",
      icon: Gamepad2,
      href: "/shop?category=gaming",
      color: "from-green-500 to-green-600",
    },
    {
      name: "Smart Home",
      icon: Home,
      href: "/shop?category=smart-home",
      color: "from-orange-500 to-orange-600",
    },
    {
      name: "Audio",
      icon: Headphones,
      href: "/shop?category=audio",
      color: "from-pink-500 to-pink-600",
    },
    {
      name: "Tablets",
      icon: Tablet,
      href: "/shop?category=tablets",
      color: "from-indigo-500 to-indigo-600",
    },
  ];

  const navLinks = [
    { name: "Home", href: "/", icon: Home },
    { name: "Shop", href: "/shop", icon: Package },
    { name: "Categories", href: "/categories", icon: Package },
    { name: "Deals", href: "/deals", badge: "Hot", icon: TrendingUp },
    { name: "About", href: "/about" },
    { name: "Contact Us", href: "/contact" },
  ];

  const handleLogout = useCallback(async () => {
    try {
      await logout();
      navigate("/");
      // Close mobile menu if open
      setIsMenuOpen(false);
      setShowUserDropdown(false);
    } catch (error) {
      console.error("Logout error:", error);
    }
  }, [logout, navigate]);

  const handleSearch = useCallback(
    e => {
      e.preventDefault();
      if (searchQuery.trim()) {
        navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
        setSearchQuery("");
        setIsSearchFocused(false);
      }
    },
    [searchQuery, navigate]
  );

  const handleSearchChange = useCallback(e => {
    const value = e.target.value;
    setSearchQuery(value);

    // Get search suggestions from API
    if (value.length > 2) {
      // Debounced API call for suggestions
      const timeoutId = setTimeout(async () => {
        try {
          const response = await axios.get(
            `/v1/products/searchSuggestions?search=${encodeURIComponent(value)}&limit=4`
          );
          if (response.data.success) {
            const suggestions = response.data.data || [];
            setSearchSuggestions(suggestions);
          }
        } catch (error) {
          // Fallback to mock suggestions if API fails
          setSearchSuggestions([
            { name: `${value} iPhone`, _id: "mock1" },
            { name: `${value} Samsung`, _id: "mock2" },
            { name: `${value} laptop`, _id: "mock3" },
            { name: `${value} headphones`, _id: "mock4" },
          ]);
        }
      }, 300);

      return () => clearTimeout(timeoutId);
    } else {
      setSearchSuggestions([]);
    }
  }, []);

  // Calculate total quantity in cart
  const cartItemCount = cart.reduce(
    (sum, item) => sum + (item.quantity || 1),
    0
  );
  const wishlistItemCount = wishlist.length;

  const isActive = useCallback(
    href => {
      if (href === "/") return location.pathname === "/";
      return location.pathname.startsWith(href);
    },
    [location.pathname]
  );

  const closeMobileMenu = useCallback(() => {
    setIsMenuOpen(false);
  }, []);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-white/95 backdrop-blur-lg shadow-lg border-b border-gray-200/50"
            : "bg-white/95 backdrop-blur-lg shadow-sm border-b border-gray-200/50"
        }`}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <div
              className="flex items-center space-x-3 cursor-pointer select-none group"
              onClick={() => navigate("/")}
            >
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 via-purple-600 to-orange-500 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                  <div className="w-6 h-6 bg-white rounded-md flex items-center justify-center">
                    <div className="w-3 h-3 bg-gradient-to-br from-blue-600 to-orange-500 rounded-sm"></div>
                  </div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-orange-500 rounded-xl blur opacity-20 group-hover:opacity-40 transition-opacity duration-300"></div>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-orange-500 bg-clip-text text-transparent tracking-tight drop-shadow-lg">
                Pioneer
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-1">
              <NavigationMenu>
                <NavigationMenuList>
                  {navLinks.map(link => (
                    <NavigationMenuItem key={link.name}>
                      <NavigationMenuLink asChild>
                        <Link
                          to={link.href}
                          className={`nav-animated-link px-4 py-2.5 rounded-xl font-medium transition-all duration-200 flex items-center relative group ${
                            isActive(link.href)
                              ? "text-blue-600 bg-blue-50 shadow-sm"
                              : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                          }`}
                        >
                          {link.icon && (
                            <link.icon
                              size={18}
                              className={`mr-2 transition-colors ${
                                isActive(link.href)
                                  ? "text-blue-600"
                                  : "text-gray-500 group-hover:text-blue-600"
                              }`}
                            />
                          )}
                          {link.name}
                          {link.badge && (
                            <Badge className="ml-2 bg-red-500 text-white text-xs animate-pulse">
                              {link.badge}
                            </Badge>
                          )}
                        </Link>
                      </NavigationMenuLink>
                    </NavigationMenuItem>
                  ))}
                </NavigationMenuList>
              </NavigationMenu>
            </div>

            {/* Search Bar */}
            <div className="hidden md:flex items-center w-80 relative">
              <form onSubmit={handleSearch} className="w-full relative">
                <div className="relative">
                  <Search
                    size={20}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors"
                  />
                  <Input
                    type="text"
                    placeholder="Search electronics..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() =>
                      setTimeout(() => setIsSearchFocused(false), 200)
                    }
                    className="w-full pl-10 pr-4 py-2.5 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-sm transition-all duration-200 bg-gray-50 focus:bg-white text-gray-900 placeholder:text-gray-500"
                  />
                </div>

                {/* Search Suggestions */}
                {isSearchFocused && searchSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50 min-w-[300px]">
                    {searchSuggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => {
                          if (
                            suggestion._id &&
                            suggestion._id !== "mock1" &&
                            suggestion._id !== "mock2" &&
                            suggestion._id !== "mock3" &&
                            suggestion._id !== "mock4"
                          ) {
                            // Navigate to product details
                            navigate(`/product/${suggestion._id}`);
                            setSearchQuery("");
                            setIsSearchFocused(false);
                          } else {
                            // For mock suggestions, set as search query
                            setSearchQuery(suggestion.name);
                            setIsSearchFocused(false);
                          }
                        }}
                        className="w-full text-left px-6 py-3 hover:bg-gray-50 text-gray-700 transition-colors flex items-center justify-between"
                      >
                        <div className="flex items-center min-w-0 flex-1">
                          <Search
                            size={16}
                            className="mr-3 text-gray-400 flex-shrink-0"
                          />
                          <span className="truncate text-sm font-medium">
                            {suggestion.name}
                          </span>
                        </div>
                        {suggestion.category && (
                          <Badge className="ml-3 text-xs bg-gray-100 text-gray-600 flex-shrink-0">
                            {suggestion.category}
                          </Badge>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </form>
            </div>

            {/* Right Side Icons */}
            <div className="flex items-center space-x-1">
              {/* Wishlist */}
              <Button
                variant="ghost"
                className={`relative hidden md:flex p-2.5 rounded-xl transition-colors ${
                  isScrolled ? "hover:bg-gray-100" : "hover:bg-white/10"
                }`}
                onClick={() => navigate("/wishlist")}
              >
                <Heart size={20} className="text-gray-600" />
                {wishlistItemCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs min-w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                    {wishlistItemCount}
                  </Badge>
                )}
              </Button>

              {/* Cart */}
              <Button
                variant="ghost"
                className="relative p-2.5 rounded-xl transition-colors hover:bg-gray-100"
                onClick={() => navigate("/cart")}
              >
                <ShoppingCart size={20} className="text-gray-600" />
                {cartItemCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs min-w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                    {cartItemCount}
                  </Badge>
                )}
              </Button>

              {/* User Menu - Simplified Dropdown */}
              {user ? (
                <div
                  className="relative hidden md:flex items-center"
                  ref={userDropdownRef}
                >
                  <button
                    onClick={() => setShowUserDropdown(prev => !prev)}
                    className="flex items-center gap-2 p-2 rounded-xl transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <Avatar className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-semibold">
                      {user.data?.user?.profileImage ? (
                        <img 
                          src={user.data.user.profileImage} 
                          alt="Profile" 
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        user.data?.user?.name?.charAt(0).toUpperCase() || <User size={18} />
                      )}
                    </Avatar>
                    <span className="text-sm font-medium text-gray-700">
                      {user.data?.user?.name || "User"}
                    </span>
                    <ChevronDown
                      size={16}
                      className={`text-gray-500 transition-transform duration-200 ${showUserDropdown ? "rotate-180" : ""}`}
                    />
                  </button>
                  {showUserDropdown && (
                    <div className="absolute top-full right-0 mt-2 w-56 bg-white border border-gray-100 rounded-xl shadow-xl z-50 overflow-hidden">
                      {/* Profile Header */}
                      <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-purple-50">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-semibold">
                            {user.data?.user?.profileImage ? (
                              <img 
                                src={user.data.user.profileImage} 
                                alt="Profile" 
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              user.data?.user?.name?.charAt(0).toUpperCase() || <User size={20} />
                            )}
                          </Avatar>
                          <div>
                            <div className="text-sm font-semibold text-gray-900">
                              {user.data?.user?.name || "User"}
                            </div>
                            <div className="text-xs text-gray-500">
                              {user.data?.user?.email || "No email"}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Menu Items */}
                      <div className="py-1">
                        <button
                          onClick={() => {
                            navigate("/profile");
                            setShowUserDropdown(false);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-colors text-left"
                        >
                          <User size={18} />
                          <span className="font-medium">Profile</span>
                        </button>

                        <div className="border-t border-gray-100 my-1" />

                        <button
                          onClick={() => {
                            handleLogout();
                            setShowUserDropdown(false);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:text-white hover:bg-red-500 transition-colors text-left"
                        >
                          <LogOut size={18} />
                          <span className="font-medium">Logout</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Button
                  variant="ghost"
                  className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl transition-colors hover:bg-gray-100"
                  onClick={() => navigate("/login")}
                >
                  <User size={20} className="text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">
                    Sign In
                  </span>
                </Button>
              )}

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                className="lg:hidden p-2.5 rounded-xl transition-colors hover:bg-gray-100"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? (
                  <X size={24} className="text-gray-600" />
                ) : (
                  <Menu size={24} className="text-gray-600" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden absolute inset-0 z-40 bg-white/95 backdrop-blur-xl">
          <div className="h-full overflow-y-auto">
            <div className="container mx-auto px-4 pt-24 pb-8">
              {/* Mobile Search */}
              <div className="mb-8">
                <form onSubmit={handleSearch} className="relative">
                  <Search
                    size={20}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <Input
                    type="text"
                    placeholder="Search electronics..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white text-gray-900 placeholder:text-gray-500"
                  />
                </form>
              </div>

              {/* Main Navigation */}
              <div className="space-y-2 mb-8">
                {navLinks.map(link => (
                  <Link
                    key={link.name}
                    to={link.href}
                    onClick={closeMobileMenu}
                    className={`flex items-center gap-3 py-3 px-4 rounded-xl transition-all duration-200 ${
                      isActive(link.href)
                        ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                        : "hover:bg-gray-50 text-gray-700 hover:text-gray-900"
                    }`}
                  >
                    {link.icon && (
                      <link.icon
                        size={20}
                        className={
                          isActive(link.href) ? "text-white" : "text-gray-500"
                        }
                      />
                    )}
                    <span className="text-lg font-medium">{link.name}</span>
                    {link.badge && (
                      <Badge className="ml-auto bg-red-500 text-white text-xs">
                        {link.badge}
                      </Badge>
                    )}
                  </Link>
                ))}
              </div>

              <Separator className="my-6" />

              {/* Categories */}
              <div className="mb-8">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 px-4">
                  Categories
                </h3>
                <div className="space-y-2">
                  {categories.map(category => (
                    <Link
                      key={category.name}
                      to={category.href}
                      onClick={closeMobileMenu}
                      className="flex items-center gap-3 py-3 px-4 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <div
                        className={`p-2 rounded-lg bg-gradient-to-br ${category.color} text-white`}
                      >
                        <category.icon size={20} />
                      </div>
                      <span className="font-medium">{category.name}</span>
                    </Link>
                  ))}
                </div>
              </div>

              {/* User Account Section - Mobile */}
              {user ? (
                <>
                  <Separator className="my-6" />
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl">
                      <Avatar className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-semibold">
                        {user.data?.user?.profileImage ? (
                          <img 
                            src={user.data.user.profileImage} 
                            alt="Profile" 
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          user.data?.user?.name?.charAt(0).toUpperCase() || <User size={18} />
                        )}
                      </Avatar>
                      <div>
                        <p className="font-medium text-gray-900">{user.data?.user?.name || "User"}</p>
                        <p className="text-sm text-gray-500">{user.data?.user?.email || "No email"}</p>
                      </div>
                    </div>

                    <Link
                      to="/profile"
                      onClick={closeMobileMenu}
                      className="flex items-center gap-3 py-3 px-4 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <User size={20} />
                      <span className="font-medium">Profile</span>
                    </Link>

                    <Link
                      to="/cart"
                      onClick={closeMobileMenu}
                      className="flex items-center gap-3 py-3 px-4 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <ShoppingCart size={20} />
                      <span className="font-medium">
                        Cart ({cartItemCount})
                      </span>
                    </Link>

                    <Link
                      to="/wishlist"
                      onClick={closeMobileMenu}
                      className="flex items-center gap-3 py-3 px-4 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <Heart size={20} />
                      <span className="font-medium">
                        Wishlist ({wishlistItemCount})
                      </span>
                    </Link>

                    <Button
                      variant="ghost"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 py-3 px-4 rounded-xl text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors justify-start"
                    >
                      <LogOut size={20} />
                      <span className="font-medium">Logout</span>
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <Separator className="my-6" />
                  <Button
                    variant="default"
                    onClick={() => {
                      navigate("/login");
                      closeMobileMenu();
                    }}
                    className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-xl shadow-lg"
                  >
                    <User size={20} className="mr-2" />
                    Sign In
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
});

Navbar.displayName = "Navbar";

export default Navbar;
