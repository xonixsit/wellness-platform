import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdmin } from "@supabase/supabase-js";

const supabaseAdmin = createAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) return NextResponse.redirect(`${origin}/login?error=missing_code`);

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) return NextResponse.redirect(`${origin}/login?error=confirmation_failed`);

  // Now we have a valid session — get the user with their metadata
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(`${origin}/login`);

  const meta = user.user_metadata;

  // Only create healer profile if pending_healer flag is set
  if (meta?.pending_healer) {
    // Update profile role
    await supabaseAdmin.from("profiles").update({ role: "healer" }).eq("id", user.id);

    // Check if healer profile already exists (avoid duplicates on re-confirmation)
    const { data: existing } = await supabaseAdmin
      .from("healers")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!existing) {
      const { data: healer } = await supabaseAdmin.from("healers").insert({
        user_id: user.id,
        name: meta.full_name,
        title: meta.healer_title,
        bio: meta.healer_bio,
        approach: meta.healer_approach,
        experience_years: meta.healer_experience_years,
        specialties: meta.healer_specialties,
        modalities: meta.healer_modalities,
        session_price: meta.healer_session_price,
        session_duration: meta.healer_session_duration,
        languages: ["English"],
        feedback_themes: [],
        is_active: true,
        is_verified: false,
      }).select("id").single();

      // Trigger embedding in background
      if (healer?.id) {
        fetch(`${origin}/api/healers/embed`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ healer_id: healer.id }),
        }).catch(() => {});
      }
    }

    // Clear the pending flag from metadata
    await supabaseAdmin.auth.admin.updateUserById(user.id, {
      user_metadata: { ...meta, pending_healer: false },
    });

    return NextResponse.redirect(`${origin}/dashboard/healer?welcome=true`);
  }

  return NextResponse.redirect(`${origin}/dashboard`);
}
