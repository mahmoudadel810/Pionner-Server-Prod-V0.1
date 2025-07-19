import { Router } from "express";
import * as cartController from "./cartController.js";
import { 
   addToCartValidator, 
   updateQuantityValidator,
   productIdValidator 
} from "./cartValidations.js";
import { validation } from "../../middlewares/validation.js";
import { protect } from "../../middlewares/auth.js";

const router = Router();

// All cart routes are protected
router.use(protect);

// Get cart products
router.get('/getCartProducts', 
   cartController.getCartProducts
);

// Add to cart
router.post('/addToCart', 
   validation({ body: addToCartValidator }), 
   cartController.addToCart
); 

// Remove from cart
router.post('/removeFromCart', 
   validation({ body: addToCartValidator }), 
   cartController.removeAllFromCart
);

// Update quantity
router.put('/updateQuantity/:id', 
   validation({ params: productIdValidator, body: updateQuantityValidator }), 
   cartController.updateQuantity
);

export default router; 