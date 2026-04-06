import { NextResponse } from "next/server";
import { createClient as createAdmin } from "@supabase/supabase-js";

const supabaseAdmin = createAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Returns available 1-hour slots for the next 14 days for a healer
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const healerId = searchParams.get("healerId");
  const duration = parseInt(searchParams.get("duration") || "60"); // minutes

  if (!healerId) return NextResponse.json({ error: "healerId required" }, { status: 400 });

  const [{ data: slots }, { data: booked }] = await Promise.all([
    supabaseAdmin
      .from("availability_slots")
      .select("day_of_week, start_time, end_time")
      .eq("healer_id", healerId),
    supabaseAdmin
      .from("booked_slots")
      .select("starts_at, ends_at")
      .eq("healer_id", healerId)
      .gte("starts_at", new Date().toISOString()),
  ]);

  if (!slots?.length) return NextResponse.json({ available: [] });

  const bookedSet = new Set(
    (booked || []).map((b) => new Date(b.starts_at).toISOString())
  );

  const available: string[] = [];
  const now = new Date();
  // Round up to next hour
  now.setMinutes(0, 0, 0);
  now.setHours(now.getHours() + 1);

  for (let dayOffset = 0; dayOffset < 14; dayOffset++) {
    const date = new Date(now);
    date.setDate(date.getDate() + dayOffset);
    const dow = date.getDay(); // 0=Sun

    const daySlots = slots.filter((s) => s.day_of_week === dow);
    for (const slot of daySlots) {
      const [startH, startM] = slot.start_time.split(":").map(Number);
      const [endH, endM] = slot.end_time.split(":").map(Number);

      const slotStart = new Date(date);
      slotStart.setHours(startH, startM, 0, 0);
      const slotEnd = new Date(date);
      slotEnd.setHours(endH, endM, 0, 0);

      // Generate time slots within the availability window
      const cursor = new Date(slotStart);
      while (cursor.getTime() + duration * 60000 <= slotEnd.getTime()) {
        if (cursor > now && !bookedSet.has(cursor.toISOString())) {
          available.push(cursor.toISOString());
        }
        cursor.setMinutes(cursor.getMinutes() + duration);
      }
    }
  }

  return NextResponse.json({ available });
}
