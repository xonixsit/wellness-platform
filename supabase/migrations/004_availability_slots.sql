-- Healer availability slots (recurring weekly schedule)
create table if not exists public.availability_slots (
  id uuid primary key default gen_random_uuid(),
  healer_id uuid references public.healers(id) on delete cascade not null,
  day_of_week integer not null check (day_of_week between 0 and 6), -- 0=Sun, 6=Sat
  start_time time not null,   -- e.g. 09:00
  end_time time not null,     -- e.g. 17:00
  unique(healer_id, day_of_week, start_time)
);

-- Booked time slots (blocks availability)
create table if not exists public.booked_slots (
  id uuid primary key default gen_random_uuid(),
  healer_id uuid references public.healers(id) on delete cascade not null,
  session_id uuid references public.sessions(id) on delete cascade,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  unique(healer_id, starts_at)
);

-- Add scheduled time to sessions table
alter table public.sessions
  add column if not exists scheduled_at timestamptz,
  add column if not exists user_email text,
  add column if not exists healer_email text,
  add column if not exists user_name text,
  add column if not exists healer_name text;

-- RLS
alter table public.availability_slots enable row level security;
alter table public.booked_slots enable row level security;

create policy "Availability is public" on public.availability_slots for select using (true);
create policy "Healers manage own slots" on public.availability_slots for all using (
  auth.uid() = (select user_id from public.healers where id = healer_id)
);

create policy "Booked slots are public read" on public.booked_slots for select using (true);
create policy "Service role manages booked slots" on public.booked_slots for all using (true);

-- Seed default availability for existing healers (Mon-Fri 9am-5pm)
insert into public.availability_slots (healer_id, day_of_week, start_time, end_time)
select id, d, '09:00'::time, '17:00'::time
from public.healers, unnest(ARRAY[1,2,3,4,5]) as d
on conflict do nothing;
