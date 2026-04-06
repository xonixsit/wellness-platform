"use client";

import { useState } from "react";
import { User, Mail, Shield, Save, Loader2, CheckCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

interface ProfileClientProps {
  user: {
    id: string;
    email: string;
    full_name?: string;
    avatar_url?: string;
    role?: string;
    created_at?: string;
  };
}

export default function ProfileClient({ user }: ProfileClientProps) {
  const supabase = createClient();
  const [fullName, setFullName] = useState(user.full_name || "");
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: fullName })
      .eq("id", user.id);
    setLoading(false);
    if (error) { setError(error.message); return; }
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const initials = (user.full_name || user.email).slice(0, 2).toUpperCase();
  const joinDate = user.created_at ? new Date(user.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" }) : "";

  return (
    <div className="pt-24 pb-16 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-white">Your Profile</h1>

        {/* Avatar card */}
        <div className="glass rounded-2xl p-6 flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-violet-500/30 to-indigo-600/30 border border-violet-500/20 flex items-center justify-center text-xl font-bold text-violet-300">
            {initials}
          </div>
          <div>
            <p className="font-semibold text-white">{user.full_name || "Anonymous"}</p>
            <p className="text-sm text-white/40">{user.email}</p>
            {joinDate && <p className="text-xs text-white/30 mt-1">Member since {joinDate}</p>}
          </div>
          <div className="ml-auto">
            <span className="text-xs px-3 py-1.5 rounded-full bg-violet-500/20 border border-violet-500/30 text-violet-300 capitalize">
              {user.role || "user"}
            </span>
          </div>
        </div>

        {/* Edit form */}
        <div className="glass rounded-2xl p-6">
          <h2 className="font-semibold text-white mb-5">Personal Information</h2>
          <form onSubmit={handleSave} className="space-y-4">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-red-400 text-sm">{error}</div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs text-white/50 font-medium">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your full name"
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-violet-500/50 transition-colors text-sm"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-white/50 font-medium">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  type="email"
                  value={user.email}
                  disabled
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white/40 text-sm cursor-not-allowed"
                />
              </div>
              <p className="text-xs text-white/30">Email cannot be changed here</p>
            </div>

            <Button type="submit" variant="gradient" disabled={loading} className="gap-2">
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : saved ? (
                <><CheckCircle className="w-4 h-4" /> Saved</>
              ) : (
                <><Save className="w-4 h-4" /> Save Changes</>
              )}
            </Button>
          </form>
        </div>

        {/* Security */}
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-4 h-4 text-violet-400" />
            <h2 className="font-semibold text-white">Security</h2>
          </div>
          <p className="text-sm text-white/40 mb-4">Your account is secured with Supabase Auth. Password changes are handled via email.</p>
          <Button variant="outline" size="sm" onClick={async () => {
            const supabase = createClient();
            await supabase.auth.resetPasswordForEmail(user.email);
            alert("Password reset email sent!");
          }}>
            Send Password Reset Email
          </Button>
        </div>
      </div>
    </div>
  );
}
