# Apex Gym OS — Complete Blueprint

> Full product spec, architecture, database schema, component inventory, and all code patterns.
> Use this to recreate or extend the app from scratch.
>
> GitHub: https://github.com/gabadub123-cmd/apex-gym-os
> Deployed: Vercel (auto-deploys from `main`)
> Last updated: 2026-05-08

---

## 1. Product Concept

A SaaS coaching platform for gym coaches to manage multiple clients. Replaces spreadsheets. The core concept is a **"Command Center" per client** — a vertical timeline that tracks every significant change in a client's journey: phase changes, nutrition targets, medication/supplement cycles, body measurements, personal records, and competition dates.

### The Bilateral Input Model

The entire platform is built around two flows that work together:

```
COACH (prescribes)                  CLIENT (logs actuals)
──────────────────                  ────────────────────
Sets nutrition targets    →  Client sees macros on dashboard
Creates workout templates →  Client logs actual sets/reps/weight
Adds medications/supps    →  Client sees their active protocol
Logs timeline events      →  Client sees their history
Sets goals                →  Client sees & adds own goals
                             Client submits daily check-ins
                             Coach sees all check-in data
```

---

## 2. Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | **Next.js 16** — App Router, TypeScript, server components |
| Styling | **Tailwind CSS v4** |
| UI Components | **Shadcn UI v4** (uses Base UI primitives — NOT Radix UI) |
| Database | **Supabase** — PostgreSQL with RLS |
| Auth | **Supabase Auth** — email/password + Google OAuth |
| ORM | Supabase JS client (`@supabase/ssr` for server, `@supabase/supabase-js` for client) |
| Hosting | **Vercel** — env vars set in project settings |
| Icons | **Lucide React** |
| Date utils | **date-fns** |

### Critical Shadcn v4 Note
Shadcn v4 does **not** support `asChild`. Never wrap components with `<Button asChild>`. Instead:
- Use native `<DialogTrigger className="...">` directly
- Use `buttonVariants({ variant: "..." })` to apply button styles to links/buttons

### Patterns Used Throughout
- **Server Components** for all data fetching (no `useEffect`, no client-side fetches)
- **Server Actions** (`"use server"`) for all mutations — no API routes
- **`useTransition`** on the client for pending states during action calls
- **`revalidatePath`** inside every action to refresh server component data
- FormData passed to server actions (no JSON body API calls)

---

## 3. Role System

Three roles, enforced at the database (RLS) and UI level:

### `admin`
- Sees all clients across all coaches
- Can change any user's role (promote/demote)
- Can assign/unassign clients to coaches
- Sees Admin panel in sidebar
- Has full access to all data

### `coach`
- Sees only assigned clients
- Creates timeline events, medications, goals, workout templates for their clients
- Views client check-in data, metrics, workout logs
- Does not see Admin panel

### `client`
- Sees only their own data
- Submits daily check-ins (weight, steps, sleep, ratings)
- Logs workouts (sets, reps, weight, RPE)
- Adds own goals
- Adds notes and milestone events to own timeline
- Does NOT see Clients list or Admin panel
- Goes through 4-step onboarding on first login

---

## 4. Navigation Structure

### Sidebar nav items (role-filtered)

| Label | Route | Roles |
|-------|-------|-------|
| Dashboard | `/dashboard` | all |
| Clients | `/dashboard/clients` | admin, coach |
| Schedule | `/dashboard/schedule` | all |
| Training | `/dashboard/training` | all |
| Nutrition | `/dashboard/nutrition` | all |
| Admin | `/dashboard/admin` | admin only |
| Shop | `/dashboard/shop` | admin only |
| Community | `/dashboard/community` | all |
| Settings | `/dashboard/settings` | all |

### Mobile nav
Sidebar is `hidden md:flex`. On mobile, a hamburger in the topbar opens a Shadcn `Sheet` (drawer) with the same nav links.

---

## 5. Auth & Middleware Flow

### Login page (`/login`)
- Toggles between **Login** and **Register** modes
- Register captures `first_name`, `last_name`, sent as Supabase user metadata
- Google OAuth button — calls `supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: "${origin}/auth/callback" } })`
- Email/password login calls `supabase.auth.signInWithPassword`
- On success → redirect to `/dashboard`

