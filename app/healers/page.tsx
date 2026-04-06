import { createClient } from "@/lib/supabase/server";
import Navbar from "@/components/Navbar";
import HealersBrowser from "@/components/HealersBrowser";

export default async function HealersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let profile = null;
  if (user) {
    const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
    profile = data;
  }

  const { data: healers } = await supabase
    .from("healers")
    .select("*")
    .eq("is_active", true)
    .order("rating", { ascending: false });

  return (
    <div className="min-h-screen">
      <Navbar user={profile ? { email: user?.email, full_name: profile.full_name } : null} />
      <HealersBrowser initialHealers={healers || []} />
    </div>
  );
}
