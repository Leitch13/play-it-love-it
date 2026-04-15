-- ============================================================
-- Coaching Platform – Production Schema
-- Run this in the Supabase SQL editor or via the CLI:
--   supabase db push
-- ============================================================

-- ─────────────────────────────────────────
-- 0. Extensions
-- ─────────────────────────────────────────
create extension if not exists "pgcrypto";

-- ─────────────────────────────────────────
-- 1. Role enum
-- ─────────────────────────────────────────
do $$ begin
  create type app_role as enum ('admin', 'coach', 'parent', 'player');
exception
  when duplicate_object then null;
end $$;

-- ─────────────────────────────────────────
-- 2. profiles
--    One row per auth.users entry.
--    Created automatically via the trigger below.
-- ─────────────────────────────────────────
create table if not exists public.profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  role         app_role    not null default 'player',
  full_name    text,
  avatar_url   text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- Keep updated_at current
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.handle_updated_at();

-- Auto-create a profile row when a new user signs up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
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

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ─────────────────────────────────────────
-- 3. players
-- ─────────────────────────────────────────
create table if not exists public.players (
  id              uuid primary key default gen_random_uuid(),
  profile_id      uuid not null references public.profiles (id) on delete cascade,
  coach_id        uuid references public.profiles (id) on delete set null,
  date_of_birth   date,
  position        text check (position in ('goalkeeper','defender','midfielder','forward')),
  level           text check (level in ('beginner','intermediate','advanced')),
  notes           text,
  created_at      timestamptz not null default now(),
  unique (profile_id)
);

-- ─────────────────────────────────────────
-- 4. parents
-- ─────────────────────────────────────────
create table if not exists public.parents (
  id          uuid primary key default gen_random_uuid(),
  profile_id  uuid not null references public.profiles (id) on delete cascade,
  created_at  timestamptz not null default now(),
  unique (profile_id)
);

-- ─────────────────────────────────────────
-- 5. parent_player_links
-- ─────────────────────────────────────────
create table if not exists public.parent_player_links (
  id            uuid primary key default gen_random_uuid(),
  parent_id     uuid not null references public.parents (id) on delete cascade,
  player_id     uuid not null references public.players (id) on delete cascade,
  relationship  text default 'guardian',
  created_at    timestamptz not null default now(),
  unique (parent_id, player_id)
);

-- ─────────────────────────────────────────
-- 6. training_plans
-- ─────────────────────────────────────────
create table if not exists public.training_plans (
  id            uuid primary key default gen_random_uuid(),
  player_id     uuid not null references public.players (id) on delete cascade,
  coach_id      uuid not null references public.profiles (id) on delete cascade,
  title         text not null,
  weekly_focus  text,
  coach_note    text,
  is_active     boolean not null default true,
  week_start    date,
  created_at    timestamptz not null default now()
);

-- ─────────────────────────────────────────
-- 7. session_templates
--    Reusable hub sessions authored by coaches.
-- ─────────────────────────────────────────
create table if not exists public.session_templates (
  id                uuid primary key default gen_random_uuid(),
  coach_id          uuid not null references public.profiles (id) on delete cascade,
  title             text not null,
  type              text,          -- e.g. "At Home", "Pitch", "Solo + Wall"
  duration_minutes  int,
  tag               text,          -- e.g. "Technique", "Speed"
  content           jsonb,         -- structured drill content
  is_published      boolean not null default false,
  created_at        timestamptz not null default now()
);

-- ─────────────────────────────────────────
-- 8. sessions
--    Scheduled or completed player sessions.
-- ─────────────────────────────────────────
create table if not exists public.sessions (
  id              uuid primary key default gen_random_uuid(),
  plan_id         uuid references public.training_plans (id) on delete set null,
  template_id     uuid references public.session_templates (id) on delete set null,
  player_id       uuid not null references public.players (id) on delete cascade,
  scheduled_at    timestamptz,
  completed_at    timestamptz,
  day_label       text,            -- e.g. "Monday"
  focus           text,
  drills          jsonb,           -- array of drill strings
  recovery_note   text,
  created_at      timestamptz not null default now()
);

-- ─────────────────────────────────────────
-- 9. progress_notes
-- ─────────────────────────────────────────
create table if not exists public.progress_notes (
  id          uuid primary key default gen_random_uuid(),
  player_id   uuid not null references public.players (id) on delete cascade,
  author_id   uuid not null references public.profiles (id) on delete cascade,
  session_id  uuid references public.sessions (id) on delete set null,
  body        text not null,
  visibility  text not null default 'coach'
              check (visibility in ('coach', 'coach_parent', 'player', 'public')),
  created_at  timestamptz not null default now()
);

-- ─────────────────────────────────────────
-- 10. messages
-- ─────────────────────────────────────────
create table if not exists public.messages (
  id            uuid primary key default gen_random_uuid(),
  sender_id     uuid not null references public.profiles (id) on delete cascade,
  recipient_id  uuid not null references public.profiles (id) on delete cascade,
  subject       text,
  body          text not null,
  read_at       timestamptz,
  created_at    timestamptz not null default now()
);

-- ─────────────────────────────────────────
-- 11. Row-Level Security
-- ─────────────────────────────────────────

-- Helper: get the role of the currently authenticated user
create or replace function public.current_user_role()
returns app_role language sql stable security definer as $$
  select role from public.profiles where id = auth.uid();
