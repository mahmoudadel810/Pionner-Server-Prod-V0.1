import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
	{
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		products: [
			{
				product: {
					type: mongoose.Schema.Types.ObjectId,
					ref: "Product",
					required: true,
				},
				quantity: {
					type: Number,
					required: true,
					min: 1,
				},
				price: {
					type: Number,
					required: true,
					min: 0,
				},
				// Category information for analytics and reporting
				category: {
					type: String,
					required: true,
				},
				categoryId: {
					type: mongoose.Schema.Types.ObjectId,
					ref: 'Category',
					required: true,
				},
				// Product details snapshot at time of order
				productName: {
					type: String,
					required: true,
				},
				productImage: {
					type: String,
					required: true,
				}
			},
		],
		totalAmount: {
			type: Number,
			required: true,
			min: 0,
		},
		// Category breakdown for analytics
		categoryBreakdown: [{
			categoryId: {
				type: mongoose.Schema.Types.ObjectId,
				ref: 'Category',
				required: true,
			},
			categoryName: {
				type: String,
				required: true,
			},
			itemCount: {
				type: Number,
				required: true,
				min: 0,
			},
			totalAmount: {
				type: Number,
				required: true,
				min: 0,
			}
		}],
		status: {
			type: String,
			enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
			default: 'pending'
		},
		shippingAddress: {
			street: String,
			city: String,
			state: String,
			zipCode: String,
			country: String
		},
		stripeSessionId: {
			type: String,
			unique: true,
			index: true,
		},
		paymentStatus: {
			type: String,
			enum: ['pending', 'paid', 'failed', 'refunded'],
			default: 'pending'
		}
	},
	{ timestamps: true }
);

// Pre-save middleware to calculate category breakdown
orderSchema.pre('save', function(next) {
	if (this.isModified('products')) {
		// Calculate category breakdown
		const categoryMap = new Map();
		
		this.products.forEach(item => {
			const categoryId = item.categoryId.toString();
			const categoryName = item.category;
			
			if (categoryMap.has(categoryId)) {
				const existing = categoryMap.get(categoryId);
				existing.itemCount += item.quantity;
				existing.totalAmount += (item.price * item.quantity);
			} else {
				categoryMap.set(categoryId, {
					categoryId: item.categoryId,
					categoryName: categoryName,
					itemCount: item.quantity,
					totalAmount: item.price * item.quantity
				});
			}
		});
		
		this.categoryBreakdown = Array.from(categoryMap.values());
	}
	next();
});

// Virtual for total items count
orderSchema.virtual('totalItems').get(function() {
	return this.products.reduce((total, item) => total + item.quantity, 0);
});

// Virtual for unique categories count
orderSchema.virtual('uniqueCategories').get(function() {
	return this.categoryBreakdown.length;
});

// Index for better query performance
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ 'categoryBreakdown.categoryId': 1 });
orderSchema.index({ paymentStatus: 1 });
// stripeSessionId is already indexed via unique: true and index: true in schema

const orderModel = mongoose.model("Order", orderSchema);

export default orderModel; 