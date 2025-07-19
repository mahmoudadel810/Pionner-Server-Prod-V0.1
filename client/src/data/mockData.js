// Mock Data for Electronics E-commerce Store

export const categories = [
  {
    id: 1,
    name: "Smartphones",
    slug: "smartphones",
    description: "Latest smartphones and mobile devices",
    image: "/src/assets/hero2.jpg",
  },
  {
    id: 2,
    name: "Laptops",
    slug: "laptops",
    description: "High-performance laptops and notebooks",
    image: "/src/assets/hero3.jpg",
  },
  {
    id: 3,
    name: "Gaming",
    slug: "gaming",
    description: "Gaming accessories and peripherals",
    image: "/src/assets/hero3.jpg",
  },
  {
    id: 4,
    name: "Smart Home",
    slug: "smart-home",
    description: "Smart home devices and automation",
    image: "/src/assets/hero4.webp",
  },
  {
    id: 5,
    name: "Audio",
    slug: "audio",
    description: "Headphones, speakers, and audio equipment",
    image: "/src/assets/hero1.jpg",
  },
  {
    id: 6,
    name: "Tablets",
    slug: "tablets",
    description: "Tablets and e-readers",
    image: "/src/assets/hero2.jpg",
  },
];

export const products = [
  // Smartphones
  {
    id: 1,
    name: "iPhone 15 Pro Max",
    slug: "iphone-15-pro-max",
    description:
      "The most advanced iPhone with titanium design, A17 Pro chip, and professional camera system.",
    price: 1199.99,
    originalPrice: 1299.99,
    discount: 8,
    category: "smartphones",
    categoryId: 1,
    brand: "Apple",
    rating: 4.8,
    reviewCount: 2847,
    inStock: true,
    stockCount: 45,
    images: ["/src/assets/hero2.jpg", "/src/assets/hero1.jpg"],
    features: [
      "6.7-inch Super Retina XDR display",
      "A17 Pro chip with 6-core GPU",
      "Pro camera system with 48MP main",
      "Titanium design",
      "Action Button",
    ],
    specifications: {
      display: "6.7-inch Super Retina XDR",
      processor: "A17 Pro",
      storage: "256GB",
      camera: "48MP + 12MP + 12MP",
      battery: "Up to 29 hours video playback",
      os: "iOS 17",
    },
    tags: ["featured", "new", "bestseller"],
    isNew: true,
    isFeatured: true,
    isBestseller: true,
  },
  {
    id: 2,
    name: "Samsung Galaxy S24 Ultra",
    slug: "samsung-galaxy-s24-ultra",
    description:
      "Ultimate Android flagship with S Pen, 200MP camera, and AI-powered features.",
    price: 1099.99,
    originalPrice: 1199.99,
    discount: 8,
    category: "smartphones",
    categoryId: 1,
    brand: "Samsung",
    rating: 4.7,
    reviewCount: 1923,
    inStock: true,
    stockCount: 32,
    images: ["/src/assets/hero2.jpg", "/src/assets/hero1.jpg"],
    features: [
      "6.8-inch Dynamic AMOLED 2X",
      "Snapdragon 8 Gen 3",
      "200MP quad camera system",
      "Built-in S Pen",
      "AI photo editing",
    ],
    specifications: {
      display: "6.8-inch Dynamic AMOLED 2X",
      processor: "Snapdragon 8 Gen 3",
      storage: "256GB",
      camera: "200MP + 50MP + 12MP + 10MP",
      battery: "5000mAh",
      os: "Android 14",
    },
    tags: ["featured", "bestseller"],
    isNew: false,
    isFeatured: true,
    isBestseller: true,
  },
  {
    id: 3,
    name: "Google Pixel 8 Pro",
    slug: "google-pixel-8-pro",
    description:
      "AI-powered photography and pure Android experience with Google's latest innovations.",
    price: 899.99,
    originalPrice: 999.99,
    discount: 10,
    category: "smartphones",
    categoryId: 1,
    brand: "Google",
    rating: 4.6,
    reviewCount: 1456,
    inStock: true,
    stockCount: 28,
    images: ["/src/assets/hero2.jpg", "/src/assets/hero1.jpg"],
    features: [
      "6.7-inch LTPO OLED display",
      "Google Tensor G3",
      "AI-powered camera features",
      "Magic Eraser",
      "7 years of updates",
    ],
    specifications: {
      display: "6.7-inch LTPO OLED",
      processor: "Google Tensor G3",
      storage: "128GB",
      camera: "50MP + 48MP + 48MP",
      battery: "5050mAh",
      os: "Android 14",
    },
    tags: ["sale"],
    isNew: false,
    isFeatured: false,
    isBestseller: false,
  },

  // Laptops
  {
    id: 4,
    name: "MacBook Pro 16-inch M3 Max",
    slug: "macbook-pro-16-m3-max",
    description:
      "Ultimate creative powerhouse with M3 Max chip, Liquid Retina XDR display, and all-day battery.",
    price: 3499.99,
    originalPrice: 3699.99,
    discount: 5,
    category: "laptops",
    categoryId: 2,
    brand: "Apple",
    rating: 4.9,
    reviewCount: 892,
    inStock: true,
    stockCount: 15,
    images: ["/src/assets/hero3.jpg", "/src/assets/hero1.jpg"],
    features: [
      "16.2-inch Liquid Retina XDR",
      "M3 Max chip with 40-core GPU",
      "128GB unified memory",
      "22-hour battery life",
      "Six Thunderbolt 4 ports",
    ],
    specifications: {
      display: "16.2-inch Liquid Retina XDR",
      processor: "Apple M3 Max",
      memory: "128GB",
      storage: "1TB SSD",
      graphics: "40-core GPU",
      battery: "Up to 22 hours",
    },
    tags: ["featured", "new"],
    isNew: true,
    isFeatured: true,
    isBestseller: false,
  },
  {
    id: 5,
    name: "Dell XPS 15 OLED",
    slug: "dell-xps-15-oled",
    description:
      "Premium Windows laptop with stunning OLED display, Intel Core i9, and NVIDIA RTX graphics.",
    price: 2299.99,
    originalPrice: 2499.99,
    discount: 8,
    category: "laptops",
    categoryId: 2,
    brand: "Dell",
    rating: 4.5,
    reviewCount: 634,
    inStock: true,
    stockCount: 22,
    images: ["/src/assets/hero3.jpg", "/src/assets/hero1.jpg"],
    features: [
      "15.6-inch 4K OLED display",
      "Intel Core i9-13900H",
      "NVIDIA RTX 4070",
      "32GB DDR5 RAM",
      "1TB PCIe SSD",
    ],
    specifications: {
      display: "15.6-inch 4K OLED",
      processor: "Intel Core i9-13900H",
      memory: "32GB DDR5",
      storage: "1TB SSD",
      graphics: "NVIDIA RTX 4070",
      battery: "Up to 13 hours",
    },
    tags: ["bestseller"],
    isNew: false,
    isFeatured: false,
    isBestseller: true,
  },
  {
    id: 6,
    name: "ASUS ROG Zephyrus G16",
    slug: "asus-rog-zephyrus-g16",
    description:
      "Ultra-slim gaming laptop with AMD Ryzen 9, RTX 4080, and 240Hz display for competitive gaming.",
    price: 2799.99,
    originalPrice: 2999.99,
    discount: 7,
    category: "laptops",
    categoryId: 2,
    brand: "ASUS",
    rating: 4.7,
    reviewCount: 445,
    inStock: true,
    stockCount: 18,
    images: ["/src/assets/hero3.jpg", "/src/assets/hero1.jpg"],
    features: [
      "16-inch QHD+ 240Hz display",
      "AMD Ryzen 9 7940HS",
      "NVIDIA RTX 4080",
      "32GB DDR5 RAM",
      "ROG Intelligent Cooling",
    ],
    specifications: {
      display: "16-inch QHD+ 240Hz",
      processor: "AMD Ryzen 9 7940HS",
      memory: "32GB DDR5",
      storage: "1TB SSD",
      graphics: "NVIDIA RTX 4080",
      battery: "Up to 10 hours",
    },
    tags: ["gaming", "new"],
    isNew: true,
    isFeatured: false,
    isBestseller: false,
  },

  // Gaming
  {
    id: 7,
    name: "PlayStation 5 Console",
    slug: "playstation-5-console",
    description:
      "Next-gen gaming console with ultra-high speed SSD, ray tracing, and 4K gaming capabilities.",
    price: 499.99,
    originalPrice: 499.99,
    discount: 0,
    category: "gaming",
    categoryId: 3,
    brand: "Sony",
    rating: 4.8,
    reviewCount: 3421,
    inStock: true,
    stockCount: 8,
    images: ["/src/assets/hero3.jpg", "/src/assets/hero1.jpg"],
    features: [
      "Custom AMD Zen 2 CPU",
      "Ultra-high speed SSD",
      "Ray tracing support",
      "4K gaming at 120fps",
      "3D audio technology",
    ],
    specifications: {
      cpu: "Custom AMD Zen 2",
      gpu: "Custom RDNA 2",
      memory: "16GB GDDR6",
      storage: "825GB SSD",
      optical: "4K UHD Blu-ray",
      connectivity: "Wi-Fi 6, Bluetooth 5.1",
    },
    tags: ["featured", "bestseller"],
    isNew: false,
    isFeatured: true,
    isBestseller: true,
  },
  {
    id: 8,
    name: "Logitech G Pro X Superlight 2",
    slug: "logitech-g-pro-x-superlight-2",
    description:
      "Ultra-lightweight wireless gaming mouse designed for esports professionals.",
    price: 159.99,
    originalPrice: 179.99,
    discount: 11,
    category: "gaming",
    categoryId: 3,
    brand: "Logitech",
    rating: 4.6,
    reviewCount: 1876,
    inStock: true,
    stockCount: 67,
    images: ["/src/assets/hero3.jpg", "/src/assets/hero1.jpg"],
    features: [
      "Ultra-lightweight 60g design",
      "HERO 25K sensor",
      "LIGHTSPEED wireless",
      "95-hour battery life",
      "Zero additive PTFE feet",
    ],
    specifications: {
      sensor: "HERO 25K",
      dpi: "25,600 DPI",
      weight: "60g",
      battery: "95 hours",
      connectivity: "LIGHTSPEED wireless",
      buttons: "5 programmable",
    },
    tags: ["gaming", "bestseller"],
    isNew: false,
    isFeatured: false,
    isBestseller: true,
  },

  // Smart Home
  {
    id: 9,
    name: "Amazon Echo Dot (5th Gen)",
    slug: "amazon-echo-dot-5th-gen",
    description:
      "Smart speaker with Alexa, improved audio, and temperature sensor for smart home control.",
    price: 49.99,
    originalPrice: 59.99,
    discount: 17,
    category: "smart-home",
    categoryId: 4,
    brand: "Amazon",
    rating: 4.4,
    reviewCount: 8934,
    inStock: true,
    stockCount: 156,
    images: ["/src/assets/hero4.webp", "/src/assets/hero1.jpg"],
    features: [
      "Improved audio quality",
      "Built-in temperature sensor",
      "Alexa voice control",
      "Smart home hub",
      "Tap to snooze",
    ],
    specifications: {
      speaker: "1.73-inch driver",
      connectivity: "Wi-Fi, Bluetooth",
      voice: "Alexa built-in",
      sensors: "Temperature sensor",
      power: "15W adapter",
      dimensions: "3.9 x 3.9 x 3.5 inches",
    },
    tags: ["sale", "bestseller"],
    isNew: false,
    isFeatured: false,
    isBestseller: true,
  },
  {
    id: 10,
    name: "Nest Learning Thermostat",
    slug: "nest-learning-thermostat",
    description:
      "Smart thermostat that learns your schedule and programs itself to help save energy.",
    price: 249.99,
    originalPrice: 279.99,
    discount: 11,
    category: "smart-home",
    categoryId: 4,
    brand: "Google",
    rating: 4.3,
    reviewCount: 2156,
    inStock: true,
    stockCount: 34,
    images: ["/src/assets/hero4.webp", "/src/assets/hero1.jpg"],
    features: [
      "Auto-learning capability",
      "Energy-saving features",
      "Remote control via app",
      "Works with Alexa & Google",
      "Professional installation",
    ],
    specifications: {
      display: "2.08-inch LCD",
      connectivity: "Wi-Fi 802.11n",
      compatibility: "95% of systems",
      sensors: "Temperature, humidity, proximity",
      power: "Rechargeable lithium-ion",
      dimensions: "3.3 x 3.3 x 1.2 inches",
    },
    tags: ["smart-home"],
    isNew: false,
    isFeatured: false,
    isBestseller: false,
  },

  // Audio
  {
    id: 11,
    name: "Sony WH-1000XM5",
    slug: "sony-wh-1000xm5",
    description:
      "Industry-leading noise canceling headphones with exceptional sound quality and 30-hour battery.",
    price: 349.99,
    originalPrice: 399.99,
    discount: 13,
    category: "audio",
    categoryId: 5,
    brand: "Sony",
    rating: 4.7,
    reviewCount: 4567,
    inStock: true,
    stockCount: 43,
    images: ["/src/assets/hero1.jpg", "/src/assets/hero2.jpg"],
    features: [
      "Industry-leading noise canceling",
      "30-hour battery life",
      "Multipoint Bluetooth connection",
      "Quick Attention mode",
      "Speak-to-chat technology",
    ],
    specifications: {
      driver: "30mm dynamic",
      frequency: "4Hz-40kHz",
      battery: "30 hours (ANC on)",
      charging: "USB-C, 3 min = 3 hours",
      weight: "250g",
      connectivity: "Bluetooth 5.2",
    },
    tags: ["featured", "bestseller"],
    isNew: false,
    isFeatured: true,
    isBestseller: true,
  },
  {
    id: 12,
    name: "AirPods Pro (2nd Gen)",
    slug: "airpods-pro-2nd-gen",
    description:
      "Apple's premium wireless earbuds with adaptive transparency, spatial audio, and MagSafe charging.",
    price: 229.99,
    originalPrice: 249.99,
    discount: 8,
    category: "audio",
    categoryId: 5,
    brand: "Apple",
    rating: 4.8,
    reviewCount: 6789,
    inStock: true,
    stockCount: 89,
    images: ["/src/assets/hero1.jpg", "/src/assets/hero2.jpg"],
    features: [
      "Active Noise Cancellation",
      "Adaptive Transparency",
      "Spatial Audio",
      "MagSafe charging case",
      "Up to 6 hours listening time",
    ],
    specifications: {
      chip: "Apple H2",
      battery: "6 hours (ANC on)",
      case: "30 hours total",
      charging: "Lightning, MagSafe, Qi",
      water: "IPX4 rated",
      connectivity: "Bluetooth 5.3",
    },
    tags: ["featured", "new"],
    isNew: true,
    isFeatured: true,
    isBestseller: false,
  },

  // Tablets
  {
    id: 13,
    name: "iPad Pro 12.9-inch M2",
    slug: "ipad-pro-12-9-m2",
    description:
      "Ultimate iPad experience with M2 chip, Liquid Retina XDR display, and Apple Pencil support.",
    price: 1099.99,
    originalPrice: 1199.99,
    discount: 8,
    category: "tablets",
    categoryId: 6,
    brand: "Apple",
    rating: 4.8,
    reviewCount: 1234,
    inStock: true,
    stockCount: 26,
    images: ["/src/assets/hero2.jpg", "/src/assets/hero1.jpg"],
    features: [
      "12.9-inch Liquid Retina XDR",
      "M2 chip performance",
      "Apple Pencil (2nd gen) support",
      "Magic Keyboard compatible",
      "All-day battery life",
    ],
    specifications: {
      display: "12.9-inch Liquid Retina XDR",
      chip: "Apple M2",
      storage: "256GB",
      camera: "12MP Wide, 10MP Ultra Wide",
      battery: "Up to 10 hours",
      connectivity: "Wi-Fi 6E, 5G option",
    },
    tags: ["featured"],
    isNew: false,
    isFeatured: true,
    isBestseller: false,
  },
  {
    id: 14,
    name: "Samsung Galaxy Tab S9 Ultra",
    slug: "samsung-galaxy-tab-s9-ultra",
    description:
      "Premium Android tablet with massive 14.6-inch display, S Pen included, and desktop-class performance.",
    price: 1199.99,
    originalPrice: 1299.99,
    discount: 8,
    category: "tablets",
    categoryId: 6,
    brand: "Samsung",
    rating: 4.6,
    reviewCount: 567,
    inStock: true,
    stockCount: 19,
    images: ["/src/assets/hero2.jpg", "/src/assets/hero1.jpg"],
    features: [
      "14.6-inch Dynamic AMOLED 2X",
      "Snapdragon 8 Gen 2",
      "S Pen included",
      "DeX desktop experience",
      "IP68 water resistance",
    ],
    specifications: {
      display: "14.6-inch Dynamic AMOLED 2X",
      processor: "Snapdragon 8 Gen 2",
      memory: "12GB RAM",
      storage: "256GB",
      camera: "13MP + 6MP rear, 12MP front",
      battery: "11,200mAh",
    },
    tags: ["new"],
    isNew: true,
    isFeatured: false,
    isBestseller: false,
  },
];

