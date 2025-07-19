import { Router } from "express";
import * as wishlistController from "./wishlistController.js";
import { 
   addToWishlistValidator,
   productIdValidator 
} from "./wishlistValidations.js";
import { validation } from "../../middlewares/validation.js";
import { protect } from "../../middlewares/auth.js";

const router = Router();

// All wishlist routes are protected
router.use(protect);

// Get user's wishlist
router.get("/", wishlistController.getUserWishlist);

// Add product to wishlist
router.post("/add", 
   validation({ body: addToWishlistValidator }), 
   wishlistController.addToWishlist
);

// Remove product from wishlist
router.delete("/remove/:productId", 
   validation({ params: productIdValidator }), 
   wishlistController.removeFromWishlist
);

// Clear wishlist
router.delete("/clear", wishlistController.clearWishlist);

// Check if product is in wishlist
router.get("/check/:productId", 
   validation({ params: productIdValidator }), 
   wishlistController.checkWishlistStatus
);

// Get wishlist count
router.get("/count", wishlistController.getWishlistCount);

export default router; 