### OAuth Callback (`/auth/callback/route.ts`)
- Route handler receives `?code=` param from Google
- Calls `supabase.auth.exchangeCodeForSession(code)`
- Redirects to `/dashboard` on success, `/login?error=auth_failed` on failure

### Middleware (`src/middleware.ts` → `src/lib/supabase/middleware.ts`)
Three rules, checked in order:
1. **No session + protected route** → redirect to `/login`
2. **Has session + on `/login`** → redirect to `/dashboard`
3. **Has session + client role + `onboarding_completed = false`** → redirect to `/onboarding`

Exceptions that bypass middleware: `/auth/callback`, `/onboarding`, `/login`, `/`

### Auto-profile creation
A Postgres trigger fires on every `auth.users` insert and creates a `profiles` row. Role defaults to `'client'` unless `raw_user_meta_data.role` is set.

```sql
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, role, first_name, last_name)
  values (
    new.id,
    new.email,
    coalesce((new.raw_user_meta_data->>'role')::public.user_role, 'client'),
    coalesce(new.raw_user_meta_data->>'first_name', ''),
    coalesce(new.raw_user_meta_data->>'last_name', '')
  );
  return new;
end;
$$ language plpgsql security definer;
```

---

## 6. Onboarding Flow (`/onboarding`)

4-step wizard, **clients only**, gated by `onboarding_completed = false`.

| Step | Content |
|------|---------|
| 1 — Welcome | Intro screen, lists the 3 upcoming steps |
| 2 — Video | Mock video player (click to "watch"). Next button disabled until watched. |
| 3 — Profile | Optional fields: phone, date of birth, gender, short bio |
| 4 — First Goal | Goal title + target value fields. Saved as a `client_goals` row. |

On finish: calls `completeOnboarding(formData)` server action which:
- Sets `profiles.onboarding_completed = true`
- Saves phone/DOB/gender/bio if provided
- Inserts first goal if provided
- Redirects to `/dashboard`

---

## 7. Dashboard (`/dashboard`)

### Coach/Admin view
- Welcome header with first name
- 4 stat cards: Clients, Events This Week, Active Goals, Upcoming
- Upcoming Events list (next 5 timeline events by date)
- Your Clients list (clickable, goes to client profile)

### Client view
- Welcome header with first name + current date
- Phase badge (colour-coded: bulk=blue, cut=red, maintenance=green, competition_prep=purple)
- 4 stat cards: Current Weight, 7-Day Avg Weight, Active Goals, Active Meds
- **Daily Check-in form** (centre column — most important client action)
- Macro Targets card (from latest `nutrition_change` timeline event)
- Recent Activity (last 5 timeline events)
- Sidebar: My Goals + Add Goal button, My Supplements/Meds, Weight Log (7 days)

---

## 8. Client Profile (`/dashboard/clients/[id]`)

The "Command Center". Only visible to coaches and admins.

### Profile Header
- Avatar (initials fallback)
- Full name + phase badge + age + gender
- "Client since" date, active goal count, active med count
- 4 quick stats: Current Weight, 7-Day Avg Weight, 7-Day Avg Steps, Latest Energy level
- Trend arrows on weight (TrendingDown = green for coaches, TrendingUp = red)

### Main column (2/3 width)
1. **Timeline** — vertical list of all events, newest first. Add Event button top-right.
2. **Check-in form** — coach can log on behalf of client. Shows "Today's Check-in (Submitted)" title if already logged today.
3. **Check-in History** — last 30 entries, each showing date, weight badge, and all metric values with colour-coded ratings.

### Sidebar (1/3 width)
1. **Active Goals** — title, current → target, target date
2. **Active Medications & Supplements** — name, dosage·unit·frequency, type badge (PED=red, supplement=green)
3. **Weight Log** — last 7 days, date + weight

---

## 9. Timeline Component

### Event types and their metadata

| `event_type` | Metadata fields | Display colour |
|---|---|---|
| `phase_change` | `phase`, `calorie_target`, `target_weight_kg`, `competition`, `surplus` | Blue |
| `medication_change` | `medication`, `dosage`, `frequency`, `type`, `prescriber` | Red |
| `supplement_change` | `supplement`, `dosage`, `frequency` | Green |
| `nutrition_change` | `protein_g`, `carbs_g`, `fat_g`, `calories` | Amber |
| `milestone` | `exercise`, `weight_kg`, `reps`, `bodyweight_kg` | Yellow |
| `competition` | `federation`, `division`, `location`, `placement` | Purple |
| `measurement` | `weight_kg`, `body_fat_pct`, `lean_mass_kg` | Cyan |
| `note` | _(none required)_ | Muted grey |

