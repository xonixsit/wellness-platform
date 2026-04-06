import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Navbar from "@/components/Navbar";
import HealerAvailabilityClient from "@/components/HealerAvailabilityClient";

export default async function HealerAvailabilityPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  if (profile?.role !== "healer") redirect("/dashboard");

  const { data: healer } = await supabase.from("healers").select("id").eq("user_id", user.id).single();
  if (!healer) redirect("/dashboard");

  const { data: slots } = await supabase
    .from("availability_slots")
    .select("*")
    .eq("healer_id", healer.id)
    .order("day_of_week");

  return (
    <div className="min-h-screen">
      <Navbar user={{ email: user.email, full_name: profile?.full_name, role: "healer" }} />
      <HealerAvailabilityClient healerId={healer.id} initialSlots={slots || []} />
    </div>
  );
}
