import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Navbar from "@/components/Navbar";
import HealerDashboardClient from "@/components/HealerDashboardClient";

export default async function HealerDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();

  // Non-healers get bounced
  if (profile?.role !== "healer") redirect("/dashboard");

  const { data: healer } = await supabase
    .from("healers")
    .select("id, name, title, stripe_account_id, stripe_onboarding_complete, session_price, session_duration, rating, review_count, is_verified, specialties")
    .eq("user_id", user.id)
    .single();

  if (!healer) redirect("/dashboard/healer/setup");

  const { data: sessions } = await supabase
    .from("sessions")
    .select("id, amount_total, platform_fee, healer_payout, status, created_at")
    .eq("healer_id", healer.id)
    .order("created_at", { ascending: false })
    .limit(20);

  const totalEarned = (sessions || [])
    .filter((s) => s.status === "paid")
    .reduce((sum, s) => sum + s.healer_payout, 0);

  return (
    <div className="min-h-screen">
      <Navbar user={{ email: user.email, full_name: profile?.full_name, role: "healer" }} />
      <HealerDashboardClient
        healer={healer}
        sessions={sessions || []}
        totalEarnedCents={totalEarned}
      />
    </div>
  );
}