### Add Event Dialog
Modal with:
1. Event type selector (dropdown)
2. Title input (always shown)
3. Date input (always shown, defaults today)
4. Description textarea (always shown)
5. **Conditional extra fields** based on event type — shown/hidden via `useState` on the selected type

Clients can only add `note` and `milestone` types (enforced by RLS policy).

### Timeline filters
Filter bar above timeline to show/hide event types.

---

## 10. Daily Check-in System

### Fields
| Field | Type | Notes |
|-------|------|-------|
| `weight_kg` | numeric | Step 0.1 |
| `steps` | integer | |
| `sleep_hours` | numeric | Step 0.5 |
| `sleep_quality` | 1–5 | Button group |
| `energy_level` | 1–5 | Button group |
| `hunger_level` | 1–5 | Button group |
| `stress_level` | 1–5 | Button group |
| `notes` | text | Textarea |

### Rating button UX
Each 1–5 rating uses a row of 5 square buttons. Selected button gets `bg-primary text-primary-foreground`. Uses a hidden `<input type="hidden">` to pass value to FormData.

### Upsert logic
`client_metrics` has a `UNIQUE(client_id, date)` constraint. The action uses `.upsert(..., { onConflict: "client_id,date" })` so submitting twice on the same day updates rather than errors.

### Colour coding in history
- Value ≥ 4 → `text-green-400`
- Value = 3 → `text-amber-400`
- Value ≤ 2 → `text-red-400`
- Stress is **inverted** (high stress = bad, so `6 - stress_level` is passed to the colour function)

---

## 11. Training Engine

### Concept
Two-sided: **coach prescribes** (templates), **client logs actuals** (workout logs).

### Exercise Library
- Global table, readable by all, writable by coaches/admins
- Fields: `name`, `category` (compound/chest/back/shoulders/legs/arms/core/cardio/other), `video_url`, `instructions`
- Searchable by name or category on the frontend
- `AddExerciseForm` component — inline toggle form

### Workout Templates (Prescription side)
Coach creates a template for a specific client:
- Template: `name`, `day_label` (e.g. "Monday / Day 1"), `notes`
- Exercises: ordered list — each has `exercise_id`, `sets`, `reps` (text, e.g. "8-12"), `weight_kg` target, `tempo` (e.g. "3010"), `rest_seconds`
- `CreateTemplateForm` — dynamic row builder, add/remove exercise rows

### Workout Logs (Actual side)
Client logs a completed workout:
- Log header: `name`, `date`, `duration_minutes`, optional `template_id` link, `notes`
- Sets: each row has `exercise_id`, `set_number`, `reps`, `weight_kg`, `rpe` (1–10)
- `LogWorkoutForm` — dynamic set builder, template pre-select populates workout name

### Training page layout

**Coach view:**
- Left (2/3): Template builder (create templates, assign to client) + Recent Milestones
- Right (1/3): Exercise Library with Add Exercise form + search

**Client view:**
- Left (2/3): Log Workout form + Workout History
- Right (1/3): My Workout Plans (assigned templates) + Personal Records

---

## 12. Nutrition Page

### Coach view
Grid of client cards, each showing:
- Avatar initials + name + phase badge
- P / C / F / kcal values from latest `nutrition_change` timeline event
- Last updated date
- Clicking the card goes to client profile

### Client view
- "Current Targets" card with large numbers for P/C/F/kcal
- Nutrition History — all `nutrition_change` events in timeline order
- Note: targets are read from the timeline, not a separate table. Coach adds them via Add Event.

---

## 13. Schedule Page

### Coach view
- Left (2/3): Weekly calendar grid (Mon–Sun), shows timeline events falling on each day
- Right (1/3): "Today's Check-ins" tracker — green dot/badge for Done, amber for Missing

### Client view
- Weekly calendar with own events only
- No check-in tracker sidebar

---

## 14. Admin Panel (`/dashboard/admin`)

Only accessible to `admin` role (page-level redirect check).

### Stat cards
- Admins count, Coaches count, Clients count

### All Users table
- Every profile listed with name, email, current role badge
- Two "→ role" buttons to change to the other two roles
- One click, instant update via `updateUserRole` server action

