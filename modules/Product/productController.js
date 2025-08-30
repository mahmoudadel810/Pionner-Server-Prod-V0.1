import productModel from "../../DB/models/productModel.js";
import categoryModel from "../../DB/models/categoryModel.js";
import { redis } from "../../utils/redis.js";
import { errorHandler } from "../../utils/errorHandler.js";
import { paginationHelper, buildSearchQuery, buildPaginationResponse } from "../../utils/pagination.js";
import { deleteFromCloudinary, deleteMultipleFromCloudinary, uploadToCloudinary } from "../../utils/multer.js";
import logger from "../../utils/logger.js";

//==================================Get All Products======================================

export const getAllProducts = async (req, res, next) => {
	try {
		const { page = 1, limit = 10, search = "", category = "", sortBy = "createdAt", sortOrder = "desc" } = req.query;

		// Build search query
		const searchQuery = buildSearchQuery({
			search,
			searchFields: ["name", "description", "category"]
		});

		// Add category filter (case-insensitive)
		if (category) {
			searchQuery.category = { $regex: new RegExp(`^${category}$`, 'i') };
		}

		// Get total count
		const totalCount = await productModel.countDocuments(searchQuery);

		// Build pagination
		const pagination = paginationHelper({
			page,
			limit,
			totalCount,
			search
		});

		// Build sort object
		const sortObject = {};
		sortObject[sortBy] = sortOrder === 'desc' ? -1 : 1;

		// Get products with pagination
		const products = await productModel.find(searchQuery)
			.sort(sortObject)
			.skip(pagination.skip)
			.limit(pagination.limit)
			.lean();

		const response = buildPaginationResponse({
			data: products,
			pagination,
			message: `${totalCount} products found`
		});

		res.json(response);
	} catch (error) {
		errorHandler(error, req, res, next);
	}
};

//==================================Get Search Suggestions======================================

export const getSearchSuggestions = async (req, res, next) => {
	try {
		const { search = "", limit = 5 } = req.query;

		if (!search.trim()) {
			return res.json({
				success: true,
				message: "No search term provided",
				data: []
			});
		}

		// Build search query for suggestions
		const searchQuery = buildSearchQuery({
			search,
			searchFields: ["name", "description", "category"]
		});

		// Get product names for suggestions
		const suggestions = await productModel.find(searchQuery)
			.select('name category _id')
			.limit(parseInt(limit))
			.lean();

		// Format suggestions
		const formattedSuggestions = suggestions.map(product => ({
			name: product.name,
			category: product.category,
			_id: product._id
		}));

		res.json({
			success: true,
			message: "Search suggestions retrieved successfully",
			data: formattedSuggestions
		});
	} catch (error) {
		errorHandler(error, req, res, next);
	}
};

//==================================Get Featured Products======================================

export const getFeaturedProducts = async (req, res, next) => {
    try {
        // Check if Redis is available
        if (redis) {
            try {
                let featuredProducts = await redis.get("featured_products");
                if (featuredProducts) {
                    try {
                        const parsed = JSON.parse(featuredProducts);
                        return res.json({
                            success: true,
                            message: "Featured products retrieved from cache",
                            data: parsed
                        });
                    } catch (parseErr) {
                        logger.error("Error parsing featured products from Redis cache", parseErr);
                        // Fallback to DB fetch below
                    }
                }
            } catch (redisErr) {
                logger.error("Redis error in getFeaturedProducts", redisErr);
                // Fallback to DB fetch below
            }
        }

        // Get featured products from database
        let featuredProducts;
        try {
            featuredProducts = await productModel.find({ isFeatured: true }).lean();
        } catch (dbErr) {
            logger.error("MongoDB error in getFeaturedProducts", dbErr);
            return errorHandler(dbErr, req, res, next);
        }

        if (!featuredProducts.length) {
            return res.status(404).json({ 
                success: false,
                message: "No featured products found" 
            });
        }

        // Cache the results if Redis is available
        if (redis) {
            try {
                await redis.set("featured_products", JSON.stringify(featuredProducts));
            } catch (cacheErr) {
                logger.error("Error caching featured products in Redis", cacheErr);
            }
        }

        res.json({
            success: true,
            message: "Featured products retrieved successfully",
            data: featuredProducts
        });
    } catch (error) {
        logger.error("Unhandled error in getFeaturedProducts", error);
        errorHandler(error, req, res, next);
    }
};

