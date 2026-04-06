"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkles, Mail, Lock, User, Loader2, Eye, EyeOff, Heart, Stethoscope } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

export default function SignupPage() {
  const router = useRouter();
  const supabase = createClient();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    if (error) { setError(error.message); setLoading(false); return; }
    router.push("/dashboard");
    router.refresh();
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 right-1/3 w-96 h-96 bg-violet-600/15 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 left-1/3 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold gradient-text">Healio</span>
          </Link>
          <h1 className="text-2xl font-bold text-white mt-6 mb-1">Create your account</h1>
          <p className="text-white/40 text-sm">Join as a seeker or a healer</p>
        </div>

        {/* Role picker */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="glass rounded-xl p-4 border border-violet-500/30 text-center">
            <Heart className="w-6 h-6 text-violet-400 mx-auto mb-2" />
            <p className="text-sm font-medium text-white">I'm seeking support</p>
            <p className="text-xs text-white/40 mt-1">Find the right healer for you</p>
          </div>
          <Link href="/signup/healer" className="glass rounded-xl p-4 border border-white/10 hover:border-violet-500/30 text-center transition-all group">
            <Stethoscope className="w-6 h-6 text-white/40 group-hover:text-violet-400 mx-auto mb-2 transition-colors" />
            <p className="text-sm font-medium text-white/60 group-hover:text-white transition-colors">I'm a healer</p>
            <p className="text-xs text-white/30 mt-1">List your practice</p>
          </Link>
        </div>

        <div className="glass-strong rounded-2xl p-8">
          <form onSubmit={handleSignup} className="space-y-4">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-red-400 text-sm">{error}</div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs text-white/50 font-medium">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required placeholder="Your name"
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-violet-500/50 transition-colors text-sm" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-white/50 font-medium">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@example.com"
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-violet-500/50 transition-colors text-sm" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-white/50 font-medium">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input type={showPw ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} placeholder="Min. 6 characters"
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-10 py-3 text-white placeholder-white/20 focus:outline-none focus:border-violet-500/50 transition-colors text-sm" />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" variant="gradient" size="lg" className="w-full mt-2" disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Account"}
            </Button>
          </form>

          <p className="text-center text-xs text-white/30 mt-4">
            By signing up you agree to our Terms of Service and Privacy Policy.
          </p>
          <p className="text-center text-sm text-white/40 mt-4">
            Already have an account?{" "}
            <Link href="/login" className="text-violet-400 hover:text-violet-300 transition-colors">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
