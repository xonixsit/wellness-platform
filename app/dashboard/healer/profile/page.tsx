import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Navbar from "@/components/Navbar";
import HealerProfileClient from "@/components/HealerProfileClient";

export default async function HealerProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  if (profile?.role !== "healer") redirect("/dashboard");

  const { data: healer } = await supabase.from("healers").select("*").eq("user_id", user.id).single();
  if (!healer) redirect("/dashboard");

  return (
    <div className="min-h-screen">
      <Navbar user={{ email: user.email, full_name: profile?.full_name, role: "healer" }} />
      <HealerProfileClient healer={healer} userEmail={user.email || ""} />
    </div>
  );
}
