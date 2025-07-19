import express from "express";
import {
	createCategory,
	getAllCategories,
	getFeaturedCategories,
	getCategoryById,
	getCategoryBySlug,
	updateCategory,
	deleteCategory,
	toggleCategoryStatus,
	getProductsByCategory,
	getProductsByCategorySlug
} from "./categoryController.js";
import { protect, authorize } from "../../middlewares/auth.js";
import { validation } from "../../middlewares/validation.js";
import { uploaders, handleMulterError } from "../../utils/multer.js";

const router = express.Router();

//==================================Public Routes======================================

// Get all categories (with pagination, search, filtering)
router.get("/", getAllCategories);

// Get featured categories
router.get("/featured", getFeaturedCategories);

// Get category by ID
router.get("/:id", getCategoryById);

// Get category by slug
router.get("/slug/:slug", getCategoryBySlug);

// Get products by category ID
router.get("/:id/products", getProductsByCategory);

// Get products by category slug
router.get("/slug/:slug/products", getProductsByCategorySlug);

//==================================Admin Routes (Protected)======================================

// Create category (Admin only)
router.post(
	"/",
	protect,
	authorize("admin"),
	uploaders.categoryImage.single("image"),
	handleMulterError,
	validation({
		name: { type: "string", min: 2, max: 50, required: true },
		description: { type: "string", min: 10, max: 500, required: true },
		featured: { type: "boolean", required: false },
		order: { type: "number", min: 0, required: false }
	}),
	createCategory
);

// Update category (Admin only)
router.put(
	"/:id",
	protect,
	authorize("admin"),
	uploaders.categoryImage.single("image"),
	handleMulterError,
	validation({
		name: { type: "string", min: 2, max: 50, required: false },
		description: { type: "string", min: 10, max: 500, required: false },
		featured: { type: "boolean", required: false },
		order: { type: "number", min: 0, required: false }
	}),
	updateCategory
);

// Delete category (Admin only)
router.delete("/:id", protect, authorize("admin"), deleteCategory);

// Toggle category status (Admin only)
router.patch("/:id/toggle-status", protect, authorize("admin"), toggleCategoryStatus);

export default router;
