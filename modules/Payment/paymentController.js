import couponModel from "../../DB/models/couponModel.js";
import orderModel from "../../DB/models/orderModel.js";
import productModel from "../../DB/models/productModel.js";
import { stripe } from "../../utils/stripe.js";
import { errorHandler } from "../../utils/errorHandler.js";
import { createOrderSafely, waitForOrder } from "../../utils/paymentHelpers.js";
import logger from "../../utils/logger.js";

//==================================Create Checkout Session======================================

export const createCheckoutSession = async (req, res, next) => {
	try {
		const { products, couponCode } = req.body;

		if (!Array.isArray(products) || products.length === 0) {
			return res.status(400).json({ 
				success: false,
				message: "Invalid or empty products array" 
			});
		}

		let totalAmount = 0;

		const lineItems = products.map((product) => {
			const amount = Math.round(product.price * 100); // stripe wants u to send in the format of cents
			totalAmount += amount * product.quantity;

			return {
				price_data: {
					currency: "usd", // Using USD for consistency with our tests
					product_data: {
						name: product.name,
						images: [product.image],
					},
					unit_amount: amount,
				},
				quantity: product.quantity || 1,
			};
		});

		let coupon = null;
		if (couponCode) {
			coupon = await couponModel.findOne({ code: couponCode, userId: req.user._id, isActive: true });
			if (coupon) {
				totalAmount -= Math.round((totalAmount * coupon.discountPercentage) / 100);
			}
		}

		const session = await stripe.checkout.sessions.create({
			payment_method_types: ["card"],
			line_items: lineItems,
			mode: "payment",
			success_url: `${process.env.CLIENT_URL}purchase-success?session_id={CHECKOUT_SESSION_ID}`,
			cancel_url: `${process.env.CLIENT_URL}purchase-cancel`,
			discounts: coupon
				? [
						{
							coupon: await createStripeCoupon(coupon.discountPercentage),
						},
				  ]
				: [],
			metadata: {
				userId: req.user._id.toString(),
				couponCode: couponCode || "",
				products: JSON.stringify(
					products.map((p) => ({
						id: p._id,
						quantity: p.quantity,
						price: p.price,
					}))
				),
			},
		});

		if (totalAmount >= 20000) {
			await createNewCoupon(req.user._id);
		}
		
		res.status(200).json({ 
			success: true,
			message: "Checkout session created successfully",
			data: {
				id: session.id, 
				url: session.url,
				totalAmount: totalAmount / 100 
			}
		});
	} catch (error) {
		errorHandler(error, req, res, next);
	}
};

//==================================Checkout Success======================================

export const checkoutSuccess = async (req, res, next) => {
	try {
		const { sessionId } = req.body;
		const session = await stripe.checkout.sessions.retrieve(sessionId);

		if (session.payment_status === "paid") {
			// Get user ID from session metadata
			const userId = session.metadata.userId;
			
			if (!userId) {
				return res.status(400).json({
					success: false,
					message: "Invalid session: user ID not found"
				});
			}

			// Check if order already exists for this session
			const existingOrder = await orderModel.findOne({ stripeSessionId: sessionId });
			if (existingOrder) {
				return res.status(200).json({
					success: true,
					message: "Payment successful and order processed.",
					data: {
						orderId: existingOrder._id,
						order: existingOrder
					}
				});
			}

			// Wait for webhook to process (up to 5 seconds)
			const order = await waitForOrder(sessionId, 5000);
			
			if (order) {
				return res.status(200).json({
					success: true,
					message: "Payment successful and order processed.",
					data: {
						orderId: order._id,
						order: order
					}
				});
			}

			// If webhook hasn't processed yet, create order as fallback
			logger.warn('Webhook may have failed, creating order as fallback for session:', sessionId);
			
			try {
				const result = await createOrderSafely(session, { addressType: 'fallback' });
				
				return res.status(200).json({
					success: true,
					message: result.created ? "Payment successful and order created." : "Payment successful and order processed.",
					data: {
						orderId: result.order._id,
						order: result.order
					}
				});
			} catch (fallbackError) {
				logger.error('Fallback order creation failed:', fallbackError);
				return res.status(500).json({
					success: false,
					message: "Payment successful but order creation failed. Please contact support.",
					data: {
						sessionId: sessionId,
						error: fallbackError.message
					}
				});
			}
		} else {
			res.status(400).json({
				success: false,
				message: "Payment not completed"
			});
		}
	} catch (error) {
		errorHandler(error, req, res, next);
	}
};

