import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
			trim: true,
			maxlength: [100, "Product name cannot exceed 100 characters"]
		},
		description: {
			type: String,
			required: true,
			trim: true,
			maxlength: [1000, "Product description cannot exceed 1000 characters"]
		},
		price: {
			type: Number,
			min: 0,
			required: true,
		},
		// Inventory management
		stockQuantity: {
			type: Number,
			default: 0,
			min: 0,
			required: true
		},
		inStock: {
			type: Boolean,
			default: true
		},
		minimumStock: {
			type: Number,
			default: 5,
			min: 0
		},
		// Product status
		isActive: {
			type: Boolean,
			default: true
		},
		image: {
			type: String,
			required: [true, "Image is required"],
		},
		images: {
			type: [String],
			default: [],
		},
		category: {
			type: String,
			required: true,
		},
		categoryId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Category',
			required: true
		},
		isFeatured: {
			type: Boolean,
			default: false,
		},
		// Order tracking and analytics
		totalOrders: {
			type: Number,
			default: 0,
			min: 0
		},
		totalSold: {
			type: Number,
			default: 0,
			min: 0
		},
		totalRevenue: {
			type: Number,
			default: 0,
			min: 0
		},
		// Product ratings and reviews
		averageRating: {
			type: Number,
			default: 0,
			min: 0,
			max: 5
		},
		reviewCount: {
			type: Number,
			default: 0,
			min: 0
		},
		// Product variants (size, color, etc.)
		variants: [{
			name: {
				type: String,
				required: true
			},
			value: {
				type: String,
				required: true
			},
			price: {
				type: Number,
				min: 0
			},
			stockQuantity: {
				type: Number,
				default: 0,
				min: 0
			}
		}],
		// Product tags for search and filtering
		tags: [{
			type: String,
			trim: true
		}],
		// SEO fields
		slug: {
			type: String,
			lowercase: true,
			trim: true
		},
		metaTitle: {
			type: String,
			maxlength: [60, "Meta title cannot exceed 60 characters"]
		},
		metaDescription: {
			type: String,
			maxlength: [160, "Meta description cannot exceed 160 characters"]
		}
	},
	{ 
		timestamps: true,
		toJSON: { virtuals: true },
		toObject: { virtuals: true }
	}
);

productSchema.pre('save', function(next) {
	if ((this.isModified('name') || !this.slug) && this.name) {
		this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
	}
	
	this.inStock = this.stockQuantity > 0;
	
	next();
});

productSchema.virtual('stockStatus').get(function() {
	if (this.stockQuantity === 0) return 'out_of_stock';
	if (this.stockQuantity <= this.minimumStock) return 'low_stock';
	return 'in_stock';
});

productSchema.virtual('hasDiscount').get(function() {
	return this.originalPrice && this.originalPrice > this.price;
});

productSchema.statics.getLowStockProducts = function() {
	return this.find({
		stockQuantity: { $lte: '$minimumStock' },
		isActive: true
	}).populate('categoryId', 'name');
};

productSchema.statics.getOutOfStockProducts = function() {
	return this.find({
		stockQuantity: 0,
		isActive: true
	}).populate('categoryId', 'name');
};

productSchema.statics.getBestSellingProducts = function(limit = 10) {
	return this.find({ isActive: true })
		.sort({ totalSold: -1 })
		.limit(limit)
		.populate('categoryId', 'name');
};

productSchema.statics.getHighestRevenueProducts = function(limit = 10) {
	return this.find({ isActive: true })
		.sort({ totalRevenue: -1 })
		.limit(limit)
		.populate('categoryId', 'name');
};

productSchema.methods.updateStockAfterOrder = async function(quantity) {
	this.stockQuantity = Math.max(0, this.stockQuantity - quantity);
	this.totalSold += quantity;
	this.totalOrders += 1;
	this.inStock = this.stockQuantity > 0;
	await this.save();
};

productSchema.methods.updateRevenue = async function(amount) {
	this.totalRevenue += amount;
	await this.save();
};

productSchema.index({ categoryId: 1, isActive: 1 });
productSchema.index({ isFeatured: 1, isActive: 1 });
productSchema.index({ slug: 1 });
productSchema.index({ stockQuantity: 1 });
productSchema.index({ totalSold: -1 });
productSchema.index({ totalRevenue: -1 });
productSchema.index({ averageRating: -1 });
productSchema.index({ tags: 1 });
productSchema.index({ name: 'text', description: 'text', tags: 'text' });

const productModel = mongoose.model("Product", productSchema);

export default productModel; 