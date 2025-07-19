import mongoose from "mongoose";

const wishlistSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    products: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        addedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
wishlistSchema.index({ user: 1 });

// Virtual for product count
wishlistSchema.virtual("productCount").get(function () {
  return this.products.length;
});

// Ensure virtuals are serialized
wishlistSchema.set("toJSON", { virtuals: true });
wishlistSchema.set("toObject", { virtuals: true });

// Static method to get or create wishlist for user
wishlistSchema.statics.getOrCreateWishlist = async function (userId) {
  let wishlist = await this.findOne({ user: userId }).populate({
    path: "products.product",
    select: "name price image description category isActive stockQuantity",
  });

  if (!wishlist) {
    wishlist = await this.create({ user: userId, products: [] });
  }

  return wishlist;
};

// Method to add product to wishlist
wishlistSchema.methods.addProduct = async function (productId) {
  const existingProduct = this.products.find((item) => {
    const itemId = item.product._id ? item.product._id.toString() : item.product.toString();
    return itemId === productId.toString();
  });

  if (!existingProduct) {
    this.products.push({ product: productId });
    await this.save();
    return true; // Product added
  }

  return false; // Product already exists
};

// Method to remove product from wishlist
wishlistSchema.methods.removeProduct = async function (productId) {
  const initialLength = this.products.length;
  
  // Handle both populated and unpopulated products
  this.products = this.products.filter((item) => {
    const itemId = item.product._id ? item.product._id.toString() : item.product.toString();
    return itemId !== productId.toString();
  });

  if (this.products.length !== initialLength) {
    await this.save();
    return true; // Product removed
  }

  return false; // Product not found
};

// Method to check if product is in wishlist
wishlistSchema.methods.hasProduct = function (productId) {
  return this.products.some((item) => {
    const itemId = item.product._id ? item.product._id.toString() : item.product.toString();
    return itemId === productId.toString();
  });
};

// Method to clear wishlist
wishlistSchema.methods.clearWishlist = async function () {
  this.products = [];
  await this.save();
};

const wishlistModel = mongoose.model("Wishlist", wishlistSchema);

export default wishlistModel; 