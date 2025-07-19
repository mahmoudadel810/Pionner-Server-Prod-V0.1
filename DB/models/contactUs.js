import mongoose from "mongoose";

const contactUsSchema = new mongoose.Schema({
   name: {
      type: String,
      required: true, 
   },
   email: {
      type: String,
      required: true,
   },
   subject: {
      type: String,
      required: true,
   },
   message: {
      type: String,
      required: true,
   },
   isRead: {
      type: Boolean,
      default: false,
   },
   createdAt: {
      type: Date,
      default: Date.now,
   },
});

const contactUsModel = mongoose.model("ContactUs", contactUsSchema);

export default contactUsModel;