-- Add Stripe Connect fields to healers table
alter table public.healers
  add column if not exists stripe_account_id text unique,
  add column if not exists stripe_onboarding_complete boolean not null default false,
  add column if not exists payout_email text;

-- Sessions / bookings table
create table if not exists public.sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  healer_id uuid references public.healers(id) on delete set null,
  stripe_payment_intent_id text unique,
  stripe_checkout_session_id text unique,
  amount_total integer not null,        -- in cents
  platform_fee integer not null,        -- in cents (20%)
  healer_payout integer not null,       -- in cents (80%)
  currency text not null default 'usd',
  status text not null default 'pending' check (status in ('pending','paid','refunded','disputed')),
  session_duration integer,
  created_at timestamptz default now()
);

alter table public.sessions enable row level security;
create policy "Users can view own sessions" on public.sessions for select using (auth.uid() = user_id);
create policy "Service role manages sessions" on public.sessions for all using (true);
