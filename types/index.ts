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
