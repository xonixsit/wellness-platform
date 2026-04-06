import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { stripe, PLANS, getServerPlans, type PlanId } from "@/lib/stripe";
import { createClient as createAdmin } from "@supabase/supabase-js";

const supabaseAdmin = createAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { planId } = await request.json() as { planId: PlanId };
  const plan = PLANS[planId];
  if (!plan || plan.price === 0) return NextResponse.json({ error: "Invalid plan" }, { status: 400 });

  const serverPlans = getServerPlans();
  const priceId = (serverPlans as any)[planId]?.priceId;
  if (!priceId) return NextResponse.json({ error: "Plan not configured" }, { status: 400 });

  // Get or create Stripe customer
  const { data: sub } = await supabaseAdmin
    .from("subscriptions")
    .select("stripe_customer_id")
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

  const origin = request.headers.get("origin") || "http://localhost:3000";
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${origin}/dashboard?upgraded=true`,
    cancel_url: `${origin}/pricing`,
    metadata: { user_id: user.id, plan_id: planId },
    subscription_data: { metadata: { user_id: user.id, plan_id: planId } },
  });

  return NextResponse.json({ url: session.url });
}
