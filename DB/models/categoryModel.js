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
			trim: true,
			lowercase: true,
			unique: true
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

// Generate a unique, URL-friendly slug from the category name
categorySchema.pre('save', async function(next) {
	try {
		if ((this.isModified('name') || !this.slug) && this.name) {
			const baseSlug = this.name
				.toLowerCase()
				.replace(/[^a-z0-9]+/g, '-')
				.replace(/(^-|-$)/g, '');

			let uniqueSlug = baseSlug;
			let counter = 1;

			// Ensure uniqueness by appending a counter if needed
			while (await this.constructor.findOne({ slug: uniqueSlug, _id: { $ne: this._id } })) {
				uniqueSlug = `${baseSlug}-${counter++}`;
			}

			this.slug = uniqueSlug;
		}
		return next();
	} catch (err) {
		return next(err);
	}
});

// Index for faster lookups and uniqueness at the database level
categorySchema.index({ slug: 1 }, { unique: true, sparse: true });

// Virtual for products relationship (commented out since we now have a real products array)
// categorySchema.virtual('products', {
// 	ref: 'Product',
// 	localField: '_id',
// 	foreignField: 'categoryId'
// });



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
