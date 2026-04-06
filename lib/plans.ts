// Client-safe plan constants — no Stripe SDK, no secret keys

export const PLATFORM_FEE_PERCENT = 20;

export const PLANS = {
  free: {
    id: "free",
    name: "Explorer",
    price: 0,
    priceId: null,
    description: "Get started for free",
    features: [
      "Browse all healers",
      "3 AI matches per day",
      "View healer profiles",
      "Basic search & filters",
    ],
    limits: { aiMatches: 3 },
    badge: null,
  },
  seeker: {
    id: "seeker",
    name: "Seeker",
    price: 19,
    priceId: null, // set server-side only
    description: "For those ready to heal",
    features: [
      "Everything in Explorer",
      "Unlimited AI matching",
      "Save & bookmark healers",
      "Message healers directly",
      "Session booking",
      "Priority support",
    ],
    limits: { aiMatches: Infinity },
    badge: "Most Popular",
  },
  pro: {
    id: "pro",
    name: "Pro",
    price: 49,
    priceId: null, // set server-side only
    description: "The full healing experience",
    features: [
      "Everything in Seeker",
      "10% off all sessions",
      "Video session access",
      "Dedicated wellness coach",
      "Progress tracking",
      "Early access to new healers",
    ],
    limits: { aiMatches: Infinity },
    badge: "Best Value",
  },
} as const;

export type PlanId = keyof typeof PLANS;
