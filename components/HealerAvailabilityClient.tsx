"use client";

import { useState } from "react";
import { Clock, Save, Loader2, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

interface Slot {
  id?: string;
  healer_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
}

interface Props {
  healerId: string;
  initialSlots: Slot[];
}

export default function HealerAvailabilityClient({ healerId, initialSlots }: Props) {
  const supabase = createClient();
  const [slots, setSlots] = useState<Slot[]>(initialSlots);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const addSlot = (dow: number) => {
    setSlots((prev) => [...prev, { healer_id: healerId, day_of_week: dow, start_time: "09:00", end_time: "17:00" }]);
  };

  const removeSlot = (index: number) => {
    setSlots((prev) => prev.filter((_, i) => i !== index));
  };

  const updateSlot = (index: number, field: "start_time" | "end_time", value: string) => {
    setSlots((prev) => prev.map((s, i) => i === index ? { ...s, [field]: value } : s));
  };

  const handleSave = async () => {
    setSaving(true);
    // Delete all existing and re-insert
    await supabase.from("availability_slots").delete().eq("healer_id", healerId);
    if (slots.length > 0) {
      await supabase.from("availability_slots").insert(
        slots.map(({ id: _id, ...s }) => s)
      );
    }
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="pt-24 pb-16 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Availability</h1>
            <p className="text-white/40 text-sm mt-1">Set the hours you're available each week</p>
          </div>
          <Button variant="gradient" onClick={handleSave} disabled={saving} className="gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? "Saved ✓" : <><Save className="w-4 h-4" /> Save</>}
          </Button>
        </div>

        {DAYS.map((day, dow) => {
          const daySlots = slots.map((s, i) => ({ ...s, _index: i })).filter((s) => s.day_of_week === dow);
          return (
            <div key={day} className="glass rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="font-medium text-white text-sm">{day}</p>
                <button onClick={() => addSlot(dow)} className="flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300 transition-colors">
                  <Plus className="w-3.5 h-3.5" /> Add slot
                </button>
              </div>
              {daySlots.length === 0 ? (
                <p className="text-xs text-white/20">No availability — click "Add slot" to add hours</p>
              ) : (
                <div className="space-y-2">
                  {daySlots.map((slot) => (
                    <div key={slot._index} className="flex items-center gap-3">
                      <Clock className="w-4 h-4 text-white/30 shrink-0" />
                      <input type="time" value={slot.start_time} onChange={(e) => updateSlot(slot._index, "start_time", e.target.value)}
                        className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-violet-500/50" />
                      <span className="text-white/30 text-sm">to</span>
                      <input type="time" value={slot.end_time} onChange={(e) => updateSlot(slot._index, "end_time", e.target.value)}
                        className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-violet-500/50" />
                      <button onClick={() => removeSlot(slot._index)} className="text-white/20 hover:text-red-400 transition-colors ml-auto">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
