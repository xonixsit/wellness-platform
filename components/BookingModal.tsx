"use client";

import { useState, useEffect } from "react";
import {
  X, Clock, BadgeCheck, Loader2, CreditCard,
  Sparkles, Shield, Star, ChevronLeft, ChevronRight, Calendar
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Healer } from "@/types";

interface BookingModalProps {
  healer: Healer;
  onClose: () => void;
  isPro?: boolean;
}

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];

function groupByDate(slots: string[]): Record<string, string[]> {
  const map: Record<string, string[]> = {};
  for (const iso of slots) {
    const d = new Date(iso);
    const key = d.toDateString();
    if (!map[key]) map[key] = [];
    map[key].push(iso);
  }
  return map;
}

export default function BookingModal({ healer, onClose, isPro = false }: BookingModalProps) {
  const [step, setStep] = useState<"pick" | "confirm">("pick");
  const [slots, setSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [weekOffset, setWeekOffset] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const initials = healer.name.split(" ").map((n) => n[0]).join("").slice(0, 2);
  const discountedPrice = isPro ? (healer.session_price * 0.9).toFixed(2) : null;
  const displayPrice = discountedPrice ?? healer.session_price.toFixed(2);

  useEffect(() => {
    fetch(`/api/healers/availability?healerId=${healer.id}&duration=${healer.session_duration}`)
      .then((r) => r.json())
      .then((d) => { setSlots(d.available || []); setLoadingSlots(false); });
  }, [healer.id, healer.session_duration]);

  // Build week days for current week offset
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() + weekOffset * 7);

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return d;
  });

  const grouped = groupByDate(slots);

  const handleBook = async () => {
    if (!selectedSlot) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/stripe/book-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          healerId: healer.id,
          healerName: healer.name,
          sessionPrice: healer.session_price,
          sessionDuration: healer.session_duration,
          scheduledAt: selectedSlot,
        }),
      });
      const data = await res.json();
      if (res.status === 401) { window.location.href = "/login"; return; }
      if (!res.ok) throw new Error(data.error);
      window.location.href = data.url;
    } catch (e: any) {
      setError(e.message || "Something went wrong");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-lg glass-strong rounded-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            {step === "confirm" && (
              <button onClick={() => setStep("pick")} className="text-white/40 hover:text-white transition-colors mr-1">
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
            <div className="relative shrink-0">
              {healer.avatar_url ? (
                <img src={healer.avatar_url} alt={healer.name} className="w-10 h-10 rounded-xl object-cover" />
              ) : (
                <div className="w-10 h-10 rounded-xl bg-linear-to-br from-violet-500/30 to-indigo-600/30 flex items-center justify-center text-sm font-semibold text-violet-300">
                  {initials}
                </div>
              )}
              {healer.is_verified && (
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-violet-600 rounded-full flex items-center justify-center">
                  <BadgeCheck className="w-2.5 h-2.5 text-white" />
                </div>
              )}
            </div>
            <div>
              <p className="font-semibold text-white text-sm">{healer.name}</p>
              <div className="flex items-center gap-2 text-xs text-white/40">
                <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                {healer.rating} · {healer.session_duration}min · ${displayPrice}
              </div>
            </div>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {step === "pick" ? (
            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-white flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-violet-400" /> Pick a time
                </h3>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setWeekOffset((w) => Math.max(0, w - 1))}
                    disabled={weekOffset === 0}
                    className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-white/40 hover:text-white disabled:opacity-30 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-xs text-white/40 px-2">
                    {MONTH_NAMES[weekDays[0].getMonth()]} {weekDays[0].getDate()} – {weekDays[6].getDate()}
                  </span>
                  <button
                    onClick={() => setWeekOffset((w) => Math.min(1, w + 1))}
                    disabled={weekOffset >= 1}
                    className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-white/40 hover:text-white disabled:opacity-30 transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {loadingSlots ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-5 h-5 text-violet-400 animate-spin" />
                </div>
              ) : (
                <div className="grid grid-cols-7 gap-1 mb-4">
                  {weekDays.map((day) => {
                    const key = day.toDateString();
                    const daySlots = grouped[key] || [];
                    const isPast = day < today;
                    return (
                      <div key={key} className="flex flex-col items-center gap-1">
                        <span className="text-xs text-white/30">{DAY_NAMES[day.getDay()]}</span>
                        <span className={`text-xs font-medium ${isPast ? "text-white/20" : "text-white/60"}`}>
                          {day.getDate()}
                        </span>
                        {!isPast && daySlots.length > 0 ? (
                          <div className="w-1.5 h-1.5 rounded-full bg-violet-500 mt-0.5" />
                        ) : (
                          <div className="w-1.5 h-1.5 mt-0.5" />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Time slots per day */}
              {!loadingSlots && (
                <div className="space-y-4">
                  {weekDays.map((day) => {
                    const key = day.toDateString();
                    const daySlots = grouped[key] || [];
                    if (!daySlots.length) return null;
                    return (
                      <div key={key}>
                        <p className="text-xs text-white/40 font-medium mb-2">
                          {DAY_NAMES[day.getDay()]}, {MONTH_NAMES[day.getMonth()]} {day.getDate()}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {daySlots.map((iso) => {
                            const t = new Date(iso);
                            const label = t.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
                            const isSelected = selectedSlot === iso;
                            return (
                              <button
                                key={iso}
                                onClick={() => setSelectedSlot(iso)}
                                className={`text-xs px-3 py-2 rounded-lg border transition-all ${
                                  isSelected
                                    ? "bg-violet-600 border-violet-500 text-white"
                                    : "bg-white/5 border-white/10 text-white/60 hover:border-violet-500/50 hover:text-white"
                                }`}
                              >
                                {label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                  {slots.length === 0 && (
                    <p className="text-center text-white/30 text-sm py-8">
                      No availability in the next 14 days.
                    </p>
                  )}
                </div>
              )}
            </div>
          ) : (
            /* Confirm step */
            <div className="p-5 space-y-4">
              <h3 className="font-semibold text-white">Confirm your booking</h3>

              {selectedSlot && (
                <div className="glass rounded-xl p-4 space-y-3">
                  {[
                    { label: "Date", value: new Date(selectedSlot).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }) },
                    { label: "Time", value: new Date(selectedSlot).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) },
                    { label: "Duration", value: `${healer.session_duration} minutes` },
                  ].map((r) => (
                    <div key={r.label} className="flex justify-between text-sm">
                      <span className="text-white/50">{r.label}</span>
                      <span className="text-white font-medium">{r.value}</span>
                    </div>
                  ))}
                  {isPro && (
                    <div className="flex justify-between text-sm">
                      <span className="text-white/50">Original price</span>
                      <span className="text-white/30 line-through">${healer.session_price}</span>
                    </div>
                  )}
                  <div className="border-t border-white/10 pt-3 flex justify-between">
                    <span className="font-semibold text-white">Total</span>
                    <span className="text-xl font-bold text-white">${displayPrice}</span>
                  </div>
                  {isPro && (
                    <div className="flex items-center gap-1.5 text-xs text-amber-400">
                      <Sparkles className="w-3 h-3" /> 10% Pro discount applied
                    </div>
                  )}
                </div>
              )}

              <div className="bg-violet-500/10 border border-violet-500/20 rounded-xl p-3 text-xs text-violet-300">
                A calendar invite (.ics) will be emailed to you after payment. The session link will be shared 30 minutes before your session.
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-red-400 text-sm">{error}</div>
              )}

              <Button variant="gradient" size="lg" className="w-full gap-2" onClick={handleBook} disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><CreditCard className="w-4 h-4" /> Pay & Book Session</>}
              </Button>

              <div className="flex items-center justify-center gap-1.5 text-xs text-white/30">
                <Shield className="w-3 h-3" /> Secured by Stripe · Cancel anytime
              </div>
            </div>
          )}
        </div>

        {/* Footer CTA for pick step */}
        {step === "pick" && (
          <div className="p-5 border-t border-white/10 shrink-0">
            <Button
              variant="gradient"
              size="lg"
              className="w-full"
              disabled={!selectedSlot}
              onClick={() => setStep("confirm")}
            >
              Continue {selectedSlot && `— ${new Date(selectedSlot).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}`}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
