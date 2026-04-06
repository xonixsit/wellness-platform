import { createClient } from "@/lib/supabase/server";
import Navbar from "@/components/Navbar";
import PricingClient from "@/components/PricingClient";

export default async function PricingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let profile = null;
  let subscription = null;

  if (user) {
    const [{ data: p }, { data: s }] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).single(),
      supabase.from("subscriptions").select("*").eq("user_id", user.id).single(),
    ]);
    profile = p;
    subscription = s;
  }

  return (
    <div className="min-h-screen">
      <Navbar user={profile ? { email: user?.email, full_name: profile.full_name } : null} />
      <PricingClient
        user={user ? { id: user.id, email: user.email || "" } : null}
        currentPlan={subscription?.plan_id || "free"}
      />
    </div>
  );
}
