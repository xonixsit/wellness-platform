import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { generateEmbedding, generateMatchExplanation } from "@/lib/groq";
import { PLANS } from "@/lib/stripe";
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

    // Check auth & subscription
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const { data: sub } = await supabaseAdmin
        .from("subscriptions")
        .select("plan_id")
        .eq("user_id", user.id)
        .single();

      const planId = (sub?.plan_id || "free") as keyof typeof PLANS;
      const plan = PLANS[planId];
      const dailyLimit = plan.limits.aiMatches;

      if (dailyLimit !== Infinity) {
        const today = new Date().toISOString().split("T")[0];
        const { data: usage } = await supabaseAdmin
          .from("ai_usage")
          .select("count")
          .eq("user_id", user.id)
          .eq("date", today)
          .single();

        const currentCount = usage?.count || 0;
        if (currentCount >= dailyLimit) {
          return NextResponse.json(
            { error: "Daily AI match limit reached. Upgrade to Seeker for unlimited matches.", limitReached: true },
            { status: 429 }
          );
        }

        // Increment usage
        await supabaseAdmin.from("ai_usage").upsert(
          { user_id: user.id, date: today, count: currentCount + 1 },
          { onConflict: "user_id,date" }
        );
      }
    } else {
      // Unauthenticated: allow 1 free search (no tracking, just let it through)
    }

    const queryEmbedding = await generateEmbedding(query);
    const { data: matches, error } = await supabaseAdmin.rpc("match_healers", {
      query_embedding: queryEmbedding,
      match_threshold: 0.3,
      match_count: limit,
    });

    if (error) throw error;

    const results: MatchResult[] = await Promise.all(
      (matches || []).map(async (match: any) => {
        const explanation = await generateMatchExplanation(query, match, match.similarity);
        return {
          healer: {
            id: match.id, user_id: null, name: match.name, title: match.title,
            bio: match.bio, avatar_url: match.avatar_url, specialties: match.specialties,
            modalities: match.modalities, approach: match.approach,
            experience_years: match.experience_years, languages: match.languages,
            feedback_themes: match.feedback_themes, session_price: match.session_price,
            session_duration: match.session_duration, availability: match.availability,
            rating: match.rating, review_count: match.review_count,
            is_verified: match.is_verified, is_active: true, created_at: "",
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
