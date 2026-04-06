-- Subscriptions table
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  plan_id text not null default 'free' check (plan_id in ('free', 'seeker', 'pro')),
  status text not null default 'active' check (status in ('active', 'canceled', 'past_due', 'trialing', 'incomplete')),
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- AI usage tracking
create table if not exists public.ai_usage (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  date date not null default current_date,
  count integer not null default 0,
  unique(user_id, date)
);

-- Saved healers
create table if not exists public.saved_healers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  healer_id uuid references public.healers(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique(user_id, healer_id)
);

-- RLS
alter table public.subscriptions enable row level security;
alter table public.ai_usage enable row level security;
alter table public.saved_healers enable row level security;

create policy "Users can view own subscription" on public.subscriptions for select using (auth.uid() = user_id);
create policy "Service role manages subscriptions" on public.subscriptions for all using (true);

create policy "Users can view own usage" on public.ai_usage for select using (auth.uid() = user_id);
create policy "Service role manages usage" on public.ai_usage for all using (true);

create policy "Users can manage saved healers" on public.saved_healers for all using (auth.uid() = user_id);

-- Auto-create free subscription on signup
create or replace function public.handle_new_subscription()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.subscriptions (user_id, plan_id, status)
  values (new.id, 'free', 'active');
  return new;
end;
$$;

create or replace trigger on_profile_created
  after insert on public.profiles
  for each row execute procedure public.handle_new_subscription();