### Coach → Client Assignments
- One block per coach showing their assigned clients as removable chips
- "Assign" buttons for all currently unassigned clients (appear under each coach block)
- "Unassigned" badge shows count of clients with no coach

---

## 15. Settings Page

Profile form with fields:
- First Name, Last Name (required)
- Phone, Date of Birth, Gender, Bio (optional)
- Role badge (display only)
- Email + User ID (display only, from Supabase auth)

Saves via `updateProfile` server action with `revalidatePath("/dashboard")`.

---

## 16. Complete Database Schema

### Enums
```sql
create type user_role as enum ('admin', 'coach', 'client');
create type timeline_event_type as enum (
  'phase_change', 'medication_change', 'supplement_change',
  'nutrition_change', 'milestone', 'competition', 'note', 'measurement'
);
create type medication_type as enum ('ped', 'supplement', 'medication');
create type coach_client_status as enum ('active', 'inactive', 'pending');
```

### Core Tables (Migration 0 — original schema)
```sql
-- Profiles (extends auth.users)
create table profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  role          user_role not null default 'client',
  first_name    text not null default '',
  last_name     text not null default '',
  email         text,
  phone         text,
  avatar_url    text,
  date_of_birth date,
  gender        text,
  bio           text,
  onboarding_completed boolean default false,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- Coach ↔ Client assignments
create table coach_clients (
  id          uuid primary key default gen_random_uuid(),
  coach_id    uuid not null references profiles(id) on delete cascade,
  client_id   uuid not null references profiles(id) on delete cascade,
  status      coach_client_status not null default 'active',
  assigned_at timestamptz default now(),
  notes       text,
  unique(coach_id, client_id)
);

-- Command Center timeline
create table timeline_events (
  id          uuid primary key default gen_random_uuid(),
  client_id   uuid not null references profiles(id) on delete cascade,
  event_type  timeline_event_type not null,
  title       text not null,
  description text,
  event_date  date not null default current_date,
  metadata    jsonb default '{}',
  created_by  uuid references profiles(id) on delete set null,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- Medications / Supplements / PEDs
create table medications (
  id           uuid primary key default gen_random_uuid(),
  client_id    uuid not null references profiles(id) on delete cascade,
  name         text not null,
  type         medication_type not null,
  dosage       text,
  dosage_unit  text,
  frequency    text,
  start_date   date not null default current_date,
  end_date     date,
  active       boolean not null default true,
  notes        text,
  created_by   uuid references profiles(id) on delete set null,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

-- Goals
create table client_goals (
  id            uuid primary key default gen_random_uuid(),
  client_id     uuid not null references profiles(id) on delete cascade,
  title         text not null,
  description   text,
  target_date   date,
  target_value  text,
  current_value text,
  completed     boolean not null default false,
  created_by    uuid references profiles(id) on delete set null,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- Daily check-in metrics
create table client_metrics (
  id             uuid primary key default gen_random_uuid(),
  client_id      uuid not null references profiles(id) on delete cascade,
  date           date not null default current_date,
  weight_kg      numeric(5,2),
  steps          integer,
  sleep_hours    numeric(3,1),
  sleep_quality  smallint check (sleep_quality between 1 and 5),
  stress_level   smallint check (stress_level between 1 and 5),
  hunger_level   smallint check (hunger_level between 1 and 5),
  energy_level   smallint check (energy_level between 1 and 5),
  menstrual_phase text,
  notes          text,
  created_at     timestamptz default now(),
  unique(client_id, date)
);
```

