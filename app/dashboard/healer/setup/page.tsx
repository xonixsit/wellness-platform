import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";

export default async function HealerSetupPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // If they already have a healer row, send them to dashboard
  const { data: healer } = await supabase.from("healers").select("id").eq("user_id", user.id).single();
  if (healer) redirect("/dashboard/healer");

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center glass-strong rounded-2xl p-10">
        <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-violet-500 to-indigo-600 flex items-center justify-center mx-auto mb-6">
          <Sparkles className="w-7 h-7 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-3">Complete your healer profile</h1>
        <p className="text-white/50 text-sm mb-8">
          Your account is set up as a healer but your profile isn't complete yet. Fill it in to start appearing in search results and accepting bookings.
        </p>
        <Link
          href="/signup/healer"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-medium transition-colors text-sm"
        >
          Complete Profile <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
