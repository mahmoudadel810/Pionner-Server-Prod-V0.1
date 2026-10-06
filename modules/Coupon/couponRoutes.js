import { Router } from "express";
import * as couponController from "./couponController.js";
import {
   validateCouponValidator,
   createCouponValidator,
   updateCouponValidator,
   couponIdValidator
} from "./couponValidations.js";
import { validation } from "../../middlewares/validation.js";
import { protect, adminRoute } from "../../middlewares/auth.js";

const router = Router();

router.use(protect);

router.get('/getCoupon',
   couponController.getCoupon
);

router.post('/validateCoupon',
   validation({ body: validateCouponValidator }),
   couponController.validateCoupon
);

// Admin routes
router.get('/getAllCoupons',
   adminRoute,
   couponController.getAllCoupons
);

router.post('/createCoupon',
   adminRoute,
   validation({ body: createCouponValidator }),
   couponController.createCoupon
);

router.put('/updateCoupon/:id',
   adminRoute,
   validation({ params: couponIdValidator, body: updateCouponValidator }),
   couponController.updateCoupon
);

router.delete('/deleteCoupon/:id',
   adminRoute,
   validation({ params: couponIdValidator }),
   couponController.deleteCoupon
);

router.patch('/toggleStatus/:id',
   adminRoute,
   validation({ params: couponIdValidator }),
   couponController.toggleCouponStatus
);

export default router;
