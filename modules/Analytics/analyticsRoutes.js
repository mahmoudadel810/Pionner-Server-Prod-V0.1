import { Router } from "express";
import * as analyticsController from "./analyticsController.js";
import { dateRangeValidator } from "./analyticsValidations.js";
import { validation } from "../../middlewares/validation.js";
import { protect, adminRoute } from "../../middlewares/auth.js";

const router = Router();

// All analytics routes are protected and admin only
router.use(protect);
router.use(adminRoute);

// Get analytics data
router.get('/getAnalyticsData', 
   analyticsController.getAnalyticsData
);

// Get daily sales data
router.get('/getDailySalesData', 
   validation({ query: dateRangeValidator }), 
   analyticsController.getDailySalesData
);



export default router; 