import { Router } from "express";
import * as wishlistController from "./wishlistController.js";
import { 
   addToWishlistValidator,
   productIdValidator 
} from "./wishlistValidations.js";
import { validation } from "../../middlewares/validation.js";
import { protect } from "../../middlewares/auth.js";

const router = Router();

router.use(protect);

router.get("/", wishlistController.getUserWishlist);

router.post("/add", 
   validation({ body: addToWishlistValidator }), 
   wishlistController.addToWishlist
);

router.delete("/remove/:productId", 
   validation({ params: productIdValidator }), 
   wishlistController.removeFromWishlist
);

router.delete("/clear", wishlistController.clearWishlist);

router.get("/check/:productId", 
   validation({ params: productIdValidator }), 
   wishlistController.checkWishlistStatus
);

router.get("/count", wishlistController.getWishlistCount);

export default router; 