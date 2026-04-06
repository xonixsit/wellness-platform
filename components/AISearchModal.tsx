"use client";

import { useState } from "react";
import Link from "next/link";
import { Sparkles, X, Loader2, Search, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import HealerCard from "@/components/HealerCard";
import type { MatchResult } from "@/types";

const SUGGESTIONS = [
  "I'm dealing with anxiety after a divorce",
  "I need help processing grief and loss",
  "I'm burned out from work and feel empty",
  "I want to heal childhood trauma",
  "I'm going through a major life transition",
  "I struggle with anger and emotional regulation",
];

interface AISearchModalProps {
  open: boolean;
  onClose: () => void;
  initialQuery?: string;
}

export default function AISearchModal({ open, onClose, initialQuery = "" }: AISearchModalProps) {
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<MatchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [limitReached, setLimitReached] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (q?: string) => {
    const searchQuery = q || query;
    if (!searchQuery.trim()) return;
    setLoading(true);
    setError("");
    setLimitReached(false);
    setSearched(true);
    try {
      const res = await fetch("/api/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: searchQuery, limit: 5 }),
      });
      const data = await res.json();
      if (res.status === 429 && data.limitReached) { setLimitReached(true); return; }
      if (!res.ok) throw new Error(data.error);
      setResults(data.results);
    } catch (e: any) {
      setError(e.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-2xl glass-strong rounded-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-linear-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="font-semibold text-white">AI Healer Matching</h2>
              <p className="text-xs text-white/40">Describe what you're going through</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search input */}
        <div className="p-6 border-b border-white/10">
          <div className="relative">
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSearch(); } }}
              placeholder="e.g. I'm dealing with anxiety after a divorce and need someone who understands trauma..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-12 text-white placeholder-white/30 resize-none focus:outline-none focus:border-violet-500/50 focus:bg-white/8 transition-all text-sm leading-relaxed"
              rows={3}
            />
            <button
              onClick={() => handleSearch()}
              disabled={loading || !query.trim()}
              className="absolute right-3 bottom-3 w-8 h-8 bg-violet-600 hover:bg-violet-700 disabled:opacity-40 rounded-lg flex items-center justify-center transition-colors"
            >
              {loading ? <Loader2 className="w-4 h-4 text-white animate-spin" /> : <Search className="w-4 h-4 text-white" />}
            </button>
          </div>

          {/* Suggestions */}
          {!searched && (
            <div className="mt-3 flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => { setQuery(s); handleSearch(s); }}
                  className="text-xs px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/50 hover:text-white hover:border-violet-500/40 hover:bg-violet-500/10 transition-all"
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading && (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <div className="w-12 h-12 rounded-full bg-violet-500/20 flex items-center justify-center animate-pulse">
                <Sparkles className="w-6 h-6 text-violet-400" />
              </div>
              <p className="text-white/50 text-sm">Finding your best matches...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 text-sm">{error}</div>
          )}

          {limitReached && (
            <div className="bg-violet-500/10 border border-violet-500/20 rounded-xl p-5 text-center">
              <Zap className="w-8 h-8 text-violet-400 mx-auto mb-3" />
              <p className="text-white font-semibold mb-1">Daily limit reached</p>
              <p className="text-white/50 text-sm mb-4">You've used your 3 free AI matches today. Upgrade to Seeker for unlimited matching.</p>
              <Link href="/pricing" onClick={onClose}>
                <Button variant="gradient" size="sm" className="gap-2">
                  <Zap className="w-4 h-4" /> Upgrade to Seeker — $19/mo
                </Button>
              </Link>
            </div>
          )}

          {!loading && searched && results.length === 0 && !error && (
            <div className="text-center py-12 text-white/40">
              <p>No matches found. Try describing your situation differently.</p>
            </div>
          )}

          {!loading && results.length > 0 && (
            <div className="space-y-4">
              <p className="text-xs text-white/40 mb-4">Found {results.length} healers matched to your needs</p>
              {results.map((r, i) => (
                <div key={r.healer.id} className="animate-fade-up" style={{ animationDelay: `${i * 80}ms` }}>
                  <HealerCard
                    healer={r.healer}
                    explanation={r.explanation}
                    similarity={r.similarity}
                    compact
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