export const heroSlides = [
  {
    id: 1,
    title: "Latest Electronics",
    subtitle: "Discover cutting-edge technology",
    description:
      "Shop the newest smartphones, laptops, and gadgets with exclusive deals",
    image: "/src/assets/hero1.jpg",
    cta: "Shop Now",
    link: "/shop",
  },
  {
    id: 2,
    title: "Gaming Paradise",
    subtitle: "Level up your gaming experience",
    description:
      "Premium gaming gear, consoles, and accessories for every gamer",
    image: "/src/assets/hero3.jpg",
    cta: "Explore Gaming",
    link: "/shop/gaming",
  },
  {
    id: 3,
    title: "Smart Home Revolution",
    subtitle: "Transform your living space",
    description:
      "Intelligent devices that make your home smarter and more efficient",
    image: "/src/assets/hero4.webp",
    cta: "Go Smart",
    link: "/shop/smart-home",
  },
  {
    id: 4,
    title: "Professional Displays",
    subtitle: "Where technology meets retail",
    description:
      "Explore our premium electronics showcase and professional displays",
    image: "/src/assets/hero5.jpg",
    cta: "View Collection",
    link: "/shop",
  },
];

export const brands = [
  { id: 1, name: "Apple", logo: "/src/assets/hero1.jpg" },
  { id: 2, name: "Samsung", logo: "/src/assets/hero1.jpg" },
  { id: 3, name: "Google", logo: "/src/assets/hero1.jpg" },
  { id: 4, name: "Sony", logo: "/src/assets/hero1.jpg" },
  { id: 5, name: "Dell", logo: "/src/assets/hero1.jpg" },
  { id: 6, name: "ASUS", logo: "/src/assets/hero1.jpg" },
  { id: 7, name: "Logitech", logo: "/src/assets/hero1.jpg" },
  { id: 8, name: "Amazon", logo: "/src/assets/hero1.jpg" },
];

