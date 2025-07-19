import mongoose from "mongoose";
import productModel from "./DB/models/productModel.js";
import categoryModel from "./DB/models/categoryModel.js";
import dotenv from "dotenv";

dotenv.config();

const sampleProducts = [
  {
    name: "iPhone 15 Pro Max",
    description: "The most advanced iPhone with titanium design, A17 Pro chip, and professional camera system.",
    price: 1199.99,
    category: "smartphones",
    image: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=2087&q=80",
    stockQuantity: 50,
    isFeatured: true,
    averageRating: 4.8,
    reviewCount: 2847
  },
  {
    name: "Samsung Galaxy S24 Ultra",
    description: "Ultimate Android flagship with S Pen, 200MP camera, and AI-powered features.",
    price: 1099.99,
    category: "smartphones",
    image: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=2087&q=80",
    stockQuantity: 32,
    isFeatured: true,
    averageRating: 4.7,
    reviewCount: 1923
  },
  {
    name: "MacBook Pro 16-inch",
    description: "Professional laptop with M3 Pro chip, 16-inch Liquid Retina XDR display, and up to 22-core GPU.",
    price: 2499.99,
    category: "laptops",
    image: "https://images.unsplash.com/photo-1587202372634-32705e3bf49c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2106&q=80",
    stockQuantity: 25,
    isFeatured: true,
    averageRating: 4.9,
    reviewCount: 1567
  },
  {
    name: "PlayStation 5",
    description: "Next-generation gaming console with lightning-fast loading, haptic feedback, and 4K graphics.",
    price: 499.99,
    category: "gaming",
    image: "https://images.unsplash.com/photo-1587202372634-32705e3bf49c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2106&q=80",
    stockQuantity: 40,
    isFeatured: true,
    averageRating: 4.8,
    reviewCount: 3245
  },
  {
    name: "Amazon Echo Dot",
    description: "Smart speaker with Alexa voice control, perfect for smart home automation and music playback.",
    price: 49.99,
    category: "smart-home",
    image: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?ixlib=rb-4.0.3&auto=format&fit=crop&w=2061&q=80",
    stockQuantity: 100,
    isFeatured: false,
    averageRating: 4.5,
    reviewCount: 1876
  },
  {
    name: "Sony WH-1000XM5",
    description: "Premium wireless noise-canceling headphones with 30-hour battery life and exceptional sound quality.",
    price: 399.99,
    category: "audio",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
    stockQuantity: 45,
    isFeatured: true,
    averageRating: 4.9,
    reviewCount: 2987
  },
  {
    name: "iPad Pro 12.9-inch",
    description: "Most powerful iPad with M2 chip, Liquid Retina XDR display, and Apple Pencil support.",
    price: 1099.99,
    category: "tablets",
    image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
    stockQuantity: 35,
    isFeatured: true,
    averageRating: 4.8,
    reviewCount: 1876
  }
];

async function addSampleProducts() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    // Create categories first
    const categories = [
      { name: "Smartphones", description: "Latest smartphones and mobile devices" },
      { name: "Laptops", description: "High-performance laptops and notebooks" },
      { name: "Gaming", description: "Gaming consoles and accessories" },
      { name: "Smart Home", description: "Smart home devices and automation" },
      { name: "Audio", description: "Headphones, speakers, and audio equipment" },
      { name: "Tablets", description: "Tablets and e-readers" }
    ];

    const createdCategories = [];
    for (const categoryData of categories) {
      const existingCategory = await categoryModel.findOne({ name: categoryData.name });
      if (!existingCategory) {
        const category = await categoryModel.create(categoryData);
        createdCategories.push(category);
        console.log(`Created category: ${category.name}`);
      } else {
        createdCategories.push(existingCategory);
        console.log(`Category already exists: ${existingCategory.name}`);
      }
    }

    // Add products
    for (const productData of sampleProducts) {
      // Find the corresponding category
      const category = createdCategories.find(cat => 
        cat.name.toLowerCase() === productData.category || 
        cat.name.toLowerCase().replace(/\s+/g, '-') === productData.category
      );
      
      if (category) {
        // Check if product already exists
        const existingProduct = await productModel.findOne({ name: productData.name });
        if (!existingProduct) {
          const product = await productModel.create({
            ...productData,
            categoryId: category._id
          });
          console.log(`Created product: ${product.name}`);
        } else {
          console.log(`Product already exists: ${existingProduct.name}`);
        }
      } else {
        console.log(`Category not found for product: ${productData.name}`);
      }
    }

    console.log("Sample products added successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error adding sample products:", error);
    process.exit(1);
  }
}

addSampleProducts(); 