import nodemailer from "nodemailer";
import logger from "../utils/logger.js";

const sendEmail = async ({
    to = '',
    subject = '',
    message = '',
    attachments = []
} = {}) => {
    try {
        // Create email transporter
        const transporter = nodemailer.createTransport({
            service: process.env.EMAIL_SERVICE,
            port: process.env.EMAIL_SMTP_PORT,
            auth: {
                user: process.env.EMAIL_SMTP_USER,
                pass: process.env.EMAIL_SMTP_PASS,
            },
        });

        // Verify transporter configuration
        await transporter.verify();

        // Send email
        const info = await transporter.sendMail({
            from: `"Pionner" <${process.env.EMAIL_SMTP_USER}>`,
            to,
            subject,
            html: message,
            attachments
        });

        return !info.rejected.length;
    } catch (error) {
        logger.error('Email sending error:', error.message);
        throw error;
    }
};

export default sendEmail; 