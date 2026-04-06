export interface Healer {
  id: string;
  user_id: string | null;
  name: string;
  title: string;
  bio: string;
  avatar_url: string | null;
  specialties: string[];
  modalities: string[];
  approach: string;
  experience_years: number;
  languages: string[];
  feedback_themes: string[];
  session_price: number;
  session_duration: number;
  availability: string[];
  rating: number;
  review_count: number;
  is_verified: boolean;
  is_active: boolean;
  created_at: string;
}

export interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  role: "user" | "healer" | "admin";
  created_at: string;
}

export interface MatchResult {
  healer: Healer;
  similarity: number;
  explanation: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  plan_id: "free" | "seeker" | "pro";
  status: "active" | "canceled" | "past_due" | "trialing" | "incomplete";
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
}
