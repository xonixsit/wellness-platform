"use client";

import { useState } from "react";
import Link from "next/link";
import { Sparkles, ArrowRight, Shield, Zap, Heart, Check, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import AISearchModal from "@/components/AISearchModal";

const STATS = [
  { value: "500+", label: "Verified Healers" },
  { value: "12k+", label: "Sessions Booked" },
  { value: "4.9★", label: "Average Rating" },
  { value: "HIPAA", label: "Compliant" },
];

const FEATURES = [
  { icon: Sparkles, title: "AI-Powered Matching", desc: "Semantic search understands your situation, not just keywords." },
  { icon: Shield, title: "HIPAA Compliant", desc: "Your data is protected with enterprise-grade security via Keragon." },
  { icon: Zap, title: "Instant Results", desc: "Vector embeddings deliver matches in milliseconds at any scale." },
  { icon: Heart, title: "Personalized Explanations", desc: "AI explains exactly why each healer fits your unique needs." },
];

export default function LandingHero() {
  const [modalOpen, setModalOpen] = useState(false);
  const [query, setQuery] = useState("");

  return (
    <>
      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
        {/* Background orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-indigo-600/15 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-900/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 text-sm text-violet-300 mb-8 border border-violet-500/20">
            <Sparkles className="w-4 h-4" />
            AI-Powered Wellness Matching
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight mb-6">
            Find the healer{" "}
            <span className="gradient-text">made for you</span>
          </h1>

          <p className="text-lg sm:text-xl text-white/50 max-w-2xl mx-auto mb-10 leading-relaxed">
            Describe what you're going through. Our AI matches you with the right practitioner and explains exactly why they're the right fit.
          </p>

          {/* Search bar */}
          <div className="max-w-2xl mx-auto mb-6">
            <div className="glass-strong rounded-2xl p-2 flex gap-2">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && query.trim()) setModalOpen(true); }}
                placeholder="I'm dealing with anxiety after a divorce..."
                className="flex-1 bg-transparent px-4 py-3 text-white placeholder-white/30 focus:outline-none text-sm"
              />
              <Button
                variant="gradient"
                size="lg"
                onClick={() => setModalOpen(true)}
                className="gap-2 px-6"
              >
                <Sparkles className="w-4 h-4" />
                Match Me
              </Button>
            </div>
          </div>

          {/* CTA links */}
          <div className="flex items-center justify-center gap-4 text-sm">
            <Link href="/healers" className="flex items-center gap-1.5 text-white/50 hover:text-white transition-colors">
              Browse all healers <ArrowRight className="w-4 h-4" />
            </Link>
            <span className="text-white/20">·</span>
            <Link href="/signup" className="text-violet-400 hover:text-violet-300 transition-colors">
              Create free account
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-16 max-w-2xl mx-auto">
            {STATS.map((s) => (
              <div key={s.label} className="glass rounded-xl p-4 text-center">
                <div className="text-2xl font-bold gradient-text">{s.value}</div>
                <div className="text-xs text-white/40 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Matching that actually <span className="gradient-text">understands you</span>
            </h2>
            <p className="text-white/40 max-w-xl mx-auto">
              Not keyword search. Not random filters. Real semantic understanding of your situation.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {FEATURES.map((f) => (
              <div key={f.title} className="glass rounded-2xl p-6 hover:border-violet-500/30 transition-all">
                <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center mb-4">
                  <f.icon className="w-5 h-5 text-violet-400" />
                </div>
                <h3 className="font-semibold text-white mb-2">{f.title}</h3>
                <p className="text-sm text-white/40 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA section */}
      <section className="py-24 px-4">
        <div className="max-w-2xl mx-auto text-center glass rounded-3xl p-12 border border-violet-500/20">
          <Sparkles className="w-10 h-10 text-violet-400 mx-auto mb-4" />
          <h2 className="text-3xl font-bold mb-4">Ready to find your healer?</h2>
          <p className="text-white/40 mb-8">Join thousands who found the right support through AI-powered matching.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/signup">
              <Button variant="gradient" size="lg" className="gap-2 w-full sm:w-auto">
                Get Started Free <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Button variant="outline" size="lg" onClick={() => setModalOpen(true)} className="gap-2 w-full sm:w-auto">
              <Sparkles className="w-4 h-4" /> Try AI Matching
            </Button>
          </div>
        </div>
      </section>

      <AISearchModal open={modalOpen} onClose={() => setModalOpen(false)} initialQuery={query} />

      {/* Pricing teaser */}
      <section className="py-24 px-4 border-t border-white/5">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-sm mb-6">
            <Zap className="w-4 h-4" />
            Simple pricing
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Start free, <span className="gradient-text">heal deeper</span>
          </h2>
          <p className="text-white/40 mb-10 max-w-lg mx-auto">
            Free forever for browsing. Upgrade for unlimited AI matching and direct healer access.
          </p>
          <div className="grid sm:grid-cols-3 gap-4 mb-8">
            {[
              { plan: "Explorer", price: "$0", features: ["Browse healers", "3 AI matches/day", "View profiles"], color: "border-white/10" },
              { plan: "Seeker", price: "$19/mo", features: ["Unlimited AI matching", "Save healers", "Message healers"], color: "border-violet-500/40", highlight: true },
              { plan: "Pro", price: "$49/mo", features: ["10% off sessions", "Video calls", "Wellness coach"], color: "border-amber-500/30" },
            ].map((p) => (
              <div key={p.plan} className={`glass rounded-2xl p-5 border ${p.color} ${p.highlight ? "ring-1 ring-violet-500/30" : ""}`}>
                <div className="font-semibold text-white mb-1">{p.plan}</div>
                <div className="text-2xl font-bold gradient-text mb-3">{p.price}</div>
                <ul className="space-y-1.5">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-xs text-white/50">
                      <Check className="w-3 h-3 text-violet-400 shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <Link href="/pricing">
            <Button variant="gradient" size="lg" className="gap-2">
              View all plans <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>
    </>
  );
}
