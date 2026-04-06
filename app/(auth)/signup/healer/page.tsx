"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Sparkles, Mail, Lock, User, Loader2, Eye, EyeOff,
  Stethoscope, DollarSign, Clock, ChevronRight, Check, FileText
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

const SPECIALTY_OPTIONS = [
  "Trauma", "Anxiety", "Depression", "Grief", "Burnout",
  "Relationships", "Divorce Recovery", "Life Transitions",
  "Self-Worth", "Anger Management", "Men's Issues", "Women's Issues",
  "PTSD", "Addiction", "Stress Management", "Identity",
];

const MODALITY_OPTIONS = [
  "CBT", "EMDR", "Somatic Therapy", "Mindfulness", "IFS",
  "ACT", "Narrative Therapy", "Coaching", "Breathwork",
  "Yoga Therapy", "Grief Therapy", "Spiritual Counseling",
  "Feminist Therapy", "Expressive Arts", "Meditation",
];

const STEPS = ["Account", "Profile", "Specialties & Pricing"];

type Step = 1 | 2 | 3 | "confirmed";

export default function HealerSignupPage() {
  const router = useRouter();
  const supabase = createClient();
  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Step 1
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);

  // Step 2
  const [title, setTitle] = useState("");
  const [bio, setBio] = useState("");
  const [approach, setApproach] = useState("");
  const [experienceYears, setExperienceYears] = useState("1");

  // Step 3
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [modalities, setModalities] = useState<string[]>([]);
  const [sessionPrice, setSessionPrice] = useState("100");
  const [sessionDuration, setSessionDuration] = useState("60");

  const toggleItem = (list: string[], setList: (v: string[]) => void, item: string) => {
    setList(list.includes(item) ? list.filter((x) => x !== item) : [...list, item]);
  };

  const handleStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !password) return;
    setStep(2);
  };

  const handleStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !bio) return;
    setStep(3);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (specialties.length === 0) { setError("Select at least one specialty"); return; }
    setLoading(true);
    setError("");

    // Store healer profile data in user_metadata so it survives email confirmation
    const healerData = {
      full_name: fullName,
      pending_healer: true,
      healer_title: title,
      healer_bio: bio,
      healer_approach: approach || bio,
      healer_experience_years: parseInt(experienceYears),
      healer_specialties: specialties,
      healer_modalities: modalities,
      healer_session_price: parseFloat(sessionPrice),
      healer_session_duration: parseInt(sessionDuration),
    };

    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: healerData,
        emailRedirectTo: `${window.location.origin}/api/auth/confirm-healer`,
      },
    });

    if (authError) { setError(authError.message); setLoading(false); return; }

    // If user is immediately confirmed (email confirmation disabled),
    // create the healer profile right away
    const { data: { session } } = await supabase.auth.getSession();

    if (session) {
      // Session exists — email confirmation is off, create profile now
      const res = await fetch("/api/healers/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fullName,
          title,
          bio,
          approach: approach || bio,
          experience_years: parseInt(experienceYears),
          specialties,
          modalities,
          session_price: parseFloat(sessionPrice),
          session_duration: parseInt(sessionDuration),
        }),
      });
      const result = await res.json();
      if (!res.ok) { setError(result.error || "Failed to create profile"); setLoading(false); return; }
      router.push("/dashboard/healer?welcome=true");
      router.refresh();
    } else {
      // No session yet — email confirmation required, show check-email screen
      setStep("confirmed" as any);
      setLoading(false);
    }
  };

  const inputClass = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-violet-500/50 transition-colors text-sm";

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 right-1/3 w-96 h-96 bg-violet-600/15 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 left-1/3 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-lg">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold gradient-text">Healio</span>
          </Link>
          <h1 className="text-2xl font-bold text-white mt-6 mb-1">Join as a Healer</h1>
          <p className="text-white/40 text-sm">Start accepting clients in minutes</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {STEPS.map((label, i) => {
            const n = (i + 1) as Step;
            const done = step > n;
            const active = step === n;
            return (
              <div key={label} className="flex items-center gap-2">
                <div className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${active ? "text-violet-400" : done ? "text-green-400" : "text-white/20"}`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs border transition-colors ${active ? "border-violet-500 bg-violet-500/20 text-violet-400" : done ? "border-green-500 bg-green-500/20 text-green-400" : "border-white/10 text-white/20"}`}>
                    {done ? <Check className="w-3 h-3" /> : n}
                  </div>
                  <span className="hidden sm:inline">{label}</span>
                </div>
                {i < STEPS.length - 1 && <div className={`w-8 h-px ${step > n ? "bg-green-500/40" : "bg-white/10"}`} />}
              </div>
            );
          })}
        </div>

        <div className="glass-strong rounded-2xl p-8">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-red-400 text-sm mb-4">{error}</div>
          )}

          {/* Step 1: Account */}
          {step === 1 && (
            <form onSubmit={handleStep1} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs text-white/50 font-medium">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required placeholder="Dr. Jane Smith" className={`${inputClass} pl-10`} />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-white/50 font-medium">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@example.com" className={`${inputClass} pl-10`} />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-white/50 font-medium">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input type={showPw ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} placeholder="Min. 6 characters" className={`${inputClass} pl-10 pr-10`} />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <Button type="submit" variant="gradient" size="lg" className="w-full gap-2 mt-2">
                Continue <ChevronRight className="w-4 h-4" />
              </Button>
            </form>
          )}

          {/* Step 2: Profile */}
          {step === 2 && (
            <form onSubmit={handleStep2} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs text-white/50 font-medium">Professional Title</label>
                <div className="relative">
                  <Stethoscope className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="e.g. Trauma-Informed Therapist" className={`${inputClass} pl-10`} />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-white/50 font-medium">Bio <span className="text-white/20">(shown to clients)</span></label>
                <textarea value={bio} onChange={(e) => setBio(e.target.value)} required rows={4} placeholder="Describe your background, who you help, and what makes your approach unique..." className={`${inputClass} resize-none`} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-white/50 font-medium">Your Approach <span className="text-white/20">(optional)</span></label>
                <textarea value={approach} onChange={(e) => setApproach(e.target.value)} rows={3} placeholder="How do you work with clients? What's your philosophy?" className={`${inputClass} resize-none`} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-white/50 font-medium">Years of Experience</label>
                <div className="relative">
                  <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input type="number" value={experienceYears} onChange={(e) => setExperienceYears(e.target.value)} min="0" max="50" className={`${inputClass} pl-10`} />
                </div>
              </div>
              <div className="flex gap-3">
                <Button type="button" variant="outline" size="lg" className="flex-1" onClick={() => setStep(1)}>Back</Button>
                <Button type="submit" variant="gradient" size="lg" className="flex-1 gap-2">
                  Continue <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </form>
          )}

          {/* Step 3: Specialties & Pricing */}
          {step === 3 && (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs text-white/50 font-medium">Specialties <span className="text-white/20">(select all that apply)</span></label>
                <div className="flex flex-wrap gap-2">
                  {SPECIALTY_OPTIONS.map((s) => (
                    <button key={s} type="button" onClick={() => toggleItem(specialties, setSpecialties, s)}
                      className={`text-xs px-3 py-1.5 rounded-full border transition-all ${specialties.includes(s) ? "bg-violet-600 border-violet-500 text-white" : "bg-white/5 border-white/10 text-white/50 hover:border-violet-500/40"}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs text-white/50 font-medium">Modalities <span className="text-white/20">(optional)</span></label>
                <div className="flex flex-wrap gap-2">
                  {MODALITY_OPTIONS.map((m) => (
                    <button key={m} type="button" onClick={() => toggleItem(modalities, setModalities, m)}
                      className={`text-xs px-3 py-1.5 rounded-full border transition-all ${modalities.includes(m) ? "bg-indigo-600 border-indigo-500 text-white" : "bg-white/5 border-white/10 text-white/50 hover:border-indigo-500/40"}`}>
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-white/50 font-medium">Session Price (USD)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <input type="number" value={sessionPrice} onChange={(e) => setSessionPrice(e.target.value)} min="10" max="1000" className={`${inputClass} pl-10`} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-white/50 font-medium">Duration (minutes)</label>
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

              <div className="bg-violet-500/10 border border-violet-500/20 rounded-xl p-3 text-xs text-violet-300">
                Healio takes a 20% platform fee per session. You keep 80% — paid directly to your bank via Stripe (set up after signup).
              </div>

              <div className="flex gap-3">
                <Button type="button" variant="outline" size="lg" className="flex-1" onClick={() => setStep(2)}>Back</Button>
                <Button type="submit" variant="gradient" size="lg" className="flex-1 gap-2" disabled={loading}>
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Create Profile <Check className="w-4 h-4" /></>}
                </Button>
              </div>
            </form>
          )}

          {/* Confirmed — check email */}
          {step === ("confirmed" as any) && (
            <div className="text-center py-4 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-violet-500/20 flex items-center justify-center mx-auto">
                <Mail className="w-8 h-8 text-violet-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white text-lg mb-2">Check your email</h3>
                <p className="text-white/50 text-sm leading-relaxed">
                  We sent a confirmation link to <span className="text-white">{email}</span>.
                  Click it to activate your healer account — your profile will be created automatically.
                </p>
              </div>
              <p className="text-xs text-white/30">Didn't get it? Check your spam folder.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

