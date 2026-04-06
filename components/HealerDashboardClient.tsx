"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  DollarSign, TrendingUp, Calendar, CheckCircle, AlertCircle,
  Loader2, ExternalLink, Zap, Star, Users, Settings, BadgeCheck, ArrowRight
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PLATFORM_FEE_PERCENT } from "@/lib/plans";

interface Session {
  id: string;
  amount_total: number;
  platform_fee: number;
  healer_payout: number;
  status: string;
  created_at: string;
}

interface HealerDashboardClientProps {
  healer: {
    id: string;
    name: string;
    title: string;
    stripe_account_id: string | null;
    stripe_onboarding_complete: boolean;
    session_price: number;
    session_duration: number;
    rating: number;
    review_count: number;
    is_verified: boolean;
    specialties: string[];
  };
  sessions: Session[];
  totalEarnedCents: number;
}

export default function HealerDashboardClient({ healer, sessions, totalEarnedCents }: HealerDashboardClientProps) {
  const searchParams = useSearchParams();
  const connectStatus = searchParams.get("connect");
  const isWelcome = searchParams.get("welcome") === "true";

  const [connectState, setConnectState] = useState<{
    connected: boolean;
    onboardingComplete: boolean;
    payoutsEnabled: boolean;
  } | null>(null);
  const [onboarding, setOnboarding] = useState(false);

  useEffect(() => {
    fetch("/api/stripe/connect/status")
      .then((r) => r.json())
      .then(setConnectState)
      .catch(() => setConnectState({ connected: false, onboardingComplete: false, payoutsEnabled: false }));
  }, []);

  const handleOnboard = async () => {
    setOnboarding(true);
    const res = await fetch("/api/stripe/connect/onboard", { method: "POST" });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
    else { alert(data.error || "Something went wrong"); setOnboarding(false); }
  };

  const totalEarned = totalEarnedCents / 100;
  const paidSessions = sessions.filter((s) => s.status === "paid");
  const initials = healer.name.split(" ").map((n) => n[0]).join("").slice(0, 2);

  return (
    <div className="pt-24 pb-16 px-4">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Welcome banner */}
        {isWelcome && (
          <div className="glass rounded-2xl p-5 border border-violet-500/30 flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center shrink-0">
              <Zap className="w-5 h-5 text-violet-400" />
            </div>
            <div>
              <p className="font-semibold text-white mb-1">Welcome to Healio, {healer.name.split(" ")[0]}!</p>
              <p className="text-sm text-white/50">Your profile is live and visible to clients. Connect your Stripe account below to start receiving payouts when clients book sessions.</p>
            </div>
          </div>
        )}

        {/* Stripe connect success */}
        {connectStatus === "success" && (
          <div className="glass rounded-2xl p-4 border border-green-500/30 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-400 shrink-0" />
            <p className="text-sm text-white">Stripe account connected — you can now receive payouts automatically.</p>
          </div>
        )}

        {/* Header: profile summary */}
        <div className="glass rounded-2xl p-6 flex items-start gap-5">
          <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-violet-500/30 to-indigo-600/30 border border-violet-500/20 flex items-center justify-center text-xl font-bold text-violet-300 shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-white">{healer.name}</h1>
              {healer.is_verified && (
                <span className="flex items-center gap-1 text-xs text-violet-400 bg-violet-500/10 border border-violet-500/20 px-2 py-0.5 rounded-full">
                  <BadgeCheck className="w-3 h-3" /> Verified
                </span>
              )}
            </div>
            <p className="text-white/50 text-sm mt-0.5">{healer.title}</p>
            <div className="flex items-center gap-4 mt-2 text-xs text-white/40">
              <span className="flex items-center gap-1"><Star className="w-3 h-3 text-amber-400 fill-amber-400" />{healer.rating} ({healer.review_count} reviews)</span>
              <span>${healer.session_price} / {healer.session_duration}min</span>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-3">
              {healer.specialties.slice(0, 4).map((s) => (
                <span key={s} className="text-xs px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-white/50">{s}</span>
              ))}
              {healer.specialties.length > 4 && (
                <span className="text-xs px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-white/30">+{healer.specialties.length - 4}</span>
              )}
            </div>
          </div>
          <Link href="/dashboard/healer/profile">
            <Button variant="outline" size="sm" className="gap-1.5 shrink-0">
              <Settings className="w-3.5 h-3.5" /> Edit Profile
            </Button>
          </Link>
        </div>

        {/* Stripe connect CTA */}
        {connectState === null ? (
          <div className="glass rounded-2xl p-6 flex items-center justify-center">
            <Loader2 className="w-5 h-5 text-white/40 animate-spin" />
          </div>
        ) : !connectState.connected || !connectState.onboardingComplete ? (
          <div className="glass rounded-2xl p-6 border border-amber-500/20">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5 text-amber-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-white mb-1">Set up payouts to accept bookings</h3>
                <p className="text-sm text-white/50 mb-4">
                  Connect your Stripe account to receive {100 - PLATFORM_FEE_PERCENT}% of each session payment directly to your bank. Takes about 2 minutes.
                </p>
                <div className="grid grid-cols-3 gap-3 mb-5 text-center">
                  {[
                    { label: "Your cut", value: `${100 - PLATFORM_FEE_PERCENT}%` },
                    { label: "Platform fee", value: `${PLATFORM_FEE_PERCENT}%` },
                    { label: "Payout speed", value: "~2 days" },
                  ].map((s) => (
                    <div key={s.label} className="bg-white/5 rounded-xl p-3">
                      <div className="text-lg font-bold text-white">{s.value}</div>
                      <div className="text-xs text-white/40 mt-0.5">{s.label}</div>
                    </div>
                  ))}
                </div>
                <Button variant="gradient" onClick={handleOnboard} disabled={onboarding} className="gap-2">
                  {onboarding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                  {connectState.connected ? "Complete Stripe Setup" : "Connect Stripe Account"}
                  <ExternalLink className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="glass rounded-2xl p-4 border border-green-500/20 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <div>
                <p className="text-sm font-medium text-white">Payouts active</p>
                <p className="text-xs text-white/40">You receive {100 - PLATFORM_FEE_PERCENT}% of every session automatically</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={handleOnboard} className="gap-1.5 text-xs shrink-0">
              Manage <ExternalLink className="w-3 h-3" />
            </Button>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { icon: DollarSign, label: "Total Earned", value: `$${totalEarned.toFixed(2)}`, color: "text-green-400" },
            { icon: Users, label: "Sessions", value: paidSessions.length.toString(), color: "text-blue-400" },
            { icon: TrendingUp, label: "Avg / Session", value: paidSessions.length ? `$${(totalEarned / paidSessions.length).toFixed(0)}` : "$0", color: "text-violet-400" },
          ].map((s) => (
            <div key={s.label} className="glass rounded-2xl p-5 text-center">
              <s.icon className={`w-6 h-6 ${s.color} mx-auto mb-2`} />
              <div className="text-2xl font-bold text-white">{s.value}</div>
              <div className="text-xs text-white/40 mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Quick actions */}
        <div className="grid sm:grid-cols-2 gap-4">
          <Link href="/dashboard/healer/availability" className="glass rounded-2xl p-5 border border-white/5 hover:border-violet-500/30 transition-all group flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center group-hover:bg-violet-500/20 transition-colors">
              <Calendar className="w-5 h-5 text-violet-400" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-white text-sm">Manage Availability</p>
              <p className="text-xs text-white/40 mt-0.5">Set your weekly schedule</p>
            </div>
            <ArrowRight className="w-4 h-4 text-white/20 group-hover:text-violet-400 transition-colors" />
          </Link>
          <Link href="/dashboard/healer/profile" className="glass rounded-2xl p-5 border border-white/5 hover:border-violet-500/30 transition-all group flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center group-hover:bg-indigo-500/20 transition-colors">
              <Settings className="w-5 h-5 text-indigo-400" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-white text-sm">Edit Profile</p>
              <p className="text-xs text-white/40 mt-0.5">Update bio, pricing, specialties</p>
            </div>
            <ArrowRight className="w-4 h-4 text-white/20 group-hover:text-indigo-400 transition-colors" />
          </Link>
        </div>

        {/* Recent sessions */}
        <div className="glass rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-white/10 flex items-center justify-between">
            <h2 className="font-semibold text-white">Recent Sessions</h2>
          </div>
          {sessions.length === 0 ? (
            <div className="p-10 text-center">
              <Calendar className="w-8 h-8 text-white/20 mx-auto mb-3" />
              <p className="text-white/30 text-sm">No sessions yet.</p>
              <p className="text-white/20 text-xs mt-1">Once clients book with you, sessions will appear here.</p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {sessions.map((s) => (
                <div key={s.id} className="flex items-center justify-between px-5 py-4 text-sm">
                  <div>
                    <p className="text-white/70">{new Date(s.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
                    <p className="text-xs text-white/30 mt-0.5">#{s.id.slice(0, 8)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-medium">+${(s.healer_payout / 100).toFixed(2)}</p>
                    <p className="text-xs text-white/30">${(s.amount_total / 100).toFixed(2)} total</p>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full ml-4 ${
                    s.status === "paid" ? "bg-green-500/15 text-green-400" :
                    s.status === "refunded" ? "bg-red-500/15 text-red-400" :
                    "bg-white/10 text-white/40"
                  }`}>
                    {s.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
