import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { stripe, PLATFORM_FEE_PERCENT } from "@/lib/stripe";
import { createClient as createAdmin } from "@supabase/supabase-js";

const supabaseAdmin = createAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { healerId, healerName, sessionPrice, sessionDuration, scheduledAt } = await request.json();
  if (!healerId || !sessionPrice || !scheduledAt) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  // Verify slot is still available
  const scheduledDate = new Date(scheduledAt);
  const { data: conflict } = await supabaseAdmin
    .from("booked_slots")
    .select("id")
    .eq("healer_id", healerId)
    .eq("starts_at", scheduledDate.toISOString())
    .single();

  if (conflict) {
    return NextResponse.json({ error: "This slot was just booked. Please choose another time." }, { status: 409 });
  }

  // Get healer's connected Stripe account
  const { data: healer } = await supabaseAdmin
    .from("healers")
    .select("stripe_account_id, stripe_onboarding_complete")
    .eq("id", healerId)
    .single();

  if (!healer?.stripe_account_id || !healer.stripe_onboarding_complete) {
    return NextResponse.json(
      { error: "This healer hasn't set up payouts yet. Please try another healer." },
      { status: 400 }
    );
  }

  // Get or create Stripe customer
  const { data: sub } = await supabaseAdmin
    .from("subscriptions")
    .select("stripe_customer_id, plan_id")
    .eq("user_id", user.id)
    .single();

  let customerId = sub?.stripe_customer_id;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email!,
      metadata: { supabase_user_id: user.id },
    });
    customerId = customer.id;
    await supabaseAdmin.from("subscriptions").update({ stripe_customer_id: customerId }).eq("user_id", user.id);
  }

  const isPro = sub?.plan_id === "pro";
  const totalCents = isPro ? Math.round(sessionPrice * 0.9 * 100) : Math.round(sessionPrice * 100);
  const platformFeeCents = Math.round(totalCents * (PLATFORM_FEE_PERCENT / 100));
  const healerPayoutCents = totalCents - platformFeeCents;

  // Get user profile for email
  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single();

  const origin = request.headers.get("origin") || "http://localhost:3000";
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "usd",
          unit_amount: totalCents,
          product_data: {
            name: `Session with ${healerName}`,
            description: `${sessionDuration}-min session on ${scheduledDate.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })} at ${scheduledDate.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}${isPro ? " (10% Pro discount)" : ""}`,
          },
        },
        quantity: 1,
      },
    ],
    payment_intent_data: {
      application_fee_amount: platformFeeCents,
      transfer_data: { destination: healer.stripe_account_id },
    },
    success_url: `${origin}/dashboard?booked=true&healer=${encodeURIComponent(healerName)}`,
    cancel_url: `${origin}/healers`,
    metadata: {
      user_id: user.id,
      healer_id: healerId,
      healer_name: healerName,
      user_email: user.email!,
      user_name: profile?.full_name || user.email!,
      type: "session",
      scheduled_at: scheduledDate.toISOString(),
      session_duration: sessionDuration.toString(),
      platform_fee_cents: platformFeeCents.toString(),
      healer_payout_cents: healerPayoutCents.toString(),
    },
  });

  return NextResponse.json({ url: session.url });
}
