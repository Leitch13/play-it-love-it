-- ============================================================
-- Leads & Bookings – Automated Lead Gen System
-- Run: supabase db push  OR  paste into SQL editor
-- ============================================================

-- ─────────────────────────────────────────
-- 1. lead_status enum
-- ─────────────────────────────────────────
do $$ begin
  create type lead_status as enum (
    'new',
    'contacted',
    'booked',
    'attended',
    'converted',
    'lost'
  );
exception
  when duplicate_object then null;
end $$;

-- ─────────────────────────────────────────
-- 2. leads table – CRM for all inbound leads
-- ─────────────────────────────────────────
create table if not exists public.leads (
  id              uuid primary key default gen_random_uuid(),
  first_name      text not null,
  email           text not null,
  phone           text,
  child_name      text,
  age_group       text,
  source          text not null default 'website',    -- website, facebook, instagram, referral
  utm_campaign    text,
  utm_source      text,
  utm_medium      text,
  status          lead_status not null default 'new',
  notes           text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  booked_at       timestamptz,
  attended_at     timestamptz,
  converted_at    timestamptz
);

create index if not exists idx_leads_email on public.leads (email);
create index if not exists idx_leads_status on public.leads (status);
create index if not exists idx_leads_created on public.leads (created_at desc);

-- Updated at trigger
drop trigger if exists leads_updated_at on public.leads;
create trigger leads_updated_at
  before update on public.leads
  for each row execute function public.handle_updated_at();

-- ─────────────────────────────────────────
-- 3. email_sequences – scheduled follow-up emails
-- ─────────────────────────────────────────
create table if not exists public.email_sequences (
  id              uuid primary key default gen_random_uuid(),
  lead_id         uuid not null references public.leads (id) on delete cascade,
  template_key    text not null,         -- welcome, followup_day1, followup_day3, followup_day7, booking_confirm, reminder
  scheduled_for   timestamptz not null,
  sent_at         timestamptz,
  cancelled_at    timestamptz,
  created_at      timestamptz not null default now()
);

create index if not exists idx_email_seq_pending on public.email_sequences (scheduled_for)
  where sent_at is null and cancelled_at is null;
create index if not exists idx_email_seq_lead on public.email_sequences (lead_id);

-- ─────────────────────────────────────────
-- 4. bookings table
-- ─────────────────────────────────────────
do $$ begin
  create type booking_status as enum (
    'pending',
    'confirmed',
    'cancelled',
    'completed',
    'no_show'
  );
exception
  when duplicate_object then null;
end $$;

create table if not exists public.bookings (
  id              uuid primary key default gen_random_uuid(),
  lead_id         uuid references public.leads (id) on delete set null,
  parent_name     text not null,
  parent_email    text not null,
  parent_phone    text,
  player_name     text not null,
  player_age      text,
  session_type    text not null,          -- trial, group, one_on_one, holiday_camp
  preferred_date  date not null,
  preferred_time  text not null,          -- e.g. "09:00", "14:00"
  status          booking_status not null default 'pending',
  notes           text,
  created_at      timestamptz not null default now(),
  confirmed_at    timestamptz,
  completed_at    timestamptz
);

create index if not exists idx_bookings_date on public.bookings (preferred_date);
create index if not exists idx_bookings_status on public.bookings (status);
create index if not exists idx_bookings_lead on public.bookings (lead_id);

-- ─────────────────────────────────────────
-- 5. RLS for leads, email_sequences, bookings
--    Only coaches/admins + service role can access
-- ─────────────────────────────────────────
alter table public.leads enable row level security;
alter table public.email_sequences enable row level security;
alter table public.bookings enable row level security;

create policy "Coaches and admins can manage leads"
  on public.leads for all
  using (public.current_user_role() in ('admin', 'coach'));

create policy "Coaches and admins can manage email sequences"
  on public.email_sequences for all
  using (public.current_user_role() in ('admin', 'coach'));

create policy "Coaches and admins can manage bookings"
  on public.bookings for all
  using (public.current_user_role() in ('admin', 'coach'));
