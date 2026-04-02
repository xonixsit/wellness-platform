import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { generateEmbedding, generateMatchExplanation } from "@/lib/groq";
import type { MatchResult } from "@/types";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const { query, limit = 5 } = await request.json();

    if (!query || typeof query !== "string") {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    // Generate embedding for user query
    const queryEmbedding = await generateEmbedding(query);

    // Run semantic similarity search via pgvector
    const { data: matches, error } = await supabaseAdmin.rpc("match_healers", {
      query_embedding: queryEmbedding,
      match_threshold: 0.3,
      match_count: limit,
    });

    if (error) throw error;

    // Generate personalized explanations for each match
    const results: MatchResult[] = await Promise.all(
      (matches || []).map(async (match: any) => {
        const explanation = await generateMatchExplanation(query, match, match.similarity);
        return {
          healer: {
            id: match.id,
            user_id: null,
            name: match.name,
            title: match.title,
            bio: match.bio,
            avatar_url: match.avatar_url,
            specialties: match.specialties,
            modalities: match.modalities,
            approach: match.approach,
            experience_years: match.experience_years,
            languages: match.languages,
            feedback_themes: match.feedback_themes,
            session_price: match.session_price,
            session_duration: match.session_duration,
            availability: match.availability,
            rating: match.rating,
            review_count: match.review_count,
            is_verified: match.is_verified,
            is_active: true,
            created_at: "",
          },
          similarity: match.similarity,
          explanation,
        };
      })
    );

    return NextResponse.json({ results });
  } catch (error) {
    console.error("Match error:", error);
    return NextResponse.json({ error: "Matching failed" }, { status: 500 });
  }
}
