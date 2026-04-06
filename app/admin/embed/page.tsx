"use client";

import { useState } from "react";
import { Sparkles, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminEmbedPage() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [error, setError] = useState("");

  const handleEmbed = async () => {
    setLoading(true);
    setError("");
    setResults([]);
    try {
      const res = await fetch("/api/healers/embed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResults(data.results);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="glass rounded-2xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Vectorize Healer Profiles</h1>
              <p className="text-sm text-white/40">Generate embeddings for all healers</p>
            </div>
          </div>

          <p className="text-white/50 text-sm mb-6 leading-relaxed">
            This will generate vector embeddings for all healer profiles using Groq's embedding model and store them in Supabase pgvector. Run this after adding or updating healer profiles.
          </p>

          <Button variant="gradient" onClick={handleEmbed} disabled={loading} className="gap-2 mb-6">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {loading ? "Generating Embeddings..." : "Embed All Healers"}
          </Button>

          {error && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          {results.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-white/40 font-medium mb-3">Results</p>
              {results.map((r) => (
                <div key={r.id} className="flex items-center gap-3 bg-white/5 rounded-xl px-4 py-3">
                  <CheckCircle className="w-4 h-4 text-green-400 shrink-0" />
                  <span className="text-sm text-white">{r.name}</span>
                  <span className="ml-auto text-xs text-green-400">{r.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
