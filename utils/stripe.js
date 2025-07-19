import Stripe from "stripe";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../config/.env') });

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
   apiVersion: '2024-12-18.acacia'
});

// Test Stripe connection
// stripe.paymentMethods.list({ limit: 1 })
//    .then(() => console.log('Connected to Stripe successfully'))
//    .catch((error) => console.error('Stripe connection error:', error.message)); 