### Training Engine Tables (Migration 2 — must be run manually)
```sql
-- Exercise library
create table exercises (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  category     text not null default 'other',
  video_url    text,
  instructions text,
  created_by   uuid references profiles(id),
  created_at   timestamptz default now()
);

-- Workout templates (coach prescribes)
create table workout_templates (
  id          uuid primary key default gen_random_uuid(),
  coach_id    uuid not null references profiles(id),
  client_id   uuid not null references profiles(id),
  name        text not null,
  day_label   text,
  notes       text,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

create table workout_template_exercises (
  id           uuid primary key default gen_random_uuid(),
  template_id  uuid not null references workout_templates(id) on delete cascade,
  exercise_id  uuid not null references exercises(id),
  order_index  int not null default 0,
  sets         int not null default 3,
  reps         text not null default '10',
  weight_kg    numeric,
  tempo        text,
  rest_seconds int,
  notes        text
);

-- Workout logs (client fills in actuals)
create table workout_logs (
  id               uuid primary key default gen_random_uuid(),
  client_id        uuid not null references profiles(id),
  template_id      uuid references workout_templates(id),
  name             text not null,
  date             date not null default current_date,
  duration_minutes int,
  notes            text,
  created_at       timestamptz default now()
);

create table workout_log_sets (
  id          uuid primary key default gen_random_uuid(),
  log_id      uuid not null references workout_logs(id) on delete cascade,
  exercise_id uuid not null references exercises(id),
  set_number  int not null default 1,
  reps        int,
  weight_kg   numeric,
  rpe         numeric,
  notes       text
);
```

### RLS Helper Functions
```sql
-- Check if current user is admin
create or replace function is_admin() returns boolean as $$
  select exists (select 1 from profiles where id = auth.uid() and role = 'admin');
$$ language sql security definer stable;

-- Check if current user is coach of a given client
create or replace function is_coach_of(p_client_id uuid) returns boolean as $$
  select exists (
    select 1 from coach_clients
    where coach_id = auth.uid() and client_id = p_client_id and status = 'active'
  );
$$ language sql security definer stable;
```

### RLS Policies Summary

| Table | Admin | Coach | Client |
|-------|-------|-------|--------|
| `profiles` | ALL | SELECT (own + assigned clients + all coaches) | SELECT+UPDATE own only |
| `coach_clients` | ALL | SELECT own | SELECT own |
| `timeline_events` | ALL | ALL for assigned clients | SELECT own; INSERT note/milestone only |
| `medications` | ALL | ALL for assigned clients | SELECT own |
| `client_goals` | ALL | ALL for assigned clients | SELECT+INSERT own |
| `client_metrics` | ALL | SELECT assigned clients | ALL own |
| `exercises` | ALL | SELECT+INSERT | SELECT |
| `workout_templates` | ALL | SELECT+INSERT own | SELECT assigned to them |
| `workout_template_exercises` | ALL | SELECT+INSERT via template | SELECT via template |
| `workout_logs` | ALL | SELECT assigned clients | ALL own |
| `workout_log_sets` | ALL | SELECT via log | ALL own via log |

### Manual Migrations (already run)
```sql
-- Migration 1: Onboarding column
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarding_completed boolean DEFAULT false;
UPDATE profiles SET onboarding_completed = true; -- mark existing users as done

-- Client RLS additions
CREATE POLICY "clients_insert_own_goals" ON client_goals
  FOR INSERT WITH CHECK (auth.uid() = client_id);

CREATE POLICY "clients_insert_own_events" ON timeline_events
  FOR INSERT WITH CHECK (auth.uid() = client_id AND event_type IN ('note','milestone'));

CREATE POLICY "clients_update_own_profile" ON profiles
  FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
```

---

## 17. TypeScript Types (`src/lib/types/database.ts`)

