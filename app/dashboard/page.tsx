import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Navbar from "@/components/Navbar";
import DashboardClient from "@/components/DashboardClient";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: profile }, { data: healers }, { data: subscription }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.from("healers").select("*").eq("is_active", true).order("rating", { ascending: false }).limit(6),
    supabase.from("subscriptions").select("*").eq("user_id", user.id).single(),
  ]);

  return (
    <div className="min-h-screen">
      <Navbar user={{ email: user.email, full_name: profile?.full_name, role: profile?.role }} />
      <DashboardClient
        user={{ email: user.email || "", full_name: profile?.full_name || "" }}
        featuredHealers={healers || []}
        subscription={{ plan_id: subscription?.plan_id || "free", status: subscription?.status || "active" }}
      />
    </div>
  );
}
