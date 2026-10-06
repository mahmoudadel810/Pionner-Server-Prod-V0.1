import express from "express";
import {
	createCategory,
	getAllCategories,
	getFeaturedCategories,
	getCategoryById,
	updateCategory,
	deleteCategory,
	toggleCategoryStatus,
	getProductsByCategory
} from "./categoryController.js";
import { protect, authorize } from "../../middlewares/auth.js";
import { validation } from "../../middlewares/validation.js";
import { uploaders, handleMulterError, uploadToCloudinary } from "../../utils/multer.js";

const router = express.Router();

//==================================Public Routes======================================

router.get("/", getAllCategories);

router.get("/featured", getFeaturedCategories);

router.get("/:id", getCategoryById);

router.get("/:id/products", getProductsByCategory);

//==================================Admin Routes (Protected)======================================

router.post(
	"/",
	protect,
	authorize("admin"),
	uploaders.categoryImage.single("image"),
	handleMulterError,
	uploadToCloudinary("categories"),
	validation({
		name: { type: "string", min: 2, max: 50, required: true },
		description: { type: "string", min: 10, max: 500, required: true },
		featured: { type: "boolean", required: false },
		order: { type: "number", min: 0, required: false }
	}),
	createCategory
);

router.put(
	"/:id",
	protect,
	authorize("admin"),
	uploaders.categoryImage.single("image"),
	handleMulterError,
	uploadToCloudinary("categories"),
	validation({
		name: { type: "string", min: 2, max: 50, required: false },
		description: { type: "string", min: 10, max: 500, required: false },
		featured: { type: "boolean", required: false },
		order: { type: "number", min: 0, required: false }
	}),
	updateCategory
);

router.delete("/:id", protect, authorize("admin"), deleteCategory);

router.patch("/:id/toggle-status", protect, authorize("admin"), toggleCategoryStatus);

export default router;