//==================================Create Product======================================

export const createProduct = async (req, res, next) => {
	try {
		const { name, description, price, image, category, stockQuantity } = req.body;
		console.log("================Body of the product added=========>", req.body);
		console.log("================Uploaded Files=========>", req.uploadedFiles);
		console.log("================Uploaded File=========>", req.uploadedFile);
		
		// Find category by name
		const categoryDoc = await categoryModel.findOne({ name: category });
		if (!categoryDoc) {
			return res.status(404).json({
				success: false,
				message: `Category '${category}' not found`
			});
		}
		
		// Handle multiple images from uploadToCloudinary middleware or single image
		let images = [];
		let mainImage = "";
		
		// Check for uploaded files from Cloudinary middleware
		if (req.uploadedFiles && req.uploadedFiles.length > 0) {
			// Multiple images uploaded
			images = req.uploadedFiles.map(file => file.url);
			mainImage = images[0];
			console.log("=== Multiple images processed ===", { count: images.length, mainImage });
		} else if (req.uploadedFile) {
			// Single image uploaded
			mainImage = req.uploadedFile.url;
			images = [mainImage];
			console.log("=== Single image processed ===", { mainImage });
		} else if (image) {
			// Image URL provided in body
			mainImage = image;
			images = [image];
			console.log("=== Image URL provided ===", { mainImage });
		} else {
			console.log("=== No images found ===");
			return res.status(400).json({
				success: false,
				message: "At least one image is required"
			});
		}

		const product = await productModel.create({
			name,
			description,
			price,
			image: mainImage,
			images: images,
			category,
			categoryId: categoryDoc._id,
			stockQuantity,
			isFeatured: false
		});

		// Update category product count
		await categoryModel.findByIdAndUpdate(categoryDoc._id, {
			$inc: { productCount: 1 },
			$push: { products: product._id }
		});

		res.status(201).json({
			success: true,
			message: "Product created successfully",
			data: product
		});
	} catch (error) {
		errorHandler(error, req, res, next);
	}
};

//==================================Create Product With Multiple Images======================================

export const createProductWithImages = async (req, res, next) => {
	try {
		const { name, description, price, category, stockQuantity } = req.body;

		// Find category by name
		const categoryDoc = await categoryModel.findOne({ name: category });
		if (!categoryDoc) {
			return res.status(404).json({
				success: false,
				message: `Category '${category}' not found`
			});
		}

		// Handle multiple images from uploadToCloudinary middleware
		let images = [];
		let mainImage = "";
		
		if (req.uploadedFiles && req.uploadedFiles.length > 0) {
			images = req.uploadedFiles.map(file => file.url);
			mainImage = images[0];
		}

		const product = await productModel.create({
			name,
			description,
			price,
			images: images,
			image: mainImage,
			category,
			categoryId: categoryDoc._id,
			stockQuantity,
			isFeatured: false
		});

		// Update category product count
		await categoryModel.findByIdAndUpdate(categoryDoc._id, {
			$inc: { productCount: 1 },
			$push: { products: product._id }
		});

		res.status(201).json({
			success: true,
			message: "Product created successfully with multiple images",
			data: product
		});
	} catch (error) {
		errorHandler(error, req, res, next);
	}
};

//==================================Upload Product Image======================================

export const uploadProductImage = async (req, res, next) => {
	try {
		const { id } = req.params;
		const product = await productModel.findById(id);

		if (!product) {
			return res.status(404).json({ 
				success: false,
				message: "Product not found" 
			});
		}

		if (!req.uploadedFile) {
			return res.status(400).json({ 
				success: false,
				message: "No image file provided" 
			});
		}

		// Delete old image from Cloudinary if exists
		if (product.image) {
			try {
				await deleteFromCloudinary(product.image);
			} catch (error) {
				logger.error("Error deleting old image:", error);
			}
		}

		// Update product with new image from Cloudinary
		product.image = req.uploadedFile.url;
		await product.save();

		res.json({
			success: true,
			message: "Product image uploaded successfully",
			data: {
				productId: product._id,
				imageUrl: product.image
			}
		});
	} catch (error) {
		errorHandler(error, req, res, next);
	}
};