```typescript
export type UserRole = "admin" | "coach" | "client";
export type TimelineEventType = "phase_change" | "medication_change" | "supplement_change" | "nutrition_change" | "milestone" | "competition" | "note" | "measurement";
export type MedicationType = "ped" | "supplement" | "medication";
export type CoachClientStatus = "active" | "inactive" | "pending";
export type ExerciseCategory = "chest" | "back" | "shoulders" | "legs" | "arms" | "core" | "cardio" | "compound" | "other";

export interface Profile {
  id: string; role: UserRole;
  first_name: string; last_name: string;
  email: string | null; phone: string | null; avatar_url: string | null;
  date_of_birth: string | null; gender: string | null; bio: string | null;
  onboarding_completed: boolean;
  created_at: string; updated_at: string;
}

export interface CoachClient {
  id: string; coach_id: string; client_id: string;
  status: CoachClientStatus; assigned_at: string; notes: string | null;
}

export interface TimelineEvent {
  id: string; client_id: string; event_type: TimelineEventType;
  title: string; description: string | null; event_date: string;
  metadata: Record<string, unknown>;
  created_by: string | null; created_at: string; updated_at: string;
}

export interface Medication {
  id: string; client_id: string; name: string; type: MedicationType;
  dosage: string | null; dosage_unit: string | null; frequency: string | null;
  start_date: string; end_date: string | null; active: boolean;
  notes: string | null; created_by: string | null;
  created_at: string; updated_at: string;
}

export interface ClientGoal {
  id: string; client_id: string; title: string; description: string | null;
  target_date: string | null; target_value: string | null; current_value: string | null;
  completed: boolean; created_by: string | null;
  created_at: string; updated_at: string;
}

export interface ClientMetric {
  id: string; client_id: string; date: string;
  weight_kg: number | null; steps: number | null;
  sleep_hours: number | null; sleep_quality: number | null;
  stress_level: number | null; hunger_level: number | null; energy_level: number | null;
  menstrual_phase: string | null; notes: string | null; created_at: string;
}

export interface Exercise {
  id: string; name: string; category: ExerciseCategory;
  video_url: string | null; instructions: string | null;
  created_by: string | null; created_at: string;
}

export interface WorkoutTemplate {
  id: string; coach_id: string; client_id: string;
  name: string; day_label: string | null; notes: string | null;
  created_at: string; updated_at: string;
}

export interface WorkoutTemplateExercise {
  id: string; template_id: string; exercise_id: string;
  order_index: number; sets: number; reps: string;
  weight_kg: number | null; tempo: string | null; rest_seconds: number | null;
  notes: string | null; exercise?: Exercise;
}

export interface WorkoutLog {
  id: string; client_id: string; template_id: string | null;
  name: string; date: string; duration_minutes: number | null;
  notes: string | null; created_at: string;
}

export interface WorkoutLogSet {
  id: string; log_id: string; exercise_id: string;
  set_number: number; reps: number | null; weight_kg: number | null;
  rpe: number | null; notes: string | null; exercise?: Exercise;
}
```

---

## 18. All Server Actions (`src/lib/supabase/actions.ts`)

All actions:
1. Are in a `"use server"` file
2. Take `FormData` as their argument
3. Call `supabase.auth.getUser()` to get the current user
4. Throw `new Error(error.message)` on Supabase errors
5. Call `revalidatePath(...)` to refresh the page after mutation

| Action | FormData fields | Revalidates |
|--------|----------------|-------------|
| `addTimelineEvent` | `client_id`, `event_type`, `title`, `description`, `event_date` + type-specific fields | `/dashboard/clients/[clientId]` |
| `submitDailyCheckin` | `client_id`, `date`, `weight_kg`, `steps`, `sleep_hours`, `sleep_quality`, `stress_level`, `hunger_level`, `energy_level`, `notes` | `/dashboard/clients/[clientId]` |
| `addMedication` | `client_id`, `name`, `type`, `dosage`, `dosage_unit`, `frequency`, `start_date`, `notes` | `/dashboard/clients/[clientId]` |
| `addGoal` | `client_id`, `title`, `description`, `target_date`, `target_value`, `current_value` | `/dashboard/clients/[clientId]` |
| `updateProfile` | `first_name`, `last_name`, `phone`, `date_of_birth`, `gender`, `bio` | `/dashboard` |
| `completeOnboarding` | `phone`, `date_of_birth`, `gender`, `bio`, `goal_title`, `goal_target` | `/dashboard` |
| `assignClientToCoach` | `coach_id`, `client_id` | `/dashboard/admin` |
| `removeClientFromCoach` | `coach_id`, `client_id` | `/dashboard/admin` |
| `updateUserRole` | `user_id`, `role` | `/dashboard/admin` |
| `addExercise` | `name`, `category`, `video_url`, `instructions` | `/dashboard/training` |
| `createWorkoutTemplate` | `client_id`, `name`, `day_label`, `notes`, `exercises` (JSON string) | `/dashboard/clients/[clientId]`, `/dashboard/training` |
| `logWorkout` | `client_id`, `template_id`, `name`, `date`, `duration_minutes`, `notes`, `sets` (JSON string) | `/dashboard/training`, `/dashboard/clients/[clientId]` |

### JSON string format for `createWorkoutTemplate.exercises`
```json
[
  { "exercise_id": "uuid", "sets": 4, "reps": "5", "weight_kg": 100, "tempo": "3010", "rest_seconds": 180 },
  { "exercise_id": "uuid", "sets": 3, "reps": "8-12" }
]
```

