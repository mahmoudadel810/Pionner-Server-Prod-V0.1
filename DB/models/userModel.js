import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: [true, "Name is required"],
		},
		email: {
			type: String,
			required: [true, "Email is required"],
			unique: true,
			lowercase: true,
			trim: true,
			match: [
                /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
                'Please enter a valid email',
            ],
		},
		phone: {
			type: String,
			required: [true, "Phone is required"],
			unique: true,
			trim: true,
		},
		password: {
			type: String,
			required: [true, "Password is required"],
			minlength: [6, "Password must be at least 6 characters long"],
			// match:[
			// 	/^[\+]?[1-9][\d]{0,15}$/,
			// 	"hhhhhhhhhhhhhhhhhh"
			// ]
		},
		profileImage: {
			type: String,
			default: "",
		},
		cartItems: [
			{
				quantity: {
					type: Number,
					default: 1,
				},
				product: {
					type: mongoose.Schema.Types.ObjectId,
					ref: "Product",
				},
			},
		],
		role: {
			type: String,
			enum: ["customer", "admin"],
			default: "customer",
		},
		isConfirmed:{
			type:Boolean,
			default:false
		},
		 resetPasswordToken: {
            type: String,
        },
        resetPasswordTokenExpiresIn: {
            type: Date,
        },
		status:{
			type: String,
			enum: ["active", "inactive"],
			default: "inactive"
		}
	},
	{
		timestamps: true,
	}
);

// Pre-save hook to hash password before saving to database
userSchema.pre("save", async function (next) {
	if (!this.isModified("password")) return next();

	try {
		const saltRounds = +(process.env.SALT_ROUNDS);
		this.password = await bcrypt.hash(this.password, saltRounds);
		next();
	} catch (error) {
		next(error);
	}
});

userSchema.methods.comparePassword = async function (password) {
	return bcrypt.compare(password, this.password);
};

const userModel = mongoose.model("User", userSchema);

export default userModel; 