//==================================Upload Multiple Product Images======================================

export const uploadProductImages = async (req, res, next) => {
	try {
		const { id } = req.params;
		const product = await productModel.findById(id);

		if (!product) {
			return res.status(404).json({ 
				success: false,
				message: "Product not found" 
			});
		}

		if (!req.uploadedFiles || req.uploadedFiles.length === 0) {
			return res.status(400).json({ 
				success: false,
				message: "No image files provided" 
			});
		}

		// Get new image URLs from Cloudinary
		const newImages = req.uploadedFiles.map(file => file.url);

		// Delete old images from Cloudinary if they exist
		if (product.images && product.images.length > 0) {
			for (const oldImage of product.images) {
				try {
					await deleteFromCloudinary(oldImage);
				} catch (error) {
					logger.error("Error deleting old image:", error);
				}
			}
		}

		// Update product with new images
		product.images = newImages;
		product.image = newImages[0] || ""; // Keep first image as main image
		await product.save();

		res.json({
			success: true,
			message: "Product images uploaded successfully",
			data: {
				productId: product._id,
				images: product.images,
				mainImage: product.image
			}
		});
	} catch (error) {
		errorHandler(error, req, res, next);
	}
};

//==================================Delete Product======================================

export const deleteProduct = async (req, res, next) => {
	try {
		const product = await productModel.findById(req.params.id);

		if (!product) {
			return res.status(404).json({ 
				success: false,
				message: "Product not found" 
			});
		}

		// Delete all images from Cloudinary
		const imagesToDelete = [];
		
		if (product.image) {
			imagesToDelete.push(product.image);
		}
		
		if (product.images && product.images.length > 0) {
			imagesToDelete.push(...product.images);
		}

		// Delete images from Cloudinary using enhanced utility
		if (imagesToDelete.length > 0) {
			try {
				await deleteMultipleFromCloudinary(imagesToDelete);
				logger.info("Successfully deleted all product images from Cloudinary");
			} catch (error) {
				logger.error("Error deleting images from cloudinary:", error);
			}
		}

		await productModel.findByIdAndDelete(req.params.id);

		res.json({ 
			success: true,
			message: "Product deleted successfully" 
		});
	} catch (error) {
		errorHandler(error, req, res, next);
	}
};

//==================================Get Recommended Products======================================

export const getRecommendedProducts = async (req, res, next) => {
	try {
		const products = await productModel.aggregate([
			{
				$sample: { size: 4 },
			},
			{
				$project: {
					_id: 1,
					name: 1,
					description: 1,
					image: 1,
					price: 1,
				},
			},
		]);

		res.json({
			success: true,
			message: "Recommended products retrieved successfully",
			data: products
		});
	} catch (error) {
		errorHandler(error, req, res, next);
	}
};

//==================================Get Single Product======================================

export const getProduct = async (req, res, next) => {
	try {
		const { id } = req.params;
		const product = await productModel.findById(id).lean();
		
		if (!product) {
			return res.status(404).json({ 
				success: false,
				message: "Product not found" 
			});
		}
		
		res.json({ 
			success: true,
			message: "Product retrieved successfully",
			data: product 
		});
	} catch (error) {
		errorHandler(error, req, res, next);
	}
};

//==================================Get Products By Category======================================

export const getProductsByCategory = async (req, res, next) => {
	try {
		const { category } = req.params;
		const products = await productModel.find({ 
			category: { $regex: new RegExp(`^${category}$`, 'i') }
		});
		
		res.json({ 
			success: true,
			message: `Products in ${category} category retrieved successfully`,
			data: products 
		});
	} catch (error) {
		errorHandler(error, req, res, next);
	}
};

