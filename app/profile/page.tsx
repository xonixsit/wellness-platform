import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Navbar from "@/components/Navbar";
import ProfileClient from "@/components/ProfileClient";

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();

  return (
    <div className="min-h-screen">
      <Navbar user={{ email: user.email, full_name: profile?.full_name }} />
      <ProfileClient user={{ id: user.id, email: user.email || "", ...profile }} />
    </div>
  );
}
