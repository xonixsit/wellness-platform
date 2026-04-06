"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Sparkles, Zap, Crown, Loader2, ArrowRight } from "lucide-react";
import { PLANS, type PlanId } from "@/lib/plans";
import { Button } from "@/components/ui/button";

interface PricingClientProps {
  user: { id: string; email: string } | null;
  currentPlan: string;
}

const PLAN_ICONS = {
  free: Sparkles,
  seeker: Zap,
  pro: Crown,
};

const PLAN_COLORS = {
  free: "from-white/10 to-white/5 border-white/10",
  seeker: "from-violet-600/20 to-indigo-600/10 border-violet-500/40",
  pro: "from-amber-500/20 to-orange-600/10 border-amber-500/40",
};

const ICON_COLORS = {
  free: "text-white/60",
  seeker: "text-violet-400",
  pro: "text-amber-400",
};

export default function PricingClient({ user, currentPlan }: PricingClientProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const handleUpgrade = async (planId: PlanId) => {
    if (!user) { router.push("/signup"); return; }
    if (planId === "free") return;
    setLoading(planId);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch {
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(null);
    }
  };

  const handleManageBilling = async () => {
    setLoading("portal");
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch {
      alert("Something went wrong.");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="pt-24 pb-20 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-sm mb-6">
            <Sparkles className="w-4 h-4" />
            Simple, transparent pricing
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Invest in your <span className="gradient-text">healing journey</span>
          </h1>
          <p className="text-white/50 text-lg max-w-xl mx-auto">
            Start free, upgrade when you're ready. Cancel anytime.
          </p>
        </div>

        {/* Plans */}
        <div className="grid md:grid-cols-3 gap-6">
          {(Object.values(PLANS) as typeof PLANS[PlanId][]).map((plan) => {
            const Icon = PLAN_ICONS[plan.id as PlanId];
            const isCurrentPlan = currentPlan === plan.id;
            const isPaid = plan.price > 0;

            return (
              <div
                key={plan.id}
                className={`relative rounded-2xl bg-linear-to-b ${PLAN_COLORS[plan.id as PlanId]} border p-6 flex flex-col ${plan.id === "seeker" ? "ring-1 ring-violet-500/50 scale-[1.02]" : ""}`}
              >
                {/* Badge */}
                {"badge" in plan && plan.badge && (
                  <div className={`absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-semibold ${plan.id === "seeker" ? "bg-violet-600 text-white" : "bg-amber-500 text-black"}`}>
                    {plan.badge}
                  </div>
                )}

                {/* Plan header */}
                <div className="mb-6">
                  <div className={`w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mb-4`}>
                    <Icon className={`w-5 h-5 ${ICON_COLORS[plan.id as PlanId]}`} />
                  </div>
                  <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                  <p className="text-white/40 text-sm mt-1">{plan.description}</p>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-white">${plan.price}</span>
                    {isPaid && <span className="text-white/40 text-sm">/month</span>}
                    {!isPaid && <span className="text-white/40 text-sm">forever</span>}
                  </div>
                </div>

                {/* Features */}
                <ul className="space-y-3 flex-1 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-white/70">
                      <Check className={`w-4 h-4 mt-0.5 shrink-0 ${ICON_COLORS[plan.id as PlanId]}`} />
                      {f}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                {isCurrentPlan ? (
                  <div className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-center text-sm text-white/50 font-medium">
                    Current Plan
                  </div>
                ) : currentPlan !== "free" && plan.id === "free" ? (
                  <button
                    onClick={handleManageBilling}
                    disabled={loading === "portal"}
                    className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-center text-sm text-white/50 hover:text-white/70 transition-colors font-medium"
                  >
                    {loading === "portal" ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Manage Billing"}
                  </button>
                ) : (
                  <Button
                    onClick={() => handleUpgrade(plan.id as PlanId)}
                    disabled={!!loading}
                    variant={plan.id === "seeker" ? "gradient" : plan.id === "pro" ? "default" : "outline"}
                    className={`w-full gap-2 ${plan.id === "pro" ? "bg-amber-500/20 border-amber-500/40 text-amber-300 hover:bg-amber-500/30" : ""}`}
                  >
                    {loading === plan.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        {plan.price === 0 ? "Get Started Free" : `Upgrade to ${plan.name}`}
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </Button>
                )}
              </div>
            );
          })}
        </div>

        {/* Manage billing link */}
        {user && currentPlan !== "free" && (
          <div className="text-center mt-8">
            <button
              onClick={handleManageBilling}
              className="text-sm text-white/40 hover:text-white/60 transition-colors underline underline-offset-4"
            >
              Manage subscription & billing
            </button>
          </div>
        )}

        {/* Trust signals */}
        <div className="mt-16 grid sm:grid-cols-3 gap-6 text-center">
          {[
            { title: "Cancel anytime", desc: "No lock-in. Cancel your subscription with one click." },
            { title: "Secure payments", desc: "Powered by Stripe. Your card data never touches our servers." },
            { title: "7-day refund", desc: "Not satisfied? Get a full refund within 7 days, no questions asked." },
          ].map((t) => (
            <div key={t.title} className="glass rounded-2xl p-5">
              <h4 className="font-semibold text-white mb-1">{t.title}</h4>
              <p className="text-sm text-white/40">{t.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