//==================================Stripe Webhook Handler======================================

export const handleStripeWebhook = async (req, res, next) => {
	try {
		const sig = req.headers['stripe-signature'];
		const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

		let event;

		try {
			event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
		} catch (err) {
			logger.error('Webhook signature verification failed:', err.message);
			return res.status(400).send(`Webhook Error: ${err.message}`);
		}

		// Handle the event
		switch (event.type) {
			case 'checkout.session.completed':
				const session = event.data.object;
				await handleCheckoutSessionCompleted(session);
				break;
			case 'payment_intent.succeeded':
				const paymentIntent = event.data.object;
				logger.info('Payment succeeded:', paymentIntent.id);
				break;
			case 'payment_intent.payment_failed':
				const failedPayment = event.data.object;
				logger.warn('Payment failed:', failedPayment.id);
				break;
			default:
				logger.info(`Unhandled event type: ${event.type}`);
		}

		res.json({ received: true });
	} catch (error) {
		errorHandler(error, req, res, next);
	}
};

//==================================Get Payment Status======================================

export const getPaymentStatus = async (req, res, next) => {
	try {
		const { sessionId } = req.params;
		
		const session = await stripe.checkout.sessions.retrieve(sessionId);
		
		res.status(200).json({
			success: true,
			message: "Payment status retrieved successfully",
			data: {
				sessionId: session.id,
				paymentStatus: session.payment_status,
				status: session.status,
				amountTotal: session.amount_total ? session.amount_total / 100 : 0,
				currency: session.currency,
				created: session.created,
				expiresAt: session.expires_at
			}
		});
	} catch (error) {
		errorHandler(error, req, res, next);
	}
};

async function handleCheckoutSessionCompleted(session) {
	try {
		if (session.payment_status === 'paid') {
			const result = await createOrderSafely(session, { addressType: 'webhook' });
			
			if (result.created) {
				logger.info('Order created from webhook:', result.order._id);
			} else {
				logger.info('Order already exists for session:', session.id);
			}
		}
	} catch (error) {
		logger.error('Error handling checkout session completed:', error);
		// Log more details for debugging
		if (error.code === 11000) {
			logger.error('Duplicate key error - order already exists for session:', session.id);
		}
	}
}

//==================================Helper Functions======================================

async function createStripeCoupon(discountPercentage) {
	const coupon = await stripe.coupons.create({
		percent_off: discountPercentage,
		duration: "once",
	});

	return coupon.id;
}

async function createNewCoupon(userId) {
	await couponModel.findOneAndDelete({ userId });

	const newCoupon = new couponModel({
		code: "GIFT" + Math.random().toString(36).substring(2, 8).toUpperCase(),
		discountPercentage: 10,
		expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
		userId: userId,
	});

	await newCoupon.save();

	return newCoupon;
} 

//==================================Create Payment Intent======================================

export const createPaymentIntent = async (req, res, next) => {
	try {
		const { products, couponCode } = req.body;

		if (!Array.isArray(products) || products.length === 0) {
			return res.status(400).json({ 
				success: false,
				message: "Invalid or empty products array" 
			});
		}

		let totalAmount = 0;

		// Calculate total amount
		products.forEach((product) => {
			const amount = Math.round(product.price * 100); // stripe wants in cents
			totalAmount += amount * product.quantity;
		});

		// Apply coupon if provided
		let coupon = null;
		if (couponCode) {
			coupon = await couponModel.findOne({ code: couponCode, userId: req.user._id, isActive: true });
			if (coupon) {
				totalAmount -= Math.round((totalAmount * coupon.discountPercentage) / 100);
			}
		}

		// Create payment intent
		const paymentIntent = await stripe.paymentIntents.create({
			amount: totalAmount,
			currency: "usd",
			automatic_payment_methods: {
				enabled: true,
			},
			metadata: {
				userId: req.user._id.toString(),
				couponCode: couponCode || "",
				products: JSON.stringify(
					products.map((p) => ({
						id: p._id,
						quantity: p.quantity,
						price: p.price,
					}))
				),
			},
		});

		// Create coupon for future use if order is large enough
		if (totalAmount >= 20000) {
			await createNewCoupon(req.user._id);
		}
		
		res.status(200).json({ 
			success: true,
			message: "Payment intent created successfully",
			data: {
				clientSecret: paymentIntent.client_secret,
				totalAmount: totalAmount / 100 
			}
		});
	} catch (error) {
		errorHandler(error, req, res, next);
	}
};

