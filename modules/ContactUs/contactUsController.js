import contactUsModel from "../../DB/models/contactUs.js";
import sendEmail from "../../service/sendEmail.js";

//==================================Create contact form submission==================================
export const createContact = async (req, res, next) => {
   try {
      const { name, email, subject, message } = req.body;

      // Create new contact submission
      const contact = await contactUsModel.create({
         name,
         email,
         subject,
         message
      });

      // Send confirmation email to user
      const emailContent = `
         <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9f9f9; border-radius: 8px; padding: 32px 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.04);">
            <div style="text-align: center; margin-bottom: 24px;">
               <img src="https://Pinner.com/assets/logo.png" alt="Pionner Logo" style="height: 48px; margin-bottom: 8px;">
               <h2 style="color: #222; margin: 0;">Thank you for contacting Pionner</h2>
            </div>
            <p style="font-size: 16px; color: #333;">Dear <strong>${name}</strong>,</p>
            <p style="font-size: 15px; color: #444; margin-bottom: 24px;">
               We appreciate you reaching out to us. Your message has been received and our support team will get back to you as soon as possible.
            </p>
            <div style="background: #fff; border-radius: 6px; padding: 20px 18px; border: 1px solid #ececec; margin-bottom: 24px;">
               <p style="margin: 0 0 8px 0; color: #666;"><strong>Subject:</strong> ${subject}</p>
               <p style="margin: 0; color: #666;"><strong>Message:</strong></p>
               <div style="margin: 8px 0 0 0; color: #444; white-space: pre-line;">${message}</div>
            </div>
            <p style="font-size: 14px; color: #888;">If you have any additional information to share, simply reply to this email.</p>
            <p style="font-size: 15px; color: #333; margin-top: 32px;">
               Kind regards,<br>
               <span style="color: #1976d2; font-weight: bold;">Pionner Support Team</span>
            </p>
         </div>
      `;

      await sendEmail({
         to: email,
         subject: "Thank you for contacting us - Pionner",
         message: emailContent
      });

      // Send notification email to admin
      const adminEmailContent = `
         <h2>New Contact Form Submission</h2>
         <p><strong>Name:</strong> ${name}</p>
         <p><strong>Email:</strong> ${email}</p>
         <p><strong>Subject:</strong> ${subject}</p>
         <p><strong>Message:</strong></p>
         <p>${message}</p>
         <p><strong>Submitted at:</strong> ${new Date().toLocaleString()}</p>
      `;

      await sendEmail({
         to: process.env.EMAIL_SMTP_USER,
         subject: `New Contact Form Submission - ${subject}`,
         message: adminEmailContent
      });

      res.status(201).json({
         success: true,
         message: "Contact form submitted successfully. We'll get back to you soon!",
         data: {
            contact: {
               _id: contact._id,
               name: contact.name,
               email: contact.email,
               subject: contact.subject,
               message: contact.message,
               createdAt: contact.createdAt
            }
         }
      });

   } catch (error) {
      next(error);
   }
};

//==================================Get all contact submissions (Admin only)==================================
export const getAllContact = async (req, res, next) => {
   try {
      const { page = 1, limit = 10, sort = "createdAt", order = "desc" } = req.query;

      const skip = (page - 1) * limit;
      const sortOrder = order === "asc" ? 1 : -1;

      const contact = await contactUsModel
         .find()
         .sort({ [sort]: sortOrder })
         .skip(skip)
         .limit(parseInt(limit))
         .select("-__v");

      const totalSubmissions = await contactUsModel.countDocuments();
      const totalPages = Math.ceil(totalSubmissions / limit);

      res.status(200).json({
         status: "success",
         message: "Contact submissions retrieved successfully",
         data: {
            contact,
            pagination: {
               currentPage: parseInt(page),
               totalPages,
               totalItems: totalSubmissions,
               hasNextPage: page < totalPages,
               hasPrevPage: page > 1
            }
         }
      });

   } catch (error) {
      next(error);
   }
};


//==================================Get single contact submission (Admin only)==================================
export const getContact = async (req, res, next) => {
   try {
      const { id } = req.params;

      const contact = await contactUsModel
         .findById(id)
         .select("-__v");

      if (!contact) {
         return res.status(404).json({
            status: "error",
            message: "Contact submission not found",
            error: "No contact submission found with this ID"
         });
      }

      res.status(200).json({
         status: "success",
         message: "Contact submission retrieved successfully",
         data: {
            contact
         }
      });

   } catch (error) {
      next(error);
   }
};

//===================Delete contact submission (Admin only)==================================
export const deleteContact = async (req, res, next) => {
   try {
      const { id } = req.params;

      const contact = await contactUsModel.findByIdAndDelete(id);

      if (!contact) {
         return res.status(404).json({
            status: "error",
            message: "Contact submission not found",
            error: "No contact submission found with this ID"
         });
      }

      res.status(200).json({
         status: "success",
         message: "Contact submission deleted successfully",
         data: {
            contact: {
               _id: contact._id,
               name: contact.name,
               email: contact.email,
               subject: contact.subject,
               message: contact.message,
               createdAt: contact.createdAt
            }
         }
      });

   } catch (error) {
      next(error);
   }
};

//===============Mark contact submission as read (Admin only)=============================
export const markAsRead = async (req, res, next) => {
   try {
      const { id } = req.params;

      const contact = await contactUsModel
         .findByIdAndUpdate(
            id,
            { isRead: true },
            { new: true }
         )
         .select("-__v");

      if (!contact) {
         return res.status(404).json({
            status: "error",
            message: "Contact submission not found",
            error: "No contact submission found with this ID"
         });
      }

      res.status(200).json({
         status: "success",
         message: "Contact submission marked as read",
         data: {
            contact
         }
      });

   } catch (error) {
      next(error);
   }
};

//==========Get unread contact submissions count (Admin only)==================================
export const getUnreadCount = async (req, res, next) => {
   try {
      const unreadCount = await contactUsModel.countDocuments({ isRead: { $ne: true } });

      res.status(200).json({
         status: "success",
         message: "Unread count retrieved successfully",
         data: {
            unreadCount
         }
      });

   } catch (error) {
      next(error);
   }
}; 