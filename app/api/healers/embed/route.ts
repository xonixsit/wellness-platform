import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { generateEmbedding, buildHealerEmbeddingText } from "@/lib/groq";

// Uses service role to bypass RLS for embedding updates
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const { healer_id } = await request.json();

    // Fetch healer(s) to embed
    const query = supabaseAdmin.from("healers").select("*");
    if (healer_id) query.eq("id", healer_id);

    const { data: healers, error } = await query;
    if (error) throw error;

    const results = [];
    for (const healer of healers || []) {
      const text = buildHealerEmbeddingText(healer);
      const embedding = await generateEmbedding(text);

      const { error: updateError } = await supabaseAdmin
        .from("healers")
        .update({ embedding })
        .eq("id", healer.id);

      if (updateError) throw updateError;
      results.push({ id: healer.id, name: healer.name, status: "embedded" });
    }

    return NextResponse.json({ success: true, results });
  } catch (error) {
    console.error("Embed error:", error);
    return NextResponse.json({ error: "Failed to generate embeddings" }, { status: 500 });
  }
}
