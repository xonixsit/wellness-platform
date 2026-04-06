import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
config({ path: ".env.local" });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const HF_API_KEY = process.env.HF_API_KEY || "";

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

function buildText(h) {
  return `
Healer: ${h.name}
Title: ${h.title}
Bio: ${h.bio}
Specialties: ${h.specialties.join(", ")}
Modalities: ${h.modalities.join(", ")}
Approach: ${h.approach}
Experience: ${h.experience_years} years
Languages: ${h.languages.join(", ")}
Client Feedback Themes: ${h.feedback_themes.join(", ")}
  `.trim();
}

async function embed(text) {
  const res = await fetch(
    "https://router.huggingface.co/hf-inference/models/BAAI/bge-base-en-v1.5",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${HF_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ inputs: text }),
    }
  );
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`HF API error ${res.status}: ${err}`);
  }
  const data = await res.json();
  return Array.isArray(data[0]) ? data[0] : data;
}

async function run() {
  const { data: healers, error } = await supabase.from("healers").select("*");
  if (error) { console.error("Failed to fetch healers:", error.message); process.exit(1); }

  console.log(`Embedding ${healers.length} healers...\n`);

  for (const healer of healers) {
    process.stdout.write(`  ${healer.name}... `);
    try {
      const text = buildText(healer);
      const embedding = await embed(text);
      const { error: updateError } = await supabase
        .from("healers")
        .update({ embedding })
        .eq("id", healer.id);
      if (updateError) throw updateError;
      console.log(`✓ (${embedding.length} dims)`);
    } catch (e) {
      console.log(`✗ ${e.message}`);
    }
  }

  console.log("\nDone! All healers embedded.");
}

run();
