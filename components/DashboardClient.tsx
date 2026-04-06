"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Sparkles, Search, ArrowRight, Heart, Calendar, Star, Zap, Crown, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import HealerCard from "@/components/HealerCard";
import AISearchModal from "@/components/AISearchModal";
import type { Healer } from "@/types";

interface DashboardClientProps {
  user: { email: string; full_name: string };
  featuredHealers: Healer[];
  subscription: { plan_id: string; status: string };
}

const QUICK_PROMPTS = [
  "I'm feeling overwhelmed and anxious",
  "I need help processing a loss",
  "I'm going through a major life change",
  "I want to work on my relationships",
];

const PLAN_LABELS: Record<string, { label: string; color: string; icon: typeof Zap }> = {
  free: { label: "Explorer (Free)", color: "text-white/50", icon: Sparkles },
  seeker: { label: "Seeker", color: "text-violet-400", icon: Zap },
  pro: { label: "Pro", color: "text-amber-400", icon: Crown },
};

export default function DashboardClient({ user, featuredHealers, subscription }: DashboardClientProps) {
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiQuery, setAiQuery] = useState("");
  const searchParams = useSearchParams();
  const upgraded = searchParams.get("upgraded") === "true";

  const firstName = user.full_name?.split(" ")[0] || user.email.split("@")[0];
  const openAI = (q: string) => { setAiQuery(q); setAiModalOpen(true); };
  const plan = PLAN_LABELS[subscription.plan_id] || PLAN_LABELS.free;
  const PlanIcon = plan.icon;

  return (
    <>
      <div className="pt-24 pb-16 px-4">
        <div className="max-w-7xl mx-auto space-y-8">

          {/* Upgrade success */}
          {upgraded && (
            <div className="glass rounded-2xl p-4 border border-green-500/30 flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-400 shrink-0" />
              <div>
                <p className="text-sm font-medium text-white">You're all set!</p>
                <p className="text-xs text-white/40">Your plan has been upgraded. Enjoy unlimited access.</p>
              </div>
            </div>
          )}

          {/* Upgrade banner for free users */}
          {subscription.plan_id === "free" && (
            <div className="glass rounded-2xl p-4 border border-violet-500/20 flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-violet-500/20 flex items-center justify-center">
                  <Zap className="w-4 h-4 text-violet-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">You're on the free plan</p>
                  <p className="text-xs text-white/40">3 AI matches per day. Upgrade for unlimited access.</p>
                </div>
              </div>
              <Link href="/pricing">
                <Button variant="gradient" size="sm" className="gap-2 whitespace-nowrap">
                  <Zap className="w-3.5 h-3.5" /> Upgrade Now
                </Button>
              </Link>
            </div>
          )}

          {/* Welcome */}
          <div className="glass rounded-2xl p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-white/40 text-sm">Welcome back</p>
                <span className={`text-xs flex items-center gap-1 ${plan.color}`}>
                  <PlanIcon className="w-3 h-3" /> {plan.label}
                </span>
              </div>
              <h1 className="text-3xl font-bold text-white mb-4">Hello, {firstName} 👋</h1>
              <p className="text-white/50 mb-6 max-w-lg">
                What are you looking for support with today? Describe your situation and our AI will find the right healer for you.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 max-w-xl">
                <input
                  type="text"
                  placeholder="What are you going through?"
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-violet-500/50 transition-colors text-sm"
                  onKeyDown={(e) => { if (e.key === "Enter") openAI((e.target as HTMLInputElement).value); }}
                />
                <Button variant="gradient" onClick={() => setAiModalOpen(true)} className="gap-2 whitespace-nowrap">
                  <Sparkles className="w-4 h-4" /> Find My Healer
                </Button>
              </div>
            </div>
          </div>

          {/* Quick prompts */}
          <div>
            <p className="text-xs text-white/40 font-medium mb-3">Quick start</p>
            <div className="flex flex-wrap gap-2">
              {QUICK_PROMPTS.map((q) => (
                <button
                  key={q}
                  onClick={() => openAI(q)}
                  className="text-sm px-4 py-2 glass rounded-full border border-white/10 text-white/60 hover:text-white hover:border-violet-500/40 hover:bg-violet-500/10 transition-all"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { icon: Heart, label: "Saved Healers", value: "0", color: "text-pink-400" },
              { icon: Calendar, label: "Sessions Booked", value: "0", color: "text-blue-400" },
              { icon: Star, label: "Reviews Given", value: "0", color: "text-amber-400" },
            ].map((s) => (
              <div key={s.label} className="glass rounded-2xl p-5 text-center">
                <s.icon className={`w-6 h-6 ${s.color} mx-auto mb-2`} />
                <div className="text-2xl font-bold text-white">{s.value}</div>
                <div className="text-xs text-white/40 mt-1">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Featured healers */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Top Healers</h2>
              <Link href="/healers">
                <Button variant="ghost" size="sm" className="gap-1.5 text-violet-400">
                  View all <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {featuredHealers.map((h) => (
                <HealerCard key={h.id} healer={h} onAskAI={() => openAI(`Tell me about ${h.name}`)} compact />
              ))}
            </div>
          </div>
        </div>
      </div>

      <AISearchModal open={aiModalOpen} onClose={() => setAiModalOpen(false)} initialQuery={aiQuery} />
    </>
  );
}
