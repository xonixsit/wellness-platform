"use client";

import { useState } from "react";
import { Star, Clock, Globe, BadgeCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import BookingModal from "@/components/BookingModal";
import type { Healer } from "@/types";

interface HealerCardProps {
  healer: Healer;
  explanation?: string;
  similarity?: number;
  onAskAI?: () => void;
  compact?: boolean;
  isPro?: boolean;
}

export default function HealerCard({ healer, explanation, similarity, onAskAI, compact, isPro = false }: HealerCardProps) {
  const [bookingOpen, setBookingOpen] = useState(false);
  const initials = healer.name.split(" ").map((n) => n[0]).join("").slice(0, 2);
  const matchPct = similarity ? Math.round(similarity * 100) : null;

  return (
    <>
      <div className={cn(
        "glass rounded-2xl p-6 flex flex-col gap-4 hover:border-violet-500/30 transition-all duration-300 group",
        explanation && "border-violet-500/20 animate-pulse-glow"
      )}>
        {/* Match badge */}
        {matchPct && (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-violet-500/20 border border-violet-500/30 rounded-full px-3 py-1 text-xs text-violet-300">
              <Sparkles className="w-3 h-3" />
              {matchPct}% match
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex items-start gap-4">
          <div className="relative shrink-0">
            {healer.avatar_url ? (
              <img src={healer.avatar_url} alt={healer.name} className="w-14 h-14 rounded-xl object-cover" />
            ) : (
              <div className="w-14 h-14 rounded-xl bg-linear-to-br from-violet-500/30 to-indigo-600/30 border border-violet-500/20 flex items-center justify-center text-lg font-semibold text-violet-300">
                {initials}
              </div>
            )}
            {healer.is_verified && (
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-violet-600 rounded-full flex items-center justify-center">
                <BadgeCheck className="w-3 h-3 text-white" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold text-white truncate">{healer.name}</h3>
                <p className="text-sm text-white/50 truncate">{healer.title}</p>
              </div>
              <div className="text-right shrink-0">
                {isPro ? (
                  <>
                    <div className="text-white/40 line-through text-xs">${healer.session_price}</div>
                    <div className="text-amber-400 font-semibold">${(healer.session_price * 0.9).toFixed(0)}</div>
                  </>
                ) : (
                  <div className="text-white font-semibold">${healer.session_price}</div>
                )}
                <div className="text-xs text-white/40">/ session</div>
              </div>
            </div>

            <div className="flex items-center gap-3 mt-2 text-xs text-white/50">
              <span className="flex items-center gap-1">
                <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                {healer.rating} ({healer.review_count})
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {healer.session_duration}min
              </span>
              <span className="flex items-center gap-1">
                <Globe className="w-3 h-3" />
                {healer.languages[0]}
              </span>
            </div>
          </div>
        </div>

        {/* Specialties */}
        <div className="flex flex-wrap gap-1.5">
          {healer.specialties.slice(0, compact ? 3 : 5).map((s) => (
            <span key={s} className="text-xs px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-white/60">
              {s}
            </span>
          ))}
          {healer.specialties.length > (compact ? 3 : 5) && (
            <span className="text-xs px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-white/40">
              +{healer.specialties.length - (compact ? 3 : 5)}
            </span>
          )}
        </div>

        {/* AI Explanation */}
        {explanation && (
          <div className="bg-violet-500/10 border border-violet-500/20 rounded-xl p-3">
            <div className="flex items-center gap-1.5 text-xs text-violet-400 font-medium mb-1.5">
              <Sparkles className="w-3 h-3" /> Why this healer fits you
            </div>
            <p className="text-sm text-white/70 leading-relaxed">{explanation}</p>
          </div>
        )}

        {/* Bio (non-compact) */}
        {!compact && !explanation && (
          <p className="text-sm text-white/50 line-clamp-2 leading-relaxed">{healer.bio}</p>
        )}

        {/* Actions */}
        <div className="flex gap-2 mt-auto pt-2">
          <Button variant="gradient" size="sm" className="flex-1" onClick={() => setBookingOpen(true)}>
            Book Session
          </Button>
          {onAskAI && (
            <Button variant="outline" size="sm" onClick={onAskAI} className="gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Ask AI
            </Button>
          )}
        </div>
      </div>

      {bookingOpen && (
        <BookingModal healer={healer} onClose={() => setBookingOpen(false)} isPro={isPro} />
      )}
    </>
  );
}
