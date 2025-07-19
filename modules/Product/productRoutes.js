import { Router } from "express";
import * as productController from "./productController.js";
import { 
   createProductValidator, 
   productIdValidator,
   categoryValidator,
   productQueryValidator 
} from "./productValidations.js";
import { validation } from "../../middlewares/validation.js";
import { protect, adminRoute } from "../../middlewares/auth.js";
import { uploaders, handleMulterError } from "../../utils/multer.js";

const router = Router();

// Get all products
router.get('/getProducts', 
   validation({ query: productQueryValidator }), 
   productController.getAllProducts
);

// Search products
router.get('/search', 
   validation({ query: productQueryValidator }), 
   productController.getAllProducts
);

// Get search suggestions
router.get('/searchSuggestions', 
   productController.getSearchSuggestions
);

// Get featured products
router.get('/getFeaturedProducts', 
   productController.getFeaturedProducts
);

// Get recommended products
router.get('/getRecommendedProducts', 
   productController.getRecommendedProducts
);

// Get single product by ID
router.get('/getProduct/:id', 
   validation({ params: productIdValidator }), 
   productController.getProduct
);

// Get products by category
router.get('/getProductsByCategory/:category', 
   validation({ params: categoryValidator }), 
   productController.getProductsByCategory
);

// Create product with single image upload (Admin only)
router.post('/createProduct', 
   protect,
   adminRoute,
   uploaders.productImage.single('image'),
   handleMulterError,
   validation({ body: createProductValidator }), 
   productController.createProduct
);

// Create product with multiple images upload (Admin only)
router.post('/createProductWithImages', 
   protect,
   adminRoute,
   uploaders.productImages.array('images', 10),
   handleMulterError,
   validation({ body: createProductValidator }), 
   productController.createProductWithImages
);

// Upload product image (Admin only)
router.post('/uploadProductImage/:id', 
   protect,
   adminRoute,
   validation({ params: productIdValidator }),
   uploaders.productImage.single('image'),
   handleMulterError,
   productController.uploadProductImage
);

// Upload multiple product images (Admin only)
router.post('/uploadProductImages/:id', 
   protect,
   adminRoute,
   validation({ params: productIdValidator }),
   uploaders.productImages.array('images', 10),
   handleMulterError,
   productController.uploadProductImages
);

// Delete product (Admin only)
router.delete('/deleteProduct/:id', 
   protect,
   adminRoute,
   validation({ params: productIdValidator }), 
   productController.deleteProduct
);

// Toggle featured product (Admin only)
router.patch('/toggleFeaturedProduct/:id', 
   protect,
   adminRoute,
   validation({ params: productIdValidator }), 
   productController.toggleFeaturedProduct
);

export default router; 