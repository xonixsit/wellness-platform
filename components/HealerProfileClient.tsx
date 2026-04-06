"use client";

import { useState } from "react";
import { Save, Loader2, DollarSign, Clock, FileText, Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

const SPECIALTY_OPTIONS = [
  "Trauma","Anxiety","Depression","Grief","Burnout","Relationships",
  "Divorce Recovery","Life Transitions","Self-Worth","Anger Management",
  "Men's Issues","Women's Issues","PTSD","Addiction","Stress Management","Identity",
];
const MODALITY_OPTIONS = [
  "CBT","EMDR","Somatic Therapy","Mindfulness","IFS","ACT","Narrative Therapy",
  "Coaching","Breathwork","Yoga Therapy","Grief Therapy","Spiritual Counseling",
  "Feminist Therapy","Expressive Arts","Meditation",
];

interface Props {
  healer: any;
  userEmail: string;
}

export default function HealerProfileClient({ healer, userEmail }: Props) {
  const supabase = createClient();
  const [title, setTitle] = useState(healer.title || "");
  const [bio, setBio] = useState(healer.bio || "");
  const [approach, setApproach] = useState(healer.approach || "");
  const [experienceYears, setExperienceYears] = useState(String(healer.experience_years || 1));
  const [sessionPrice, setSessionPrice] = useState(String(healer.session_price || 100));
  const [sessionDuration, setSessionDuration] = useState(String(healer.session_duration || 60));
  const [specialties, setSpecialties] = useState<string[]>(healer.specialties || []);
  const [modalities, setModalities] = useState<string[]>(healer.modalities || []);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const toggle = (list: string[], setList: (v: string[]) => void, item: string) =>
    setList(list.includes(item) ? list.filter((x) => x !== item) : [...list, item]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    const { error: err } = await supabase.from("healers").update({
      title, bio, approach, experience_years: parseInt(experienceYears),
      session_price: parseFloat(sessionPrice),
      session_duration: parseInt(sessionDuration),
      specialties, modalities,
    }).eq("id", healer.id);

    if (err) { setError(err.message); setSaving(false); return; }

    // Re-embed after profile update
    fetch("/api/healers/embed", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ healer_id: healer.id }),
    }).catch(() => {});

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const inputClass = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-violet-500/50 transition-colors text-sm";

  return (
    <div className="pt-24 pb-16 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-white">Edit Profile</h1>

        <form onSubmit={handleSave} className="space-y-6">
          {error && <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-red-400 text-sm">{error}</div>}

          <div className="glass rounded-2xl p-6 space-y-4">
            <h2 className="font-semibold text-white text-sm">Professional Info</h2>
            <div className="space-y-1.5">
              <label className="text-xs text-white/50">Professional Title</label>
              <div className="relative">
                <Stethoscope className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Trauma-Informed Therapist" className={`${inputClass} pl-10`} />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-white/50">Bio</label>
              <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={4} placeholder="Describe your background and who you help..." className={`${inputClass} resize-none`} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-white/50">Your Approach</label>
              <textarea value={approach} onChange={(e) => setApproach(e.target.value)} rows={3} placeholder="How do you work with clients?" className={`${inputClass} resize-none`} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-white/50">Years of Experience</label>
              <div className="relative">
                <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input type="number" value={experienceYears} onChange={(e) => setExperienceYears(e.target.value)} min="0" className={`${inputClass} pl-10`} />
              </div>
            </div>
          </div>

          <div className="glass rounded-2xl p-6 space-y-4">
            <h2 className="font-semibold text-white text-sm">Pricing & Duration</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs text-white/50">Session Price (USD)</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input type="number" value={sessionPrice} onChange={(e) => setSessionPrice(e.target.value)} min="10" className={`${inputClass} pl-10`} />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-white/50">Duration (minutes)</label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <select value={sessionDuration} onChange={(e) => setSessionDuration(e.target.value)} className={`${inputClass} pl-10 appearance-none`}>
                    <option value="30">30 min</option>
                    <option value="45">45 min</option>
                    <option value="60">60 min</option>
                    <option value="90">90 min</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="glass rounded-2xl p-6 space-y-4">
            <h2 className="font-semibold text-white text-sm">Specialties</h2>
            <div className="flex flex-wrap gap-2">
              {SPECIALTY_OPTIONS.map((s) => (
                <button key={s} type="button" onClick={() => toggle(specialties, setSpecialties, s)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-all ${specialties.includes(s) ? "bg-violet-600 border-violet-500 text-white" : "bg-white/5 border-white/10 text-white/50 hover:border-violet-500/40"}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="glass rounded-2xl p-6 space-y-4">
            <h2 className="font-semibold text-white text-sm">Modalities</h2>
            <div className="flex flex-wrap gap-2">
              {MODALITY_OPTIONS.map((m) => (
                <button key={m} type="button" onClick={() => toggle(modalities, setModalities, m)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-all ${modalities.includes(m) ? "bg-indigo-600 border-indigo-500 text-white" : "bg-white/5 border-white/10 text-white/50 hover:border-indigo-500/40"}`}>
                  {m}
                </button>
              ))}
            </div>
          </div>

          <Button type="submit" variant="gradient" size="lg" className="w-full gap-2" disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? "Saved ✓" : <><Save className="w-4 h-4" /> Save Changes</>}
          </Button>
        </form>
      </div>
    </div>
  );
}
