import { Router } from "express";
import * as couponController from "./couponController.js";
import { validateCouponValidator } from "./couponValidations.js";
import { validation } from "../../middlewares/validation.js";
import { protect } from "../../middlewares/auth.js";

const router = Router();

// All coupon routes are protected
router.use(protect);

// Get user's coupon
router.get('/getCoupon', 
   couponController.getCoupon
);

// Validate coupon
router.post('/validateCoupon', 
   validation({ body: validateCouponValidator }), 
   couponController.validateCoupon
);

export default router; 