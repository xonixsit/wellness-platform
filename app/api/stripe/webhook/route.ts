import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createClient } from "@supabase/supabase-js";
import { generateICS } from "@/lib/calendar";
import { sendSessionConfirmationEmail } from "@/lib/email";
import type Stripe from "stripe";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature")!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const getPlanFromPriceId = (priceId: string) => {
    if (priceId === process.env.STRIPE_SEEKER_PRICE_ID) return "seeker";
    if (priceId === process.env.STRIPE_PRO_PRICE_ID) return "pro";
    return "free";
  };

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const {
        user_id, plan_id, healer_id, type,
        platform_fee_cents, healer_payout_cents,
        scheduled_at, session_duration,
        user_email, user_name, healer_name,
      } = session.metadata || {};

      if (type === "session" && user_id && healer_id && scheduled_at) {
        const scheduledDate = new Date(scheduled_at);
        const duration = parseInt(session_duration || "60");
        const endsAt = new Date(scheduledDate.getTime() + duration * 60000);

        // Get healer email
        const { data: healerRow } = await supabaseAdmin
          .from("healers")
          .select("payout_email, user_id")
          .eq("id", healer_id)
          .single();

        let healerEmail = healerRow?.payout_email;
        if (!healerEmail && healerRow?.user_id) {
          const { data: healerUser } = await supabaseAdmin.auth.admin.getUserById(healerRow.user_id);
          healerEmail = healerUser?.user?.email;
        }

        // Record session
        const { data: newSession } = await supabaseAdmin.from("sessions").insert({
          user_id,
          healer_id,
          stripe_checkout_session_id: session.id,
          stripe_payment_intent_id: session.payment_intent as string,
          amount_total: session.amount_total ?? 0,
          platform_fee: parseInt(platform_fee_cents ?? "0"),
          healer_payout: parseInt(healer_payout_cents ?? "0"),
          currency: session.currency ?? "usd",
          status: "paid",
          scheduled_at: scheduledDate.toISOString(),
          session_duration: duration,
          user_email,
          user_name,
          healer_name,
          healer_email: healerEmail,
        }).select("id").single();

        // Block the slot
        await supabaseAdmin.from("booked_slots").insert({
          healer_id,
          session_id: newSession?.id,
          starts_at: scheduledDate.toISOString(),
          ends_at: endsAt.toISOString(),
        });

        // Send ICS emails if we have addresses
        if (user_email && healerEmail && healer_name && user_name) {
          const icsContent = generateICS({
            summary: `Healing Session: ${user_name} & ${healer_name}`,
            description: `Your ${duration}-minute wellness session on Healio.\n\nA session link will be shared 30 minutes before your session.`,
            startAt: scheduledDate,
            endAt: endsAt,
            organizerName: healer_name,
            organizerEmail: healerEmail,
            attendeeEmail: user_email,
            attendeeName: user_name,
          });

          await Promise.allSettled([
            sendSessionConfirmationEmail({
              toEmail: user_email,
              toName: user_name,
              healerName: healer_name,
              healerEmail,
              scheduledAt: scheduledDate,
              durationMinutes: duration,
              icsContent,
              isHealer: false,
            }),
            sendSessionConfirmationEmail({
              toEmail: healerEmail,
              toName: healer_name,
              healerName: healer_name,
              healerEmail,
              scheduledAt: scheduledDate,
              durationMinutes: duration,
              icsContent,
              isHealer: true,
            }),
          ]);
        }

      } else if (plan_id && user_id) {
        await supabaseAdmin.from("subscriptions").update({
          stripe_customer_id: session.customer as string,
          stripe_subscription_id: session.subscription as string,
          plan_id,
          status: "active",
          updated_at: new Date().toISOString(),
        }).eq("user_id", user_id);
      }
      break;
    }

    case "customer.subscription.updated": {
      const sub = event.data.object as Stripe.Subscription;
      const userId = sub.metadata?.user_id;
      if (!userId) break;
      const planId = getPlanFromPriceId(sub.items.data[0]?.price.id);
      await supabaseAdmin.from("subscriptions").update({
        plan_id: planId,
        status: sub.status,
        current_period_end: new Date((sub as any).current_period_end * 1000).toISOString(),
        cancel_at_period_end: sub.cancel_at_period_end,
        updated_at: new Date().toISOString(),
      }).eq("stripe_subscription_id", sub.id);
      break;
    }

    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      await supabaseAdmin.from("subscriptions").update({
        plan_id: "free",
        status: "canceled",
        stripe_subscription_id: null,
        updated_at: new Date().toISOString(),
      }).eq("stripe_subscription_id", sub.id);
      break;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      const subId = (invoice as any).subscription;
      if (subId) {
        await supabaseAdmin.from("subscriptions").update({
          status: "past_due",
          updated_at: new Date().toISOString(),
        }).eq("stripe_subscription_id", subId);
      }
      break;
    }

    case "charge.refunded": {
      const charge = event.data.object as Stripe.Charge;
      if (charge.payment_intent) {
        await supabaseAdmin.from("sessions").update({ status: "refunded" })
          .eq("stripe_payment_intent_id", charge.payment_intent as string);
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
