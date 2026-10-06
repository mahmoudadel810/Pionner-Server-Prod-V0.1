import categoryModel from "../../DB/models/categoryModel.js";
import productModel from "../../DB/models/productModel.js";
import { redis } from "../../utils/redis.js";
import { errorHandler } from "../../utils/errorHandler.js";
import { paginationHelper, buildSearchQuery, buildPaginationResponse } from "../../utils/pagination.js";
import { deleteFromCloudinary } from "../../utils/multer.js";

//==================================Create Category======================================

export const createCategory = async (req, res, next) => {
	try {
		const { name, description, featured = false, order = 0 } = req.body;

		let imageUrl = "";
		if (req.uploadedFile) {
			imageUrl = req.uploadedFile.url; // Cloudinary URL from uploadToCloudinary middleware
		}

		const category = await categoryModel.create({
			name,
			description,
			image: imageUrl,
			featured,
			order
			
		});

		if (redis) {
			await redis.del("categories");
			await redis.del("featured_categories");
		}

		res.status(201).json({
			success: true,
			message: "Category created successfully",
			data: category
		});
	} catch (error) {
		errorHandler(error, req, res, next);
	}
};

//==================================Get All Categories======================================

export const getAllCategories = async (req, res, next) => {
	try {
		const { page = 1, limit = 10, search = "", featured = "", sortBy = "order", sortOrder = "asc" } = req.query;

		if (redis && !search && !featured) {
			const cachedCategories = await redis.get("categories");
			if (cachedCategories) {
				return res.json({
					success: true,
					message: "Categories retrieved from cache",
					data: JSON.parse(cachedCategories)
				});
			}
		}

		const searchQuery = buildSearchQuery({
			search,
			searchFields: ["name", "description"]
		});

		if (featured === "true") {
			searchQuery.featured = true;
		}

		searchQuery.isActive = true;

		const totalCount = await categoryModel.countDocuments(searchQuery);

		const pagination = paginationHelper({
			page,
			limit,
			totalCount,
			search
		});

		const sortObject = {};
		sortObject[sortBy] = sortOrder === 'desc' ? -1 : 1;

		const categories = await categoryModel.getCategoriesWithProductCount();

		let filteredCategories = categories.filter(cat => {
			if (search) {
				const searchLower = search.toLowerCase();
				return cat.name.toLowerCase().includes(searchLower) || 
					   cat.description.toLowerCase().includes(searchLower);
			}
			return true;
		});

		if (featured === "true") {
			filteredCategories = filteredCategories.filter(cat => cat.featured);
		}

		const startIndex = pagination.skip;
		const endIndex = startIndex + pagination.limit;
		const paginatedCategories = filteredCategories.slice(startIndex, endIndex);

		const response = buildPaginationResponse({
			data: paginatedCategories,
			pagination: {
				...pagination,
				totalCount: filteredCategories.length
			},
			message: `${filteredCategories.length} categories found`
		});

		if (redis && !search && !featured) {
			await redis.set("categories", JSON.stringify(response), 'EX', 3600); // Cache for 1 hour
		}

		res.json(response);
	} catch (error) {
		errorHandler(error, req, res, next);
	}
};

//==================================Get Featured Categories======================================

export const getFeaturedCategories = async (req, res, next) => {
	try {
		if (redis) {
			const cachedCategories = await redis.get("featured_categories");
			if (cachedCategories) {
				return res.json({
					success: true,
					message: "Featured categories retrieved from cache",
					data: JSON.parse(cachedCategories)
				});
			}
		}

		const categories = await categoryModel.find({ 
			featured: true, 
			isActive: true 
		}).sort({ order: 1, name: 1 }).lean();

		if (!categories.length) {
			return res.json({
				success: true,
				message: "No featured categories found",
				data: []
			});
		}

		if (redis) {
			await redis.set("featured_categories", JSON.stringify(categories), 'EX', 3600); // Cache for 1 hour
		}

		res.json({
			success: true,
			message: "Featured categories retrieved successfully",
			data: categories
		});
	} catch (error) {
		errorHandler(error, req, res, next);
	}
};

//==================================Get Category By ID======================================

