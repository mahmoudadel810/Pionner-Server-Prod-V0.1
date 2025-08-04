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

// Admin routes for coupon management
router.get('/getAllCoupons', 
   couponController.getAllCoupons
);

router.post('/createCoupon', 
   couponController.createCoupon
);

router.put('/updateCoupon/:id', 
   couponController.updateCoupon
);

router.delete('/deleteCoupon/:id', 
   couponController.deleteCoupon
);

router.patch('/toggleStatus/:id', 
   couponController.toggleCouponStatus
);

export default router; 