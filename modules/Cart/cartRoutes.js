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

router.use(protect);

router.get('/getCartProducts', 
   cartController.getCartProducts
);

router.post('/addToCart', 
   validation({ body: addToCartValidator }), 
   cartController.addToCart
); 

router.post('/removeFromCart', 
   validation({ body: addToCartValidator }), 
   cartController.removeAllFromCart
);

router.put('/updateQuantity/:id', 
   validation({ params: productIdValidator, body: updateQuantityValidator }), 
   cartController.updateQuantity
);

export default router; 