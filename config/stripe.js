import Stripe from "stripe";
import dotenv from "dotenv";
dotenv.config();
const stripeInt = new Stripe(process.env.STRIPE_KEY);
export { stripeInt };
