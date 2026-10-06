import nodemailer from "nodemailer";
import logger from "../utils/logger.js";

export const isEmailConfigured = () =>
    Boolean(process.env.EMAIL_SMTP_USER && process.env.EMAIL_SMTP_PASS);

let transporter = null;

const getTransporter = () => {
    transporter ??= nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE,
        port: process.env.EMAIL_SMTP_PORT,
        auth: {
            user: process.env.EMAIL_SMTP_USER,
            pass: process.env.EMAIL_SMTP_PASS,
        },
    });
    return transporter;
};

// Returns true when the message was accepted by the SMTP server.
// Returns false when SMTP is not configured; throws on delivery errors.
const sendEmail = async ({ to = "", subject = "", message = "", attachments = [] } = {}) => {
    if (!isEmailConfigured()) {
        logger.warn(`Email not sent (SMTP not configured): "${subject}" to ${to}`);
        return false;
    }

    const info = await getTransporter().sendMail({
        from: `"Pionner" <${process.env.EMAIL_SMTP_USER}>`,
        to,
        subject,
        html: message,
        attachments,
    });

    return info.rejected.length === 0;
};

export default sendEmail;
