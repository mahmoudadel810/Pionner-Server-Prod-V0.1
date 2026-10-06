import { Router } from "express";
import * as orderController from "./orderController.js";
import { 
   orderIdValidator,
   updateOrderStatusValidator,
   orderQueryValidator,
   createOrderValidator,
   updatePaymentStatusValidator
} from "./orderValidations.js";
import { validation } from "../../middlewares/validation.js";
import { protect, adminRoute } from "../../middlewares/auth.js";

const router = Router();

router.use(protect);

router.post('/create', 
   validation({ body: createOrderValidator }), 
   orderController.createOrder
);

router.get('/getUserOrders', 
   orderController.getUserOrders
);

router.get('/getOrder/:id', 
   validation({ params: orderIdValidator }), 
   orderController.getOrderById
);

// Admin routes
router.get('/getAllOrders', 
   adminRoute,
   validation({ query: orderQueryValidator }), 
   orderController.getAllOrders
);

router.put('/updateOrderStatus/:id', 
   adminRoute,
   validation({ params: orderIdValidator, body: updateOrderStatusValidator }), 
   orderController.updateOrderStatus
);

router.put('/updatePaymentStatus/:id', 
   adminRoute,
   validation({ params: orderIdValidator, body: updatePaymentStatusValidator }), 
   orderController.updatePaymentStatus
);

// Analytics routes (Admin only)
router.get('/analytics', 
   adminRoute,
   orderController.getOrdersAnalytics
);

router.get('/productAnalytics', 
   adminRoute,
   orderController.getProductAnalytics
);

router.get('/byCategory/:categoryId', 
   adminRoute,
   validation({ params: orderIdValidator }), 
   orderController.getOrdersByCategory
);

router.delete('/deleteOrder/:id', 
   adminRoute,
   validation({ params: orderIdValidator }), 
   orderController.deleteOrder
);

router.patch('/cancel/:id', 
  validation({ params: orderIdValidator }), 
  orderController.cancelOrder
);

export default router; 