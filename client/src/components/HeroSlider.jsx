/** @format */

import React, { useState, useEffect, memo, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Volume2,
  Star,
  TrendingUp,
  Zap,
  Award,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";
import "../App.css";

const HeroSlider = memo(() => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState({});
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const intervalRef = useRef(null);

  const heroSlides = [
    {
      id: 1,
      title: "iPhone 15 Pro Max",
      subtitle: "Latest Technology",
      description:
        "Experience the future with titanium design, advanced cameras, and the powerful A17 Pro chip.",
      image:
        "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2087&q=80",
      cta: "Shop iPhones",
      link: "/shop?category=smartphones",
      accent: "from-blue-500 to-purple-600",
      badge: "New",
      icon: Sparkles,
      stats: { rating: "4.9", reviews: "12.5K" },
    },
    {
      id: 2,
      title: "Gaming Powerhouse",
      subtitle: "Ultimate Performance",
      description:
        "Dominate every game with RTX 4080, 32GB RAM, and lightning-fast SSD storage.",
      image:
        "https://images.unsplash.com/photo-1587202372634-32705e3bf49c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2106&q=80",
      cta: "Game On",
      link: "/shop?category=gaming",
      accent: "from-green-500 to-emerald-600",
      badge: "Hot",
      icon: Zap,
      stats: { rating: "4.8", reviews: "8.2K" },
    },
    {
      id: 3,
      title: "Smart Home Revolution",
      subtitle: "Connected Living",
      description:
        "Transform your home into a smart ecosystem with voice control, automation, and security.",
      image:
        "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2061&q=80",
      cta: "Smart Home",
      link: "/shop?category=smart-home",
      accent: "from-orange-500 to-red-600",
      badge: "Trending",
      icon: TrendingUp,
      stats: { rating: "4.7", reviews: "6.8K" },
    },
    {
      id: 4,
      title: "Audio Excellence",
      subtitle: "Premium Sound",
      description:
        "Immerse yourself in studio-quality sound with noise cancellation and spatial audio.",
      image:
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      cta: "Listen Now",
      link: "/shop?category=audio",
      accent: "from-purple-500 to-pink-600",
      badge: "Premium",
      icon: Volume2,
      stats: { rating: "4.9", reviews: "15.3K" },
    },
    {
      id: 5,
      title: "Professional Workspace",
      subtitle: "Work Redefined",
      description:
        "Boost productivity with professional-grade monitors, keyboards, and ergonomic accessories.",
      image:
        "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      cta: "Shop Tools",
      link: "/shop",
      accent: "from-indigo-500 to-blue-600",
      badge: "Pro",
      icon: Award,
      stats: { rating: "4.8", reviews: "9.1K" },
    },
  ];

  // Preload images
  useEffect(() => {
    const preloadImages = () => {
      heroSlides.forEach((slide, index) => {
        const img = new Image();
        img.onload = () => {
          setImageLoaded(prev => ({ ...prev, [index]: true }));
        };
        img.src = slide.image;
      });
    };
    preloadImages();
  }, [heroSlides]);

  // Auto-play functionality with cleanup
  useEffect(() => {
    if (!isPlaying || isHovered) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % heroSlides.length);
    }, 6000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, isHovered, heroSlides.length]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const nextSlide = useCallback(() => {
    setCurrentSlide(prev => (prev + 1) % heroSlides.length);
  }, [heroSlides.length]);

  const prevSlide = useCallback(() => {
    setCurrentSlide(prev => (prev - 1 + heroSlides.length) % heroSlides.length);
  }, [heroSlides.length]);

  const goToSlide = useCallback(index => {
    setCurrentSlide(index);
  }, []);

  const togglePlayPause = useCallback(() => {
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  // Touch handlers for mobile swipe
  const handleTouchStart = useCallback(e => {
    setTouchStart(e.targetTouches[0].clientX);
  }, []);

  const handleTouchMove = useCallback(e => {
    setTouchEnd(e.targetTouches[0].clientX);
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      nextSlide();
    } else if (isRightSwipe) {
      prevSlide();
    }
  }, [touchStart, touchEnd, nextSlide, prevSlide]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = e => {
      if (e.key === "ArrowRight") nextSlide();
      if (e.key === "ArrowLeft") prevSlide();
      if (e.key === " ") {
        e.preventDefault();
        togglePlayPause();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [nextSlide, prevSlide, togglePlayPause]);

  const currentSlideData = heroSlides[currentSlide];

  return (
    <div
      className="relative w-full h-screen min-h-[600px] overflow-hidden bg-gray-900"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Background Slides */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          <div className="relative w-full h-full">
            {imageLoaded[currentSlide] ? (
              <img
                src={currentSlideData.image}
                alt={currentSlideData.title}
                className="w-full h-full object-cover"
                loading="eager"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            )}

            {/* Enhanced Multi-layer Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/20" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/40" />

            {/* Dynamic accent overlay */}
            <div
              className={`absolute inset-0 bg-gradient-to-r ${currentSlideData.accent} opacity-10`}
            />
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Content Overlay - Adjusted for navbar overlay */}
      <div className="absolute inset-0 flex items-center z-10 pt-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={`content-${currentSlide}`}
                initial={{ opacity: 0, y: 60 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -40 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-white"
              >
                {/* Badge */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="flex items-center gap-4 mb-4"
                >
                  <div
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r ${currentSlideData.accent} text-white font-semibold text-sm shadow-lg`}
                  >
                    <currentSlideData.icon size={16} />
                    {currentSlideData.badge}
                  </div>
                  <div className="flex items-center gap-2 text-yellow-400">
                    <Star size={16} fill="currentColor" />
                    <span className="font-semibold">
                      {currentSlideData.stats.rating}
                    </span>
                    <span className="text-gray-300">
                      ({currentSlideData.stats.reviews} reviews)
                    </span>
                  </div>
                </motion.div>

                {/* Subtitle */}
                <motion.p
                  initial={{ opacity: 0, x: -40 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                  className="text-xl md:text-2xl font-medium text-blue-300 mb-3 tracking-wide"
                >
                  {currentSlideData.subtitle}
                </motion.p>

                {/* Main Title */}
                <motion.h1
                  initial={{ opacity: 0, x: -40 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                  className="text-5xl md:text-7xl lg:text-8xl font-black mb-6 leading-tight"
                >
                  <span
                    className={`bg-gradient-to-r ${currentSlideData.accent} bg-clip-text text-transparent`}
                  >
                    {currentSlideData.title}
                  </span>
                </motion.h1>

                {/* Description */}
                <motion.p
                  initial={{ opacity: 0, x: -40 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                  className="text-xl md:text-2xl text-gray-200 mb-8 max-w-2xl leading-relaxed"
                >
                  {currentSlideData.description}
                </motion.p>

                {/* CTA Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.7 }}
                  className="flex flex-col sm:flex-row gap-4"
                >
                  <Link to={currentSlideData.link}>
                    <motion.button
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      className={`group relative overflow-hidden bg-gradient-to-r ${currentSlideData.accent} text-white font-bold text-lg px-8 py-4 rounded-xl shadow-2xl transition-all duration-300`}
                    >
                      <span className="relative z-10">
                        {currentSlideData.cta}
                      </span>
                      <div className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                    </motion.button>
                  </Link>

                  <Link to="/shop">
                    <motion.button
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      className="group relative overflow-hidden bg-white/10 backdrop-blur-md border-2 border-white/30 text-white font-bold text-lg px-8 py-4 rounded-xl hover:bg-white/20 transition-all duration-300"
                    >
                      <span className="relative z-10">Browse All</span>
                      <div className="absolute inset-0 bg-white/10 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                    </motion.button>
                  </Link>
                </motion.div>

                {/* Additional Info */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.8 }}
                  className="flex items-center gap-6 mt-8 text-gray-300"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span className="text-sm font-medium">Free Shipping</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <span className="text-sm font-medium">2-Year Warranty</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                    <span className="text-sm font-medium">24/7 Support</span>
                  </div>
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Navigation Arrows - Adjusted z-index */}
      <motion.button
        whileHover={{ scale: 1.1, x: -5 }}
        whileTap={{ scale: 0.95 }}
        onClick={prevSlide}
        className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 bg-white/10 backdrop-blur-md hover:bg-white/20 text-white p-4 rounded-full transition-all duration-300 shadow-lg z-30 border border-white/20"
        aria-label="Previous slide"
      >
        <ChevronLeft size={24} />
      </motion.button>

      <motion.button
        whileHover={{ scale: 1.1, x: 5 }}
        whileTap={{ scale: 0.95 }}
        onClick={nextSlide}
        className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 bg-white/10 backdrop-blur-md hover:bg-white/20 text-white p-4 rounded-full transition-all duration-300 shadow-lg z-30 border border-white/20"
        aria-label="Next slide"
      >
        <ChevronRight size={24} />
      </motion.button>

      {/* Slide Indicators - Adjusted z-index */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex space-x-3 z-30">
        {heroSlides.map((_, index) => (
          <motion.button
            key={index}
            whileHover={{ scale: 1.3 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => goToSlide(index)}
            className={`relative transition-all duration-300 ${
              index === currentSlide
                ? "w-8 h-3 bg-white rounded-full"
                : "w-3 h-3 bg-white/50 hover:bg-white/75 rounded-full"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          >
            {index === currentSlide && (
              <motion.div
                layoutId="activeIndicator"
                className={`absolute inset-0 bg-gradient-to-r ${currentSlideData.accent} rounded-full`}
              />
            )}
          </motion.button>
        ))}
      </div>

      {/* Control Panel - Adjusted z-index */}
      <div className="absolute bottom-8 right-8 flex items-center gap-3 z-30">
        {/* Slide Counter */}
        <div className="bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-white text-sm font-medium border border-white/20">
          {currentSlide + 1} / {heroSlides.length}
        </div>

        {/* Play/Pause Button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={togglePlayPause}
          className="bg-white/10 backdrop-blur-md hover:bg-white/20 text-white p-3 rounded-full transition-all duration-300 border border-white/20 shadow-lg"
          aria-label={isPlaying ? "Pause slideshow" : "Play slideshow"}
        >
          {isPlaying ? <Pause size={16} /> : <Play size={16} />}
        </motion.button>
      </div>

      {/* Enhanced Progress Bar - Adjusted z-index */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-white/10 z-30">
        <motion.div
          key={currentSlide}
          initial={{ width: 0 }}
          animate={{ width: isPlaying && !isHovered ? "100%" : "0%" }}
          transition={{ duration: 6, ease: "linear" }}
          className={`h-full bg-gradient-to-r ${currentSlideData.accent} shadow-lg`}
        />
      </div>

      {/* Floating Elements - Adjusted z-index */}
      <div className="absolute top-20 right-20 opacity-20 pointer-events-none z-20">
        <motion.div
          animate={{
            y: [0, -20, 0],
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="text-white"
        >
          <Sparkles size={32} />
        </motion.div>
      </div>
    </div>
  );
});

HeroSlider.displayName = "HeroSlider";

export default HeroSlider;