export const testimonials = [
  {
    id: 1,
    name: "Sarah Johnson",
    role: "Tech Enthusiast",
    content:
      "Amazing selection of electronics! Fast shipping and excellent customer service. My new laptop arrived perfectly packaged.",
    rating: 5,
    avatar: "/src/assets/hero1.jpg",
  },
  {
    id: 2,
    name: "Mike Chen",
    role: "Gamer",
    content:
      "Best place for gaming gear! Got my PS5 and accessories here. Great prices and authentic products.",
    rating: 5,
    avatar: "/src/assets/hero1.jpg",
  },
  {
    id: 3,
    name: "Emily Davis",
    role: "Smart Home Owner",
    content:
      "Transformed my home with their smart devices. The setup guides were helpful and support was responsive.",
    rating: 5,
    avatar: "/src/assets/hero1.jpg",
  },
];

export const stats = [
  { label: "Happy Customers", value: "50K+", icon: "users" },
  { label: "Products Sold", value: "200K+", icon: "package" },
  { label: "Countries Served", value: "25+", icon: "globe" },
  { label: "Years Experience", value: "10+", icon: "award" },
];

// Helper functions
export const getProductsByCategory = categorySlug => {
  return products.filter(product => product.category === categorySlug);
};

export const getFeaturedProducts = () => {
  return products.filter(product => product.isFeatured);
};

