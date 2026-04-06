import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe";
import { createClient as createAdmin } from "@supabase/supabase-js";

const supabaseAdmin = createAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Verify user has a healer profile
  const { data: healer } = await supabaseAdmin
    .from("healers")
    .select("id, stripe_account_id, name")
    .eq("user_id", user.id)
    .single();

  if (!healer) return NextResponse.json({ error: "No healer profile found" }, { status: 404 });

  // Create Connect account if doesn't exist
  let accountId = healer.stripe_account_id;
  if (!accountId) {
    const account = await stripe.accounts.create({
      type: "express",
      email: user.email!,
      capabilities: { transfers: { requested: true } },
      business_type: "individual",
      business_profile: { name: healer.name },
      metadata: { healer_id: healer.id, user_id: user.id },
    });
    accountId = account.id;
    await supabaseAdmin.from("healers").update({ stripe_account_id: accountId }).eq("id", healer.id);
  }

  const origin = request.headers.get("origin") || "http://localhost:3000";
  const accountLink = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: `${origin}/dashboard/healer?connect=refresh`,
    return_url: `${origin}/dashboard/healer?connect=success`,
    type: "account_onboarding",
  });

  return NextResponse.json({ url: accountLink.url });
}
