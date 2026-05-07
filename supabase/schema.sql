-- Apex Gym OS — Full Database Schema
-- Run this in your Supabase SQL Editor to bootstrap the database.

-- ============================================================
-- ENUMS
-- ============================================================

create type public.user_role as enum ('admin', 'coach', 'client');

create type public.timeline_event_type as enum (
  'phase_change',
  'medication_change',
  'supplement_change',
  'nutrition_change',
  'milestone',
  'competition',
  'note',
  'measurement'
);

create type public.medication_type as enum ('ped', 'supplement', 'medication');

create type public.coach_client_status as enum ('active', 'inactive', 'pending');

-- ============================================================
-- PROFILES (extends auth.users)
-- ============================================================

create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  role        public.user_role not null default 'client',
  first_name  text not null default '',
  last_name   text not null default '',
  email       text,
  phone       text,
  avatar_url  text,
  date_of_birth date,
  gender      text,
  bio         text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index idx_profiles_role on public.profiles(role);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, role)
  values (
    new.id,
    new.email,
    coalesce(
      (new.raw_user_meta_data ->> 'role')::public.user_role,
      'client'
    )
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Auto-update updated_at
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- ============================================================
-- COACH ↔ CLIENT ASSIGNMENTS
-- ============================================================

create table public.coach_clients (
  id          uuid primary key default gen_random_uuid(),
  coach_id    uuid not null references public.profiles(id) on delete cascade,
  client_id   uuid not null references public.profiles(id) on delete cascade,
  status      public.coach_client_status not null default 'active',
  assigned_at timestamptz not null default now(),
  notes       text,
  unique(coach_id, client_id)
);

create index idx_coach_clients_coach on public.coach_clients(coach_id);
create index idx_coach_clients_client on public.coach_clients(client_id);

-- ============================================================
-- TIMELINE EVENTS (the "Command Center")
-- ============================================================

create table public.timeline_events (
  id          uuid primary key default gen_random_uuid(),
  client_id   uuid not null references public.profiles(id) on delete cascade,
  event_type  public.timeline_event_type not null,
  title       text not null,
  description text,
  event_date  date not null default current_date,
  metadata    jsonb default '{}',
  created_by  uuid references public.profiles(id) on delete set null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index idx_timeline_client on public.timeline_events(client_id);
create index idx_timeline_date on public.timeline_events(event_date desc);
create index idx_timeline_type on public.timeline_events(event_type);

create trigger timeline_events_updated_at
  before update on public.timeline_events
  for each row execute function public.set_updated_at();

-- ============================================================
-- MEDICATIONS / SUPPLEMENTS / PEDs
-- ============================================================

create table public.medications (
  id           uuid primary key default gen_random_uuid(),
  client_id    uuid not null references public.profiles(id) on delete cascade,
  name         text not null,
  type         public.medication_type not null,
  dosage       text,
  dosage_unit  text,
  frequency    text,
  start_date   date not null default current_date,
  end_date     date,
  active       boolean not null default true,
  notes        text,
  created_by   uuid references public.profiles(id) on delete set null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index idx_medications_client on public.medications(client_id);
create index idx_medications_active on public.medications(active) where active = true;

create trigger medications_updated_at
  before update on public.medications
  for each row execute function public.set_updated_at();

-- ============================================================
-- CLIENT GOALS
-- ============================================================

create table public.client_goals (
  id          uuid primary key default gen_random_uuid(),
  client_id   uuid not null references public.profiles(id) on delete cascade,
  title       text not null,
  description text,
  target_date date,
  target_value text,
  current_value text,
  completed   boolean not null default false,
  created_by  uuid references public.profiles(id) on delete set null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index idx_goals_client on public.client_goals(client_id);

create trigger client_goals_updated_at
  before update on public.client_goals
  for each row execute function public.set_updated_at();

-- ============================================================
-- CLIENT METRICS (daily check-in data)
-- ============================================================

create table public.client_metrics (
  id              uuid primary key default gen_random_uuid(),
  client_id       uuid not null references public.profiles(id) on delete cascade,
  date            date not null default current_date,
  weight_kg       numeric(5,2),
  steps           integer,
  sleep_hours     numeric(3,1),
  sleep_quality   smallint check (sleep_quality between 1 and 5),
  stress_level    smallint check (stress_level between 1 and 5),
  hunger_level    smallint check (hunger_level between 1 and 5),
  energy_level    smallint check (energy_level between 1 and 5),
  menstrual_phase text,
  notes           text,
  created_at      timestamptz not null default now(),
  unique(client_id, date)
);

create index idx_metrics_client_date on public.client_metrics(client_id, date desc);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table public.profiles enable row level security;
alter table public.coach_clients enable row level security;
alter table public.timeline_events enable row level security;
alter table public.medications enable row level security;
alter table public.client_goals enable row level security;
alter table public.client_metrics enable row level security;

-- Helper: check if current user is admin
create or replace function public.is_admin()
returns boolean as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$ language sql security definer stable;

-- Helper: check if current user is coach of given client
create or replace function public.is_coach_of(p_client_id uuid)
returns boolean as $$
  select exists (
    select 1 from public.coach_clients
    where coach_id = auth.uid()
      and client_id = p_client_id
      and status = 'active'
  );
$$ language sql security definer stable;

-- PROFILES policies
create policy "Admins can do everything with profiles"
  on public.profiles for all
  using (public.is_admin());

create policy "Coaches can view their assigned clients"
  on public.profiles for select
  using (
    id = auth.uid()
    or public.is_coach_of(id)
    or role = 'coach'
  );

create policy "Users can update own profile"
  on public.profiles for update
  using (id = auth.uid())
  with check (id = auth.uid());

-- COACH_CLIENTS policies
create policy "Admins can manage all assignments"
  on public.coach_clients for all
  using (public.is_admin());

create policy "Coaches can view their own assignments"
  on public.coach_clients for select
  using (coach_id = auth.uid());

create policy "Clients can view their own assignment"
  on public.coach_clients for select
  using (client_id = auth.uid());

-- TIMELINE_EVENTS policies
create policy "Admins can manage all timeline events"
  on public.timeline_events for all
  using (public.is_admin());

create policy "Coaches can manage their clients timeline"
  on public.timeline_events for all
  using (public.is_coach_of(client_id));

create policy "Clients can view their own timeline"
  on public.timeline_events for select
  using (client_id = auth.uid());

-- MEDICATIONS policies
create policy "Admins can manage all medications"
  on public.medications for all
  using (public.is_admin());

create policy "Coaches can manage their clients medications"
  on public.medications for all
  using (public.is_coach_of(client_id));

create policy "Clients can view their own medications"
  on public.medications for select
  using (client_id = auth.uid());

-- CLIENT_GOALS policies
create policy "Admins can manage all goals"
  on public.client_goals for all
  using (public.is_admin());

create policy "Coaches can manage their clients goals"
  on public.client_goals for all
  using (public.is_coach_of(client_id));

create policy "Clients can view their own goals"
  on public.client_goals for select
  using (client_id = auth.uid());

-- CLIENT_METRICS policies
create policy "Admins can manage all metrics"
  on public.client_metrics for all
  using (public.is_admin());

create policy "Coaches can view their clients metrics"
  on public.client_metrics for select
  using (public.is_coach_of(client_id));

create policy "Clients can manage their own metrics"
  on public.client_metrics for all
  using (client_id = auth.uid());
