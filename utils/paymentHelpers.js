import orderModel from '../DB/models/orderModel.js';
import productModel from '../DB/models/productModel.js';
import logger from './logger.js';
import sendEmail from '../service/sendEmail.js';

// Function to create order from Stripe session
export const createOrderFromSession = async (sessionId, userId) => {
    try {
        // Check if order already exists for this session
        const existingOrder = await orderModel.findOne({ stripeSessionId: sessionId });
        
    if (existingOrder) {
            logger.info('Order already exists for session:', sessionId);
            return { success: true, order: existingOrder };
        }

        // Create new order
        const newOrder = new orderModel({
            user: userId,
            stripeSessionId: sessionId,
            status: 'pending',
            items: [], // Will be populated from session
            totalAmount: 0, // Will be calculated from items
        });

        await newOrder.save();
        logger.info('Order created successfully:', newOrder._id);
        
        return { success: true, order: newOrder };
        
    } catch (error) {
        if (error.code === 11000) {
            // Duplicate key error - order was created by another process
            logger.info('Order was created by another process for session:', sessionId);
            
            // Try to find the existing order
            try {
                const existingOrder = await orderModel.findOne({ stripeSessionId: sessionId });
            if (existingOrder) {
                    return { success: true, order: existingOrder };
                }
            } catch (findError) {
                logger.error('Error finding existing order:', findError);
            }
        }
        
        logger.error('Error creating order from session:', error);
        throw error;
    }
};

// Function to update order status
export const updateOrderStatus = async (orderId, status, additionalData = {}) => {
    try {
        const updateData = { status, ...additionalData };
        const updatedOrder = await orderModel.findByIdAndUpdate(
            orderId,
            updateData,
            { new: true, runValidators: true }
        );
        
        if (!updatedOrder) {
            throw new Error('Order not found');
            }
        
        logger.info(`Order ${orderId} status updated to: ${status}`);
        return updatedOrder;
        
    } catch (error) {
        logger.error('Error updating order status:', error);
        throw error;
    }
};

// Function to handle duplicate key errors for orders
export const handleDuplicateOrderError = async (error, stripeSessionId) => {
    if (error.code === 11000 && error.keyPattern?.stripeSessionId) {
        logger.info('Duplicate key error, trying to find existing order');
        
        try {
            const existingOrder = await orderModel.findOne({ stripeSessionId });
            if (existingOrder) {
                return { success: true, order: existingOrder };
        }
        } catch (findError) {
            logger.error('Error finding existing order after duplicate key error:', findError);
    }
    }
    
    throw error;
};

// Function to safely create order with retry logic
export const createOrderSafely = async (session, options = {}) => {
    const { addressType = 'webhook' } = options;
    
    try {
        // Check if order already exists
        const existingOrder = await orderModel.findOne({ stripeSessionId: session.id });
        if (existingOrder) {
            logger.info('Order already exists for session:', session.id);
            return { created: false, order: existingOrder };
        }

        // Parse products from session metadata
        let products = [];
        if (session.metadata?.products) {
            try {
                products = JSON.parse(session.metadata.products);
            } catch (parseError) {
                logger.error('Error parsing products from session metadata:', parseError);
                throw new Error('Invalid products data in session');
            }
        }

        // Calculate total amount
        let totalAmount = 0;
        const orderItems = [];

        for (const productData of products) {
            const product = await productModel.findById(productData.id);
            if (!product) {
                logger.warn('Product not found:', productData.id);
                continue;
            }

            const itemTotal = product.price * productData.quantity;
            totalAmount += itemTotal;

            orderItems.push({
                product: product._id,
                quantity: productData.quantity,
                price: product.price,
                name: product.name,
                image: product.image
            });
        }

        // Create order with address information
        const orderData = {
            user: session.metadata.userId,
            stripeSessionId: session.id,
            status: 'processing', 
            items: orderItems,
            totalAmount: totalAmount,
            paymentStatus: 'paid',
            paymentMethod: 'stripe',
            addressType: addressType
        };

        // Add shipping address if available
        if (session.shipping?.address) {
            orderData.shippingAddress = {
                line1: session.shipping.address.line1 || '',
                line2: session.shipping.address.line2 || '',
                city: session.shipping.address.city || '',
                state: session.shipping.address.state || '',
                postal_code: session.shipping.address.postal_code || '',
                country: session.shipping.address.country || ''
            };
        }

        // Add customer information if available
        if (session.customer_details) {
            orderData.customerInfo = {
                name: session.customer_details.name || '',
                email: session.customer_details.email || '',
                phone: session.customer_details.phone || ''
            };
        }

        const newOrder = new orderModel(orderData);
        await newOrder.save();

        // Send order confirmation email
        try {
            const userEmail = orderData.customerInfo?.email;
            if (userEmail) {
                await sendEmail({
                    to: userEmail,
                    subject: 'Your Order Confirmation - Pioneer',
                    message: `
                        <h2>Thank you for your order!</h2>
                        <p>Order ID: <b>${newOrder._id}</b></p>
                        <p>Total: <b>$${newOrder.totalAmount.toFixed(2)}</b></p>
                        <h3>Order Details:</h3>
                        <ul>
                            ${newOrder.items.map(item => `
                                <li>
                                    ${item.name} (x${item.quantity}) - $${item.price}
                                </li>
                            `).join('')}
                        </ul>
                        <p>We will notify you when your order ships.</p>
                    `
                });
            }
        } catch (emailErr) {
            logger.error('Failed to send order confirmation email:', emailErr);
        }

        logger.info('Order created successfully:', newOrder._id);
        return { created: true, order: newOrder };

    } catch (error) {
        if (error.code === 11000) {
            // Duplicate key error - order was created by another process
            logger.info('Order was created by another process for session:', session.id);
            
            try {
                const existingOrder = await orderModel.findOne({ stripeSessionId: session.id });
                if (existingOrder) {
                    return { created: false, order: existingOrder };
                }
            } catch (findError) {
                logger.error('Error finding existing order:', findError);
            }
        }
        
        logger.error('Error creating order safely:', error);
        throw error;
    }
};

// Function to wait for order to be created (for webhook race conditions)
export const waitForOrder = async (sessionId, timeoutMs = 5000) => {
    const startTime = Date.now();
    const checkInterval = 100; // Check every 100ms
    
    while (Date.now() - startTime < timeoutMs) {
        try {
            const order = await orderModel.findOne({ stripeSessionId: sessionId });
            if (order) {
                logger.info('Order found after waiting:', order._id);
                return order;
            }
            
            // Wait before next check
            await new Promise(resolve => setTimeout(resolve, checkInterval));
        } catch (error) {
            logger.error('Error while waiting for order:', error);
            throw error;
        }
    }
    
    logger.warn('Timeout waiting for order creation:', sessionId);
    return null;
};