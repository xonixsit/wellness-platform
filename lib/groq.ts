import Groq from "groq-sdk";

export const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY!,
});

/**
 * Generate embeddings using Hugging Face Inference API.
 * nomic-embed-text-v1.5 → 768 dims
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const res = await fetch(
    "https://router.huggingface.co/hf-inference/models/BAAI/bge-base-en-v1.5",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.HF_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ inputs: text }),
    }
  );
  if (!res.ok) throw new Error(`Embedding API error: ${res.status}`);
  const data = await res.json();
  return Array.isArray(data[0]) ? data[0] : data;
}

/**
 * Build a rich text blob from a healer profile for embedding.
 */
export function buildHealerEmbeddingText(healer: {
  name: string;
  title: string;
  bio: string;
  specialties: string[];
  modalities: string[];
  approach: string;
  experience_years: number;
  languages: string[];
  feedback_themes: string[];
}): string {
  return `
Healer: ${healer.name}
Title: ${healer.title}
Bio: ${healer.bio}
Specialties: ${healer.specialties.join(", ")}
Modalities: ${healer.modalities.join(", ")}
Approach: ${healer.approach}
Experience: ${healer.experience_years} years
Languages: ${healer.languages.join(", ")}
Client Feedback Themes: ${healer.feedback_themes.join(", ")}
  `.trim();
}

/**
 * Generate a personalized match explanation using Groq LLM.
 */
export async function generateMatchExplanation(
  userQuery: string,
  healer: {
    name: string;
    title: string;
    specialties: string[];
    modalities: string[];
    approach: string;
    feedback_themes: string[];
  },
  similarityScore: number
): Promise<string> {
  const prompt = `You are a compassionate wellness advisor. A user is looking for support and you need to explain why a specific healer is a great match for them.

User's situation: "${userQuery}"

Healer Profile:
- Name: ${healer.name}
- Title: ${healer.title}
- Specialties: ${healer.specialties.join(", ")}
- Modalities: ${healer.modalities.join(", ")}
- Approach: ${healer.approach}
- Client Feedback Themes: ${healer.feedback_themes.join(", ")}
- Match Score: ${Math.round(similarityScore * 100)}%

Write a warm, specific 2-3 sentence explanation of why this healer is a good match for this user's needs. Be personal and reference specific aspects of both the user's situation and the healer's expertise. Do not mention the match score.`;

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "user", content: prompt }],
    max_tokens: 200,
    temperature: 0.7,
  });

  return completion.choices[0].message.content || "This healer is a great match for your needs.";
}