//==================================Toggle Featured Product======================================

export const toggleFeaturedProduct = async (req, res, next) => {
	try {
		const product = await productModel.findById(req.params.id);
		
		if (!product) {
			return res.status(404).json({ 
				success: false,
				message: "Product not found" 
			});
		}

		product.isFeatured = !product.isFeatured;
		const updatedProduct = await product.save();
		await updateFeaturedProductsCache();
		
		res.json({
			success: true,
			message: `Product ${product.isFeatured ? 'featured' : 'unfeatured'} successfully`,
			data: updatedProduct
		});
	} catch (error) {
		errorHandler(error, req, res, next);
	}
};

//==================================Helper Functions======================================

async function updateFeaturedProductsCache() {
	try {
		const featuredProducts = await productModel.find({ isFeatured: true }).lean();
		if (redis) {
			await redis.set("featured_products", JSON.stringify(featuredProducts));
		}
	} catch (error) {
			logger.error("error in update cache function", error);
	}
}

//==================================Update Product (Admin)======================================

export const updateProduct = async (req, res, next) => {
	try {
		const { id } = req.params;
		const updateData = req.body;

		// Handle category conversion from name to categoryId
		if (updateData.category && typeof updateData.category === 'string') {
			const categoryDoc = await categoryModel.findOne({ name: updateData.category });
			if (!categoryDoc) {
				return res.status(404).json({
					success: false,
					message: `Category '${updateData.category}' not found`
				});
			}
			updateData.categoryId = categoryDoc._id;
		}

		// Handle multiple images from uploadToCloudinary middleware
		if (req.uploadedFiles && req.uploadedFiles.length > 0) {
			const newImages = req.uploadedFiles.map(file => file.url);
			updateData.images = newImages;
			updateData.image = newImages[0]; // Set first image as main image
			
			// Delete old images from Cloudinary
			const existingProduct = await productModel.findById(id);
			if (existingProduct && existingProduct.images && existingProduct.images.length > 0) {
				for (const oldImage of existingProduct.images) {
					try {
						await deleteFromCloudinary(oldImage);
					} catch (error) {
						logger.error("Error deleting old image:", error);
					}
				}
			}
		} else if (req.uploadedFile) {
			updateData.image = req.uploadedFile.url;
			updateData.images = [req.uploadedFile.url];
		}

		const product = await productModel.findByIdAndUpdate(
			id,
			updateData,
			{ new: true }
		);

		if (!product) {
			return res.status(404).json({
				success: false,
				message: "Product not found"
			});
		}

		res.json({
			success: true,
			message: "Product updated successfully",
			data: product
		});
	} catch (error) {
		errorHandler(error, req, res, next);
	}
};

//==================================Update Product Stock (Admin)======================================

export const updateProductStock = async (req, res, next) => {
	try {
		const { id } = req.params;
		const { stockQuantity } = req.body;

		if (stockQuantity < 0) {
			return res.status(400).json({
				success: false,
				message: "Stock quantity cannot be negative"
			});
		}

		const product = await productModel.findByIdAndUpdate(
			id,
			{ stockQuantity },
			{ new: true }
		);

		if (!product) {
			return res.status(404).json({
				success: false,
				message: "Product not found"
			});
		}

		res.json({
			success: true,
			message: "Product stock updated successfully",
			data: product
		});
	} catch (error) {
		errorHandler(error, req, res, next);
	}
};

//==================================Update Product Price (Admin)======================================

export const updateProductPrice = async (req, res, next) => {
	try {
		const { id } = req.params;
		const { price } = req.body;

		if (price < 0) {
			return res.status(400).json({
				success: false,
				message: "Price cannot be negative"
			});
		}

		const product = await productModel.findByIdAndUpdate(
			id,
			{ price },
			{ new: true }
		);

		if (!product) {
			return res.status(404).json({
				success: false,
				message: "Product not found"
			});
		}

		res.json({
			success: true,
			message: "Product price updated successfully",
			data: product
		});
	} catch (error) {
		errorHandler(error, req, res, next);
	}
};