### JSON string format for `logWorkout.sets`
```json
[
  { "exercise_id": "uuid", "set_number": 1, "reps": 5, "weight_kg": 102.5, "rpe": 8 },
  { "exercise_id": "uuid", "set_number": 2, "reps": 5, "weight_kg": 102.5, "rpe": 9 }
]
```

---

## 19. All Queries (`src/lib/supabase/queries.ts`)

All queries are `"use server"` and use the **server-side Supabase client** (`@supabase/ssr` with cookies).

| Function | Description |
|----------|-------------|
| `getCurrentProfile()` | Gets logged-in user's profile. Returns `null` if not authenticated. |
| `getClients()` | **Role-aware.** Admin → all clients. Coach → assigned clients only. Client role → `[]` |
| `getClientById(id)` | Single profile lookup by UUID |
| `getTimelineForClient(clientId)` | All events ordered by `event_date DESC` |
| `getMedicationsForClient(clientId)` | All meds ordered by `start_date DESC` |
| `getGoalsForClient(clientId)` | All goals ordered by `created_at DESC` |
| `getMetricsForClient(clientId, limit)` | Daily check-ins ordered by `date DESC`. Default limit 7. |
| `getLatestPhase(clientId)` | Latest `phase_change` event's `metadata.phase` value |
| `getDashboardStats()` | Branches to coach stats or client stats based on role |
| `getAllProfiles()` | Admin: every profile, ordered by role then name |
| `getCoaches()` | All `role='coach'` profiles |
| `getCoachAssignments()` | All `coach_clients` rows (`coach_id`, `client_id`, `status`) |
| `getMyCoach(clientId)` | Client's active coach profile |
| `getExercises()` | All exercises ordered by category, name |
| `getWorkoutTemplatesForClient(clientId)` | Templates assigned to a client |
| `getTemplateExercises(templateId)` | Template exercises with `exercise` join, ordered by `order_index` |
| `getWorkoutLogsForClient(clientId, limit)` | Workout logs ordered by `date DESC`. Default 20. |
| `getWorkoutLogSets(logId)` | Sets for a log with `exercise` join, ordered by `set_number` |

---

## 20. Supabase Client Setup

### Browser client (`src/lib/supabase/client.ts`)
```typescript
import { createBrowserClient } from "@supabase/ssr";
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

### Server client (`src/lib/supabase/server.ts`)
```typescript
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {} // ignored in server components
        },
      },
    }
  );
}
```

---

## 21. Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=https://[project-ref].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[anon-key]
```

Set these in Vercel → Project → Settings → Environment Variables for Production + Preview.

---

## 22. Project Setup (from scratch)

```bash
npx create-next-app@latest apex-gym-os --typescript --tailwind --app --src-dir
cd apex-gym-os

# Dependencies
npm install @supabase/supabase-js @supabase/ssr lucide-react date-fns

# Shadcn init (new-york style, zinc colour, CSS variables)
npx shadcn@latest init

# Shadcn components
npx shadcn@latest add button card badge avatar separator scroll-area tabs \
  dialog dropdown-menu input label select sheet textarea tooltip
```

---

## 23. What's Still To Build

### 🔲 Nutrition Logger (highest priority)
Daily food/macro logging by clients.

New tables:
```sql
create table food_logs (
  id         uuid primary key default gen_random_uuid(),
  client_id  uuid not null references profiles(id),
  date       date not null default current_date,
  meal       text, -- breakfast, lunch, dinner, snack
  food_name  text not null,
  protein_g  numeric, carbs_g numeric, fat_g numeric, calories numeric,
  created_at timestamptz default now()
);

create table water_logs (
  id         uuid primary key default gen_random_uuid(),
  client_id  uuid not null references profiles(id),
  date       date not null default current_date,
  amount_ml  int not null,
  created_at timestamptz default now(),
  unique(client_id, date) -- or allow multiple per day and sum
);
```

UI needed:
- Client: Add food entry form (meal selector, food name, macros), daily total vs target bar
- Client: Water tracker (tap to add 250ml, show daily total)
- Coach: Compliance overview — how close clients are hitting macro targets

