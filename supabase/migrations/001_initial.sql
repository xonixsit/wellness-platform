-- Enable pgvector extension
create extension if not exists vector;

-- Profiles table (extends Supabase auth.users)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  avatar_url text,
  role text not null default 'user' check (role in ('user', 'healer', 'admin')),
  created_at timestamptz default now()
);

-- Healers table
create table if not exists public.healers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  name text not null,
  title text not null,
  bio text not null,
  avatar_url text,
  specialties text[] not null default '{}',
  modalities text[] not null default '{}',
  approach text not null default '',
  experience_years integer not null default 0,
  languages text[] not null default '{"English"}',
  feedback_themes text[] not null default '{}',
  session_price numeric(10,2) not null default 0,
  session_duration integer not null default 60,
  availability text[] not null default '{}',
  rating numeric(3,2) not null default 0,
  review_count integer not null default 0,
  is_verified boolean not null default false,
  is_active boolean not null default true,
  embedding vector(768),
  created_at timestamptz default now()
);

-- Index for fast vector similarity search
create index if not exists healers_embedding_idx
  on public.healers
  using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);

-- RLS policies
alter table public.profiles enable row level security;
alter table public.healers enable row level security;

-- Profiles: users can read all, update own
create policy "Profiles are viewable by everyone"
  on public.profiles for select using (true);

create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert with check (auth.uid() = id);

-- Healers: public read, authenticated insert/update own
create policy "Healers are viewable by everyone"
  on public.healers for select using (is_active = true);

create policy "Healers can update own profile"
  on public.healers for update using (auth.uid() = user_id);

create policy "Authenticated users can create healer profiles"
  on public.healers for insert with check (auth.uid() = user_id);

-- Service role bypass for embedding updates
create policy "Service role can update embeddings"
  on public.healers for update using (true);

-- Function: match healers by vector similarity
create or replace function match_healers(
  query_embedding vector(768),
  match_threshold float default 0.3,
  match_count int default 5
)
returns table (
  id uuid,
  name text,
  title text,
  bio text,
  avatar_url text,
  specialties text[],
  modalities text[],
  approach text,
  experience_years integer,
  languages text[],
  feedback_themes text[],
  session_price numeric,
  session_duration integer,
  availability text[],
  rating numeric,
  review_count integer,
  is_verified boolean,
  similarity float
)
language sql stable
as $$
  select
    h.id, h.name, h.title, h.bio, h.avatar_url,
    h.specialties, h.modalities, h.approach,
    h.experience_years, h.languages, h.feedback_themes,
    h.session_price, h.session_duration, h.availability,
    h.rating, h.review_count, h.is_verified,
    1 - (h.embedding <=> query_embedding) as similarity
  from public.healers h
  where
    h.is_active = true
    and h.embedding is not null
    and 1 - (h.embedding <=> query_embedding) > match_threshold
  order by h.embedding <=> query_embedding
  limit match_count;
$$;

-- Trigger: auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'avatar_url'
  );
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
