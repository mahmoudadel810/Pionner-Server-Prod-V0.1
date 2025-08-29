import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: [true, "Category name is required"],
			trim: true,
			unique: true,
			minlength: [2, "Category name must be at least 2 characters long"],
			maxlength: [50, "Category name cannot exceed 50 characters"]
		},
		description: {
			type: String,
			required: [true, "Category description is required"],
			trim: true,
			minlength: [10, "Category description must be at least 10 characters long"],
			maxlength: [500, "Category description cannot exceed 500 characters"]
		},
		image: {
			type: String,
			// required: [true, "Category image is required"]
		},
		slug: {
			type: String,
			lowercase: true,
			trim: true
		},
		isActive: {
			type: Boolean,
			default: true
      },
      // products: [{
      //   type: mongoose.Schema.Types.ObjectId,
      //   ref: 'Product'
      // }],
		productCount: {
			type: Number,
			default: 0
		},
		featured: {
			type: Boolean,
			default: false
		},
		order: {
			type: Number,
			default: 0
		},
		products: [{
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Product'
		}]
	},
	{ 
		timestamps: true,
		toJSON: { virtuals: true },
		toObject: { virtuals: true }
	}
);

// Virtual for products relationship (commented out since we now have a real products array)
// categorySchema.virtual('products', {
// 	ref: 'Product',
// 	localField: '_id',
// 	foreignField: 'categoryId'
// });

// Pre-save middleware to generate slug
categorySchema.pre('save', function(next) {
	if (this.isModified('name')) {
		this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
	}
	next();
});

// Static method to get categories with product count
categorySchema.statics.getCategoriesWithProductCount = async function() {
	return this.aggregate([
		{
			$lookup: {
				from: 'products',
				localField: '_id',
				foreignField: 'categoryId',
				as: 'products'
			}
		},
		{
			$addFields: {
				productCount: { $size: '$products' }
			}
		},
		{
			$project: {
				products: 0
			}
		},
		{
			$sort: { order: 1, name: 1 }
		}
	]);
};

const categoryModel = mongoose.model("Category", categorySchema);

export default categoryModel;
