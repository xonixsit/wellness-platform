import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const specialty = searchParams.get("specialty");
  const modality = searchParams.get("modality");
  const language = searchParams.get("language");

  const supabase = await createClient();
  let query = supabase
    .from("healers")
    .select("*")
    .eq("is_active", true)
    .order("rating", { ascending: false });

  if (specialty) query = query.contains("specialties", [specialty]);
  if (modality) query = query.contains("modalities", [modality]);
  if (language) query = query.contains("languages", [language]);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ healers: data });
}