$$;

-- ── profiles ──
alter table public.profiles enable row level security;

create policy "Users can read own profile"
  on public.profiles for select
  using (id = auth.uid());

create policy "Coaches and admins can read all profiles"
  on public.profiles for select
  using (public.current_user_role() in ('admin', 'coach'));

create policy "Users can update own profile"
  on public.profiles for update
  using (id = auth.uid());

-- ── players ──
alter table public.players enable row level security;

create policy "Coaches can read their players"
  on public.players for select
  using (
    coach_id = auth.uid()
    or public.current_user_role() = 'admin'
  );

create policy "Players can read own row"
  on public.players for select
  using (profile_id = auth.uid());

create policy "Coaches can insert players"
  on public.players for insert
  with check (public.current_user_role() in ('admin', 'coach'));

create policy "Coaches can update their players"
  on public.players for update
  using (
    coach_id = auth.uid()
    or public.current_user_role() = 'admin'
  );

-- ── parents ──
alter table public.parents enable row level security;

create policy "Parents can read own row"
  on public.parents for select
  using (profile_id = auth.uid());

create policy "Coaches and admins can read parents"
  on public.parents for select
  using (public.current_user_role() in ('admin', 'coach'));

-- ── parent_player_links ──
alter table public.parent_player_links enable row level security;

create policy "Parents can read own links"
  on public.parent_player_links for select
  using (
    parent_id in (
      select id from public.parents where profile_id = auth.uid()
    )
  );

create policy "Coaches and admins can manage links"
  on public.parent_player_links for all
  using (public.current_user_role() in ('admin', 'coach'));

-- ── training_plans ──
alter table public.training_plans enable row level security;

create policy "Coach can manage own plans"
  on public.training_plans for all
  using (
    coach_id = auth.uid()
    or public.current_user_role() = 'admin'
  );

create policy "Players can read own plans"
  on public.training_plans for select
  using (
    player_id in (
      select id from public.players where profile_id = auth.uid()
    )
  );

create policy "Parents can read plans for linked players"
  on public.training_plans for select
  using (
    player_id in (
      select pl.player_id
      from public.parent_player_links pl
      join public.parents p on p.id = pl.parent_id
      where p.profile_id = auth.uid()
    )
  );

-- ── session_templates ──
alter table public.session_templates enable row level security;

create policy "Published templates are readable by all authenticated users"
  on public.session_templates for select
  using (is_published = true and auth.uid() is not null);

create policy "Coaches manage own templates"
  on public.session_templates for all
  using (
    coach_id = auth.uid()
    or public.current_user_role() = 'admin'
  );

-- ── sessions ──
alter table public.sessions enable row level security;

create policy "Players can read own sessions"
  on public.sessions for select
  using (
    player_id in (
      select id from public.players where profile_id = auth.uid()
    )
  );

create policy "Coaches can manage sessions for their players"
  on public.sessions for all
  using (
    player_id in (
      select id from public.players where coach_id = auth.uid()
    )
    or public.current_user_role() = 'admin'
  );

create policy "Parents can read sessions for linked players"
  on public.sessions for select
  using (
    player_id in (
      select pl.player_id
      from public.parent_player_links pl
      join public.parents p on p.id = pl.parent_id
      where p.profile_id = auth.uid()
    )
  );

-- ── progress_notes ──
alter table public.progress_notes enable row level security;

create policy "Authors can manage own notes"
  on public.progress_notes for all
  using (author_id = auth.uid());

create policy "Players can read notes visible to player"
  on public.progress_notes for select
  using (
    visibility in ('player', 'public')
    and player_id in (
      select id from public.players where profile_id = auth.uid()
    )
  );

create policy "Parents can read coach_parent notes"
  on public.progress_notes for select
  using (
    visibility in ('coach_parent', 'public')
    and player_id in (
      select pl.player_id
      from public.parent_player_links pl
      join public.parents p on p.id = pl.parent_id
      where p.profile_id = auth.uid()
    )
  );

create policy "Coaches can read notes for their players"
  on public.progress_notes for select
  using (
    player_id in (
      select id from public.players where coach_id = auth.uid()
    )
    or public.current_user_role() = 'admin'
  );

-- ── messages ──
alter table public.messages enable row level security;

create policy "Users can read messages they sent or received"
  on public.messages for select
  using (sender_id = auth.uid() or recipient_id = auth.uid());

create policy "Users can send messages"
  on public.messages for insert
  with check (sender_id = auth.uid());

create policy "Recipients can mark messages as read"
  on public.messages for update
  using (recipient_id = auth.uid());

-- ─────────────────────────────────────────
-- 12. Indexes for common query patterns
-- ─────────────────────────────────────────
create index if not exists idx_players_coach_id        on public.players (coach_id);
create index if not exists idx_sessions_player_id      on public.sessions (player_id);
create index if not exists idx_sessions_plan_id        on public.sessions (plan_id);
create index if not exists idx_training_plans_player   on public.training_plans (player_id);
create index if not exists idx_training_plans_coach    on public.training_plans (coach_id);
create index if not exists idx_progress_notes_player   on public.progress_notes (player_id);
create index if not exists idx_messages_recipient      on public.messages (recipient_id);
create index if not exists idx_messages_sender         on public.messages (sender_id);
