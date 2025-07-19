import orderModel from '../DB/models/orderModel.js';
import logger from './logger.js';

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