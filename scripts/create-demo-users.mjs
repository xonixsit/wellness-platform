import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
config({ path: ".env.local" });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const DEMO_USERS = [
  {
    email: "demo@healio.app",
    password: "Demo1234!",
    full_name: "Alex Demo",
    plan: "free",
  },
  {
    email: "seeker@healio.app",
    password: "Demo1234!",
    full_name: "Jordan Seeker",
    plan: "seeker",
  },
  {
    email: "pro@healio.app",
    password: "Demo1234!",
    full_name: "Sam Pro",
    plan: "pro",
  },
];

async function createDemoUsers() {
  console.log("Creating demo users...\n");

  for (const u of DEMO_USERS) {
    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: u.email,
      password: u.password,
      email_confirm: true,
      user_metadata: { full_name: u.full_name },
    });

    if (authError) {
      if (authError.message.includes("already been registered")) {
        console.log(`⚠️  ${u.email} already exists, updating plan...`);
        // Find existing user
        const { data: list } = await supabase.auth.admin.listUsers();
        const existing = list?.users?.find((x) => x.email === u.email);
        if (existing) {
          await supabase.from("subscriptions").update({ plan_id: u.plan }).eq("user_id", existing.id);
          console.log(`   ✓ Plan set to "${u.plan}"\n`);
        }
        continue;
      }
      console.error(`✗ Failed to create ${u.email}:`, authError.message);
      continue;
    }

    const userId = authData.user.id;
    console.log(`✓ Created user: ${u.email} (${userId})`);

    // Profile is auto-created by trigger, but upsert to be safe
    const { error: profileError } = await supabase.from("profiles").upsert({
      id: userId,
      full_name: u.full_name,
      role: "user",
    });
    if (profileError) console.warn(`  ⚠ Profile upsert:`, profileError.message);
    else console.log(`  ✓ Profile: ${u.full_name}`);

    // Set subscription plan
    const { error: subError } = await supabase.from("subscriptions").upsert(
      { user_id: userId, plan_id: u.plan, status: "active" },
      { onConflict: "user_id" }
    );
    if (subError) {
      // Try plain insert if upsert fails (table may not have unique constraint yet)
      const { error: insertError } = await supabase.from("subscriptions").insert(
        { user_id: userId, plan_id: u.plan, status: "active" }
      );
      if (insertError) console.warn(`  ⚠ Subscription:`, insertError.message);
      else console.log(`  ✓ Plan: ${u.plan}`);
    } else console.log(`  ✓ Plan: ${u.plan}`);

    console.log();
  }

  console.log("Done!\n");
  console.log("Demo credentials:");
  console.log("─────────────────────────────────────────");
  for (const u of DEMO_USERS) {
    console.log(`  ${u.plan.padEnd(8)} │ ${u.email.padEnd(22)} │ ${u.password}`);
  }
  console.log("─────────────────────────────────────────");
}

createDemoUsers().catch(console.error);
