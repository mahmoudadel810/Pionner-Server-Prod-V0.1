import orderModel from '../DB/models/orderModel.js';
import productModel from '../DB/models/productModel.js';
import couponModel from '../DB/models/couponModel.js';

/**
 * Safely creates an order with duplicate protection
 * @param {Object} session - Stripe session object
 * @param {Object} options - Additional options
 * @returns {Object} - Created order or existing order
 */
export const createOrderSafely = async (session, options = {}) => {
    const { stripeSessionId, metadata } = session;
    const { userId, couponCode, products } = metadata;
    
    // First check if order already exists
    const existingOrder = await orderModel.findOne({ stripeSessionId });
    if (existingOrder) {
        console.log('Order already exists for session:', stripeSessionId);
        return { order: existingOrder, created: false };
    }
    
    try {
        // Handle coupon deactivation
        if (couponCode) {
            await couponModel.findOneAndUpdate(
                {
                    code: couponCode,
                    userId: userId,
                },
                {
                    isActive: false,
                }
            );
        }

        // Parse products and create order
        const parsedProducts = JSON.parse(products);
        const orderProducts = [];
        let totalAmount = 0;

        for (const item of parsedProducts) {
            const product = await productModel.findById(item.id).populate('categoryId');
            if (!product) {
                console.warn(`Product not found for ID: ${item.id}`);
                continue;
            }

            const itemTotal = product.price * item.quantity;
            totalAmount += itemTotal;

            // Update product analytics
            await product.updateStockAfterOrder(item.quantity);
            await product.updateRevenue(itemTotal);

            orderProducts.push({
                product: product._id,
                quantity: item.quantity,
                price: product.price,
                category: product.category,
                categoryId: product.categoryId._id,
                productName: product.name,
                productImage: product.image
            });
        }

        // Final check before creating (race condition protection)
        const finalCheck = await orderModel.findOne({ stripeSessionId });
        if (finalCheck) {
            console.log('Order was created by another process for session:', stripeSessionId);
            return { order: finalCheck, created: false };
        }

        const newOrder = new orderModel({
            user: userId,
            products: orderProducts,
            totalAmount: session.amount_total ? session.amount_total / 100 : totalAmount,
            status: 'processing',
            paymentStatus: 'paid',
            stripeSessionId: stripeSessionId,
            shippingAddress: {
                street: options.addressType === 'webhook' ? 'Webhook Address' : 
                       options.addressType === 'fallback' ? 'Fallback Address' : 'Payment Address',
                city: options.addressType === 'webhook' ? 'Webhook City' : 
                      options.addressType === 'fallback' ? 'Fallback City' : 'Payment City',
                state: options.addressType === 'webhook' ? 'WH' : 
                       options.addressType === 'fallback' ? 'FB' : 'PS',
                zipCode: '12345',
                country: 'USA'
            }
        });

        await newOrder.save();
        console.log('Order created successfully:', newOrder._id);
        
        return { order: newOrder, created: true };
    } catch (error) {
        // If it's a duplicate key error, try to find the existing order
        if (error.code === 11000) {
            console.log('Duplicate key error, trying to find existing order');
            const existingOrder = await orderModel.findOne({ stripeSessionId });
            if (existingOrder) {
                return { order: existingOrder, created: false };
            }
        }
        throw error;
    }
};

/**
 * Waits for an order to be created by webhook with timeout
 * @param {string} stripeSessionId - Stripe session ID
 * @param {number} timeoutMs - Timeout in milliseconds
 * @param {number} checkInterval - Check interval in milliseconds
 * @returns {Object|null} - Order object or null if timeout
 */
export const waitForOrder = async (stripeSessionId, timeoutMs = 5000, checkInterval = 500) => {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeoutMs) {
        const order = await orderModel.findOne({ stripeSessionId });
        if (order) {
            return order;
        }
        await new Promise(resolve => setTimeout(resolve, checkInterval));
    }
    
    return null;
}; 