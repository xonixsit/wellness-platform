// Server-only — never import this in client components
import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-03-31.basil",
});

// Re-export plan constants with server-side price IDs filled in
export { PLATFORM_FEE_PERCENT, PLANS, type PlanId } from "./plans";

// Server-side plans with actual Stripe price IDs
export function getServerPlans() {
  return {
    seeker: { priceId: process.env.STRIPE_SEEKER_PRICE_ID! },
    pro: { priceId: process.env.STRIPE_PRO_PRICE_ID! },
  };
}
