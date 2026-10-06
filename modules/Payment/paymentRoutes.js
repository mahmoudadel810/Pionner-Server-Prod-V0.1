import { Router } from "express";
import express from "express";
import * as paymentController from "./paymentController.js";
import { 
   createCheckoutSessionValidator,
   checkoutSuccessValidator 
} from "./paymentValidations.js";
import { validation } from "../../middlewares/validation.js";
import { protect } from "../../middlewares/auth.js";

const router = Router();

router.post('/createCheckoutSession', 
   protect,
   validation({ body: createCheckoutSessionValidator }), 
   paymentController.createCheckoutSession
);

router.post('/createPaymentIntent', 
   protect,
   validation({ body: createCheckoutSessionValidator }), 
   paymentController.createPaymentIntent
);

router.post('/paymentIntentSuccess', 
   protect, 
   paymentController.paymentIntentSuccess
);

router.post('/checkoutSuccess', 
   validation({ body: checkoutSuccessValidator }), 
   paymentController.checkoutSuccess
);

router.post('/webhook', 
   express.raw({ type: 'application/json' }), // Raw body for webhook signature verification
   paymentController.handleStripeWebhook
);

router.get('/status/:sessionId', 
   paymentController.getPaymentStatus
);

export default router; 