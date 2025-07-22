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

// Create checkout session (protected)
router.post('/createCheckoutSession', 
   protect,
   validation({ body: createCheckoutSessionValidator }), 
   paymentController.createCheckoutSession
);

// Create payment intent (protected)
router.post('/createPaymentIntent', 
   protect,
   validation({ body: createCheckoutSessionValidator }), 
   paymentController.createPaymentIntent
);

// Payment intent success (protected)
router.post('/paymentIntentSuccess', 
   protect, 
   paymentController.paymentIntentSuccess
);

// Checkout success (public - no auth required)
router.post('/checkoutSuccess', 
   validation({ body: checkoutSuccessValidator }), 
   paymentController.checkoutSuccess
);

// Stripe webhook (no validation needed, Stripe handles it)
router.post('/webhook', 
   express.raw({ type: 'application/json' }), // Raw body for webhook signature verification
   paymentController.handleStripeWebhook
);

// Get payment status (public route for checking payment status)
router.get('/status/:sessionId', 
   paymentController.getPaymentStatus
);

export default router; 