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
import { uploaders, handleMulterError, uploadToCloudinary } from "../../utils/multer.js";

const router = Router();

router.get('/getProducts', 
   validation({ query: productQueryValidator }), 
   productController.getAllProducts
);

router.get('/searchSuggestions', 
   productController.getSearchSuggestions
);

router.get('/getFeaturedProducts', 
   productController.getFeaturedProducts
);

router.get('/getRecommendedProducts', 
   productController.getRecommendedProducts
);

router.get('/getProduct/:id', 
   validation({ params: productIdValidator }), 
   productController.getProduct
);

router.get('/getProductsByCategory/:category', 
   validation({ params: categoryValidator }), 
   productController.getProductsByCategory
);

router.post('/createProduct', 
   protect,
   adminRoute,
   uploaders.productImages.array('images', 10),
   handleMulterError,
   uploadToCloudinary('products'),
   validation({ body: createProductValidator }), 
   productController.createProduct
);

router.post('/createProductWithImages', 
   protect,
   adminRoute,
   uploaders.productImages.array('images', 10),
   handleMulterError,
   uploadToCloudinary('products'),
   validation({ body: createProductValidator }), 
   productController.createProductWithImages
);

router.post('/uploadProductImage/:id', 
   protect,
   adminRoute,
   validation({ params: productIdValidator }),
   uploaders.productImage.single('image'),
   handleMulterError,
   uploadToCloudinary('products'),
   productController.uploadProductImage
);

router.post('/uploadProductImages/:id', 
   protect,
   adminRoute,
   validation({ params: productIdValidator }),
   uploaders.productImages.array('images', 10),
   handleMulterError,
   uploadToCloudinary('products'),
   productController.uploadProductImages
);

router.delete('/deleteProduct/:id', 
   protect,
   adminRoute,
   validation({ params: productIdValidator }), 
   productController.deleteProduct
);

router.patch('/toggleFeaturedProduct/:id', 
   protect,
   adminRoute,
   validation({ params: productIdValidator }), 
   productController.toggleFeaturedProduct
);

router.put('/updateProduct/:id', 
   protect,
   adminRoute,
   validation({ params: productIdValidator }),
   uploaders.productImages.array('images', 10),
   handleMulterError,
   uploadToCloudinary('products'),
   productController.updateProduct
);

router.patch('/updateStock/:id', 
   protect,
   adminRoute,
   validation({ params: productIdValidator }), 
   productController.updateProductStock
);

router.patch('/updatePrice/:id', 
   protect,
   adminRoute,
   validation({ params: productIdValidator }), 
   productController.updateProductPrice
);

export default router; 