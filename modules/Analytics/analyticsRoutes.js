import { Router } from "express";
import * as analyticsController from "./analyticsController.js";
import { dateRangeValidator } from "./analyticsValidations.js";
import { validation } from "../../middlewares/validation.js";
import { protect, adminRoute } from "../../middlewares/auth.js";

const router = Router();

router.use(protect);
router.use(adminRoute);

router.get('/getAnalyticsData', 
   analyticsController.getAnalyticsData
);

router.get('/getDailySalesData', 
   validation({ query: dateRangeValidator }), 
   analyticsController.getDailySalesData
);

export default router; 