### 🔲 Default Exercise Seed
Run this in Supabase SQL editor to pre-populate the exercise library:
```sql
INSERT INTO exercises (name, category) VALUES
  ('Back Squat', 'legs'), ('Front Squat', 'legs'), ('Romanian Deadlift', 'legs'),
  ('Leg Press', 'legs'), ('Leg Curl', 'legs'), ('Walking Lunge', 'legs'),
  ('Bench Press', 'chest'), ('Incline Bench Press', 'chest'), ('Cable Fly', 'chest'),
  ('Dumbbell Press', 'chest'), ('Push Up', 'chest'),
  ('Conventional Deadlift', 'compound'), ('Sumo Deadlift', 'compound'),
  ('Barbell Row', 'back'), ('Pull Up', 'back'), ('Lat Pulldown', 'back'),
  ('Seated Cable Row', 'back'), ('Face Pull', 'back'),
  ('Overhead Press', 'shoulders'), ('Lateral Raise', 'shoulders'),
  ('Barbell Curl', 'arms'), ('Tricep Pushdown', 'arms'), ('Hammer Curl', 'arms'),
  ('Plank', 'core'), ('Ab Wheel', 'core'),
  ('Treadmill', 'cardio'), ('Stationary Bike', 'cardio'), ('Jump Rope', 'cardio');
```

### 🔲 Progress Charts
Add line charts to client profile and client dashboard for weight trend over time. Use `recharts` library.
```bash
npm install recharts
```

### 🔲 Goal Management Improvements
- Mark goals as complete (button on goal card)
- Edit `current_value` for progress tracking
- Completed goals section (archived view)

### 🔲 Community Feed
Simple announcement board.
```sql
create table community_posts (
  id         uuid primary key default gen_random_uuid(),
  author_id  uuid not null references profiles(id),
  content    text not null,
  pinned     boolean default false,
  created_at timestamptz default now()
);
```
UI: Coach posts announcements, all clients see them. Pin important ones to top.

### 🔲 Mobile Improvements
Sidebar is currently `hidden md:flex` — mobile uses the Sheet drawer in topbar. Good enough for now but could be improved with better mobile layouts for training log form and check-in form.

### 🔲 Business Suite (Phase 3+)
- Stripe subscriptions for client billing
- Invoice PDF generation
- Session/appointment booking calendar

---

## 24. Commit History

```
dca2889 Add BUILDLOG.md — full project reference and build status
271bd33 Add Training Engine: exercise library, workout templates, and workout logging
239f72d Add OAuth callback, onboarding flow, admin panel, and client goal creation
6de6105 Role-aware UI: client dashboard, daily check-in, coach check-in viewer
ee20ca2 Phase 2: Wire up Supabase, build all pages, make Add Event functional
4cddc9a Add placeholder pages for Schedule, Training, Nutrition, Community
21300aa Initialize Apex Gym OS Phase 1 with schema, auth, dashboard, and timeline UI
77d6118 Initial commit from Create Next App
```

---

## 25. Test Accounts

| Role | Email | Password | UUID |
|------|-------|----------|------|
| Admin/Coach | gabadub123@gmail.com | 123123 | `628428c2-c1d9-4dd2-a708-47face6bb633` |
| Client | adriantitkovbjj@gmail.com | 123123 | `5136ed05-d080-4af1-b088-7e89f5035017` |

---

## 26. Key Design Decisions

1. **No API routes.** Everything is Server Actions or Server Components. Keeps the codebase flat, no endpoint management, mutations are co-located with the UI that triggers them.

2. **JSONB on timeline_events.** Rather than 8 separate tables for each event type, one table with a typed `metadata` JSONB column. Each type has a TypeScript interface for its metadata shape. Flexible for future event types.

3. **RLS is the access layer.** Business logic lives in the database, not the application. `is_admin()` and `is_coach_of()` SQL functions keep policies readable and DRY.

4. **`getClients()` is always role-aware.** Every page that shows clients calls this one function. Admin gets all, coach gets assigned, client role returns empty. No conditional logic scattered across pages.

5. **Bilateral prescription pattern is the core product value.** Coach "prescribes" (templates, nutrition targets via timeline, medications), client "logs actuals" (check-ins, workout logs, goals). The two flows are linked but separate tables — prescription is immutable intent, logs are real-world data.

6. **Onboarding is middleware-enforced.** The gate happens at the HTTP level in middleware, not in the page component. Can't be bypassed by navigating directly.

7. **`upsert` for daily check-ins.** One check-in per client per day enforced at DB level (`UNIQUE(client_id, date)`). Submitting twice updates rather than errors. Keeps the form simple — no "already submitted" detection needed on the client.