export const getCategoryById = async (req, res, next) => {
	try {
		const { id } = req.params;

		const category = await categoryModel.findById(id).lean();

		if (!category) {
			return res.status(404).json({ 
				success: false,
				message: "Category not found" 
			});
		}

		if (!category.isActive) {
			return res.status(404).json({ 
				success: false,
				message: "Category is not active" 
			});
		}

		res.json({
			success: true,
			message: "Category retrieved successfully",
			data: category
		});
	} catch (error) {
		errorHandler(error, req, res, next);
	}
};

//==================================Update Category======================================

export const updateCategory = async (req, res, next) => {
	try {
		const { id } = req.params;
		const { name, description, featured, order } = req.body;

		const category = await categoryModel.findById(id);

		if (!category) {
			return res.status(404).json({ 
				success: false,
				message: "Category not found" 
			});
		}

		if (req.uploadedFile) {
			if (category.image) {
				try {
					await deleteFromCloudinary(category.image);
				} catch (error) {
					logger.error("Error deleting old image:", error);
				}
			}
			category.image = req.uploadedFile.url;
		}

		if (name) category.name = name;
		if (description) category.description = description;
		if (featured !== undefined) category.featured = featured;
		if (order !== undefined) category.order = order;

		await category.save();

		if (redis) {
			await redis.del("categories");
			await redis.del("featured_categories");
		}

		res.json({
			success: true,
			message: "Category updated successfully",
			data: category
		});
	} catch (error) {
		errorHandler(error, req, res, next);
	}
};

//==================================Delete Category======================================

export const deleteCategory = async (req, res, next) => {
	try {
		const { id } = req.params;

		const category = await categoryModel.findById(id);

		if (!category) {
			return res.status(404).json({ 
				success: false,
				message: "Category not found" 
			});
		}

		const productCount = await productModel.countDocuments({ categoryId: id });
		if (productCount > 0) {
			return res.status(400).json({ 
				success: false,
				message: `Cannot delete category. It has ${productCount} associated products. Please reassign or delete the products first.` 
			});
		}

		if (category.image) {
			try {
				await deleteFromCloudinary(category.image);
			} catch (error) {
			logger.error("Error deleting image:", error);
			}
		}

		await categoryModel.findByIdAndDelete(id);

		if (redis) {
			await redis.del("categories");
			await redis.del("featured_categories");
		}

		res.json({
			success: true,
			message: "Category deleted successfully"
		});
	} catch (error) {
		errorHandler(error, req, res, next);
	}
};

//==================================Toggle Category Status======================================

export const toggleCategoryStatus = async (req, res, next) => {
	try {
		const { id } = req.params;

		const category = await categoryModel.findById(id);

		if (!category) {
			return res.status(404).json({ 
				success: false,
				message: "Category not found" 
			});
		}

		category.isActive = !category.isActive;
		await category.save();

		if (redis) {
			await redis.del("categories");
			await redis.del("featured_categories");
		}

		res.json({
			success: true,
			message: `Category ${category.isActive ? 'activated' : 'deactivated'} successfully`,
			data: category
		});
	} catch (error) {
		errorHandler(error, req, res, next);
	}
};

//==================================Get Products By Category======================================

export const getProductsByCategory = async (req, res, next) => {
	try {
		const { id } = req.params;
		const { page = 1, limit = 10, sortBy = "createdAt", sortOrder = "desc" } = req.query;

		const category = await categoryModel.findOne({ 
			_id: id, 
			isActive: true 
		}).lean();

		if (!category) {
			return res.status(404).json({ 
				success: false,
				message: "Category not found or inactive" 
			});
		}

		const searchQuery = { categoryId: id };

		const totalCount = await productModel.countDocuments(searchQuery);

		const pagination = paginationHelper({
			page,
			limit,
			totalCount
		});

		const sortObject = {};
		sortObject[sortBy] = sortOrder === 'desc' ? -1 : 1;

		const products = await productModel.find(searchQuery)
			.sort(sortObject)
			.skip(pagination.skip)
			.limit(pagination.limit)
			.populate('categoryId', 'name')
			.lean();

		const response = buildPaginationResponse({
			data: products,
			pagination,
			message: `${totalCount} products found in ${category.name} category`
		});

		response.category = category;

		res.json(response);
	} catch (error) {
		errorHandler(error, req, res, next);
	}
};
