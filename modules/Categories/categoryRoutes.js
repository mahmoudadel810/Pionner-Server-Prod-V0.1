import express from "express";
import { protect, adminRoute } from "../../middlewares/auth.js";
import { validation } from "../../middlewares/validation.js";
import { uploadSingleFile } from "../../utils/multer.js";
import * as categoryController from "./categoryController.js";

const router = express.Router();

//==================================Public Routes======================================

// Get all categories (with pagination, search, filtering)
router.get("/", categoryController.getAllCategories);

// Get featured categories
router.get("/featured", categoryController.getFeaturedCategories);

// Get category by ID
router.get("/:id", categoryController.getCategoryById);

// Get category by slug
router.get("/slug/:slug", categoryController.getCategoryBySlug);

// Get products by category ID
router.get("/:id/products", categoryController.getProductsByCategory);

// Get products by category slug
router.get("/slug/:slug/products", categoryController.getProductsByCategorySlug);

//==================================Admin Routes (Protected)======================================

// Create category (Admin only)
router.post(
	"/",
	protect,
	adminRoute,
	uploadSingleFile("image", "categories"),
	validation({
		name: { type: "string", min: 2, max: 50, required: true },
		// slug: { type: "string", required: false },
		description: { type: "string", min: 10, max: 500, required: true },
		featured: { type: "boolean", required: false },
		order: { type: "number", min: 0, required: false }
	}),
	categoryController.createCategory
);

// Update category (Admin only)
router.put(
	"/:id",
	protect,
	adminRoute,
	uploadSingleFile("image", "categories"),
	validation({
		name: { type: "string", min: 2, max: 50, required: false },
		description: { type: "string", min: 10, max: 500, required: false },
		featured: { type: "boolean", required: false },
		order: { type: "number", min: 0, required: false }
	}),
	categoryController.updateCategory
);

// Delete category (Admin only)
router.delete("/:id", protect, adminRoute, categoryController.deleteCategory);

// Toggle category status (Admin only)
router.patch("/:id/toggle-status", protect, adminRoute, categoryController.toggleCategoryStatus);

export default router;