export const getBestsellerProducts = () => {
  return products.filter(product => product.isBestseller);
};

export const getNewProducts = () => {
  return products.filter(product => product.isNew);
};

export const getSaleProducts = () => {
  return products.filter(product => product.discount > 0);
};

export const getProductById = id => {
  return products.find(product => product.id === parseInt(id));
};

export const getProductBySlug = slug => {
  return products.find(product => product.slug === slug);
};

export const searchProducts = query => {
  const lowercaseQuery = query.toLowerCase();
  return products.filter(
    product =>
      product.name.toLowerCase().includes(lowercaseQuery) ||
      product.description.toLowerCase().includes(lowercaseQuery) ||
      product.brand.toLowerCase().includes(lowercaseQuery) ||
      product.category.toLowerCase().includes(lowercaseQuery)
  );
};

export const filterProducts = filters => {
  let filteredProducts = [...products];

  if (filters.category) {
    filteredProducts = filteredProducts.filter(
      product => product.category === filters.category
    );
  }

  if (filters.brand) {
    filteredProducts = filteredProducts.filter(product =>
      filters.brand.includes(product.brand)
    );
  }

  if (filters.priceRange) {
    filteredProducts = filteredProducts.filter(
      product =>
        product.price >= filters.priceRange.min &&
        product.price <= filters.priceRange.max
    );
  }

  if (filters.rating) {
    filteredProducts = filteredProducts.filter(
      product => product.rating >= filters.rating
    );
  }

  if (filters.inStock) {
    filteredProducts = filteredProducts.filter(product => product.inStock);
  }

  return filteredProducts;
};

export const sortProducts = (products, sortBy) => {
  const sortedProducts = [...products];

  switch (sortBy) {
    case "price-low":
      return sortedProducts.sort((a, b) => a.price - b.price);
    case "price-high":
      return sortedProducts.sort((a, b) => b.price - a.price);
    case "rating":
      return sortedProducts.sort((a, b) => b.rating - a.rating);
    case "newest":
      return sortedProducts.sort((a, b) => b.id - a.id);
    case "name":
      return sortedProducts.sort((a, b) => a.name.localeCompare(b.name));
    default:
      return sortedProducts;
  }
};
