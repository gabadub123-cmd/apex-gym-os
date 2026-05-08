# Apex Gym OS — Build Log & Reference

> Last updated: 2026-05-08  
> GitHub: https://github.com/gabadub123-cmd/apex-gym-os  
> Vercel: auto-deploys on push to `main`  
> Supabase project: connected via env vars on Vercel

---

## Overview

SaaS gym coaching platform replacing spreadsheet-based client management. Built for a gym coach to manage multiple clients with full visibility into their training, nutrition, check-ins, medications/supplements, and timeline of phase changes.

**Three-tier role system:**
- `admin` — full access to everything, user management, coach assignments
- `coach` — manages assigned clients, prescribes workouts/nutrition, views check-ins
- `client` — sees own data, logs check-ins, logs workouts, adds goals

---

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 16 App Router (TypeScript) |
| Styling | Tailwind CSS v4 |
| UI Components | Shadcn UI v4 (Base UI primitives — NOT Radix) |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth (email/password + Google OAuth) |
| Hosting | Vercel (auto-deploy from GitHub) |
| ORM | Supabase JS client with typed queries |

**Important Shadcn v4 caveat:** Does NOT support `asChild`. Use native Trigger components and `buttonVariants` className instead of wrapping in `<Button asChild>`.

---

## Accounts (Supabase)

| Role | Email | Password | UUID |
|------|-------|----------|------|
| Admin/Coach | gabadub123@gmail.com | 123123 | `628428c2-c1d9-4dd2-a708-47face6bb633` |
| Client | adriantitkovbjj@gmail.com | 123123 | `5136ed05-d080-4af1-b088-7e89f5035017` |
| Test | test111@test.com | — | `a0eb0b72-f3a1-4145-a934-132bd2312e81` |

---

## File Structure

```
src/
├── app/
│   ├── (auth)/login/page.tsx         ← Login + Register + Google OAuth
│   ├── auth/callback/route.ts        ← Google OAuth callback handler
│   ├── onboarding/page.tsx           ← 4-step client onboarding (video-gated)
│   ├── dashboard/
│   │   ├── layout.tsx                ← Sidebar + topbar shell
│   │   ├── page.tsx                  ← Role-aware dashboard (coach/client views)
│   │   ├── admin/page.tsx            ← Admin panel: users + assignments
│   │   ├── clients/page.tsx          ← Client list (coach/admin)
│   │   ├── clients/[id]/page.tsx     ← Client profile + timeline + check-in
│   │   ├── training/page.tsx         ← Training engine (role-aware)
│   │   ├── nutrition/page.tsx        ← Nutrition targets overview
│   │   ├── schedule/page.tsx         ← Calendar + event overview
│   │   ├── settings/page.tsx         ← Profile settings
│   │   ├── community/page.tsx        ← Placeholder (future)
│   │   └── shop/page.tsx             ← Placeholder (future)
├── components/
│   ├── layout/
│   │   ├── sidebar.tsx               ← Role-filtered nav sidebar
│   │   ├── topbar.tsx                ← User avatar + logout
│   │   └── nav-items.ts              ← Nav config with role restrictions
│   ├── timeline/
│   │   ├── timeline.tsx              ← Vertical timeline component
│   │   ├── timeline-event.tsx        ← Single event card
│   │   ├── timeline-filter.tsx       ← Filter by event type
│   │   └── add-event-dialog.tsx      ← Add event form (coach)
│   ├── checkin/
│   │   ├── checkin-form.tsx          ← Daily check-in (weight, steps, sleep, ratings)
│   │   └── checkin-history.tsx       ← Check-in log display
│   ├── clients/
│   │   ├── client-card.tsx           ← Client list card
│   │   ├── client-profile-header.tsx ← Profile header with stats
│   │   └── add-goal-form.tsx         ← Inline goal creation (client-side)
│   ├── training/
│   │   ├── add-exercise-form.tsx     ← Add exercise to library
│   │   ├── exercise-library.tsx      ← Searchable exercise list
│   │   ├── create-template-form.tsx  ← Coach builds workout plan
│   │   ├── log-workout-form.tsx      ← Client logs actual workout
│   │   ├── workout-history.tsx       ← Timeline of logged workouts
│   │   └── training-coach-view.tsx   ← Coach's template builder UI
│   ├── admin/
│   │   ├── admin-user-table.tsx      ← Manage user roles
│   │   └── admin-assignments.tsx     ← Coach ↔ Client assignment UI
│   └── settings/
│       └── settings-form.tsx         ← Profile edit form
├── lib/
│   ├── supabase/
│   │   ├── client.ts                 ← Browser Supabase client
│   │   ├── server.ts                 ← Server component Supabase client
│   │   ├── middleware.ts             ← Auth + onboarding gating
│   │   ├── queries.ts                ← All read queries (server-side)
│   │   └── actions.ts                ← All server actions (mutations)
│   └── types/database.ts             ← TypeScript types for all tables
└── middleware.ts                     ← Next.js middleware entry
```

---

## Database Schema

### Original Tables (schema.sql — already deployed)

```sql
profiles          -- extends auth.users; role, name, avatar, DOB, gender, bio, onboarding_completed
coach_clients     -- links coaches to clients; status (active/inactive/pending)
timeline_events   -- Command Center; event_type enum + JSONB metadata
medications       -- PEDs/supplements/medications; dosage, frequency, active flag
client_goals      -- goals per client; target_value, current_value, completed
client_metrics    -- daily check-in data; weight, steps, sleep, energy, stress, hunger
```

### Migration 1 — Onboarding (run manually ✅)

```sql
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarding_completed boolean DEFAULT false;
UPDATE profiles SET onboarding_completed = true;

-- Client can insert own goals
CREATE POLICY "clients_insert_own_goals" ON client_goals
  FOR INSERT WITH CHECK (auth.uid() = client_id);

-- Client can insert own notes/milestones
CREATE POLICY "clients_insert_own_events" ON timeline_events
  FOR INSERT WITH CHECK (auth.uid() = client_id AND event_type IN ('note','milestone'));

-- Client can update own profile (for onboarding)
CREATE POLICY "clients_update_own_profile" ON profiles
  FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
```

### Migration 2 — Training Engine (⚠️ NEEDS TO BE RUN)

```sql
-- Exercise Library
CREATE TABLE exercises (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL DEFAULT 'other',
  video_url text,
  instructions text,
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now()
);

-- Workout Templates (Coach prescribes)
CREATE TABLE workout_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id uuid NOT NULL REFERENCES profiles(id),
  client_id uuid NOT NULL REFERENCES profiles(id),
  name text NOT NULL,
  day_label text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE workout_template_exercises (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id uuid NOT NULL REFERENCES workout_templates(id) ON DELETE CASCADE,
  exercise_id uuid NOT NULL REFERENCES exercises(id),
  order_index int NOT NULL DEFAULT 0,
  sets int NOT NULL DEFAULT 3,
  reps text NOT NULL DEFAULT '10',
  weight_kg numeric,
  tempo text,
  rest_seconds int,
  notes text
);

-- Workout Logs (Client fills in actuals)
CREATE TABLE workout_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES profiles(id),
  template_id uuid REFERENCES workout_templates(id),
  name text NOT NULL,
  date date NOT NULL DEFAULT CURRENT_DATE,
  duration_minutes int,
  notes text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE workout_log_sets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  log_id uuid NOT NULL REFERENCES workout_logs(id) ON DELETE CASCADE,
  exercise_id uuid NOT NULL REFERENCES exercises(id),
  set_number int NOT NULL DEFAULT 1,
  reps int,
  weight_kg numeric,
  rpe numeric,
  notes text
);

-- RLS
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_template_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_log_sets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "exercises_select" ON exercises FOR SELECT USING (true);
CREATE POLICY "exercises_insert" ON exercises FOR INSERT WITH CHECK (true);

CREATE POLICY "templates_select" ON workout_templates FOR SELECT USING (
  coach_id = auth.uid() OR client_id = auth.uid()
  OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "templates_insert" ON workout_templates FOR INSERT WITH CHECK (true);

CREATE POLICY "template_ex_select" ON workout_template_exercises FOR SELECT USING (
  EXISTS (SELECT 1 FROM workout_templates wt WHERE wt.id = template_id
    AND (wt.coach_id = auth.uid() OR wt.client_id = auth.uid()
         OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')))
);
CREATE POLICY "template_ex_insert" ON workout_template_exercises FOR INSERT WITH CHECK (true);

CREATE POLICY "logs_select" ON workout_logs FOR SELECT USING (
  client_id = auth.uid()
  OR EXISTS (SELECT 1 FROM coach_clients cc WHERE cc.client_id = workout_logs.client_id AND cc.coach_id = auth.uid() AND cc.status = 'active')
  OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "logs_insert" ON workout_logs FOR INSERT WITH CHECK (true);

CREATE POLICY "log_sets_select" ON workout_log_sets FOR SELECT USING (
  EXISTS (SELECT 1 FROM workout_logs wl WHERE wl.id = log_id
    AND (wl.client_id = auth.uid()
         OR EXISTS (SELECT 1 FROM coach_clients cc WHERE cc.client_id = wl.client_id AND cc.coach_id = auth.uid() AND cc.status = 'active')
         OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')))
);
CREATE POLICY "log_sets_insert" ON workout_log_sets FOR INSERT WITH CHECK (true);
```

---

## Features Built

### ✅ Auth & Onboarding
- Email/password login + registration (first/last name captured on signup)
- Google OAuth sign-in with `/auth/callback` handler
- Middleware gates: unauthenticated → `/login`, unboarded clients → `/onboarding`
- 4-step onboarding: welcome → video gate → profile (phone/DOB/gender/bio) → first goal

### ✅ Dashboard (Role-Aware)
- **Coach/Admin:** stat cards (client count, events this week, active goals, upcoming), upcoming events list, client quick links
- **Client:** phase badge, weight + 7-day average, daily check-in form, macro targets, recent activity, goals sidebar, meds sidebar, weight log

### ✅ Client Profile (`/dashboard/clients/[id]`)
- Profile header: avatar initials, current phase badge, goal count, active med count, 7-day weight chart
- Full vertical timeline with type icons + expandable JSONB metadata
- Add Event dialog: type-specific forms for all 8 event types
- Daily check-in form (coach can log on behalf of client)
- Check-in history (last 30 entries with color-coded ratings)
- Active goals sidebar
- Active medications & supplements sidebar
- Weight log (7 days)

### ✅ Timeline / Command Center
- Events: `phase_change`, `medication_change`, `supplement_change`, `nutrition_change`, `milestone`, `competition`, `note`, `measurement`
- Each has JSONB metadata (phase name, macros, dosage, exercise/weight/reps, federation/division, etc.)
- Filter by event type
- Clients can add `note` and `milestone` events themselves

### ✅ Daily Check-in System
- Fields: weight (kg), steps, sleep hours, sleep quality (1-5), energy (1-5), hunger (1-5), stress (1-5), notes
- Upserts on `client_id + date` — no duplicates
- Color-coded ratings (green ≥4, amber =3, red ≤2; stress inverted)

### ✅ Training Engine (bilateral)
- **Exercise Library:** name, category (compound/chest/back/shoulders/legs/arms/core/cardio/other), video URL, instructions; searchable
- **Coach side (Prescription):** Create workout templates per client — exercises, sets, reps target, weight target, tempo (e.g. 3010), rest seconds
- **Client side (Actual):** Log workouts against templates — actual reps, weight, RPE per set, duration
- Workout history timeline

### ✅ Nutrition Page
- **Coach view:** all clients' current macro targets (protein/carbs/fat/calories) with phase badge
- **Client view:** current macro targets set by coach + nutrition history

### ✅ Admin Panel (`/dashboard/admin`)
- User table: see all users with roles, one-click role change (admin/coach/client)
- Coach ↔ Client assignments: assign unassigned clients to coaches, remove assignments
- Stat cards: admin count, coach count, client count

### ✅ Schedule Page
- Coach: weekly event calendar + check-in tracker
- Client: own upcoming events

### ✅ Settings Page
- Edit first name, last name, phone, DOB, gender, bio — saves to Supabase

### ✅ Community & Shop
- Placeholder pages (future features)

---

## Key Server Actions (`src/lib/supabase/actions.ts`)

| Action | Description |
|--------|-------------|
| `addTimelineEvent` | Add event to client timeline |
| `submitDailyCheckin` | Upsert daily check-in metrics |
| `addMedication` | Add medication/supplement to client |
| `addGoal` | Add goal (coach or client) |
| `updateProfile` | Update own profile fields |
| `completeOnboarding` | Mark onboarding done + save profile + optional first goal |
| `assignClientToCoach` | Admin assigns client to coach |
| `removeClientFromCoach` | Admin removes assignment |
| `updateUserRole` | Admin changes any user's role |
| `addExercise` | Add exercise to library |
| `createWorkoutTemplate` | Coach creates workout plan for client |
| `logWorkout` | Client logs actual workout with sets |

---

## Key Queries (`src/lib/supabase/queries.ts`)

| Query | Description |
|-------|-------------|
| `getCurrentProfile` | Get logged-in user's profile |
| `getClients` | Role-aware: admin=all, coach=assigned only |
| `getClientById` | Single client profile |
| `getTimelineForClient` | All timeline events for a client |
| `getMedicationsForClient` | All meds for client |
| `getGoalsForClient` | All goals for client |
| `getMetricsForClient` | Daily check-ins (with limit) |
| `getLatestPhase` | Most recent phase_change event |
| `getDashboardStats` | Branches to coach or client stats |
| `getAllProfiles` | Admin: all users |
| `getCoaches` | All coach-role profiles |
| `getCoachAssignments` | All coach_clients rows |
| `getMyCoach` | Client: get assigned coach |
| `getExercises` | Exercise library |
| `getWorkoutTemplatesForClient` | Templates assigned to a client |
| `getTemplateExercises` | Exercises in a template (with join) |
| `getWorkoutLogsForClient` | Client's workout history |
| `getWorkoutLogSets` | Sets in a workout log (with join) |

---

## Bilateral Input Pattern

The core design principle — coach prescribes, client logs:

```
Coach sets (template)           Client logs (actual)
─────────────────────           ────────────────────
Squat: 4 × 5 @ 100kg           Squat Set 1: 5 reps × 102.5kg RPE 8
Bench: 3 × 8-12 @ 80kg         Bench Set 1: 10 reps × 80kg RPE 7
                                Bench Set 2: 9 reps × 80kg RPE 8
```

Same pattern for nutrition:
```
Coach sets (timeline event)     Client sees in dashboard
────────────────────────────    ────────────────────────
nutrition_change:               "Current Macro Targets"
  P: 155g C: 200g F: 55g       P: 155g | C: 200g | F: 55g | 1905kcal
```

---

## Still To Build

### 🔲 Nutrition Logger (next priority)
- Client logs daily food intake (meal, food name, protein/carbs/fat/calories)
- Water tracker (daily intake in ml or glasses)
- New tables: `food_logs`, `water_logs`
- UI: food log form with meal selector, macro total for the day vs target
- Coach view: client compliance overview

### 🔲 Default Exercise Seed
- Pre-populate exercise library with common exercises (Squat, Bench, Deadlift, OHP, Row, Pull-up, RDL, etc.)
- SQL insert block to run in Supabase

### 🔲 Training — Workout Template View on Client Profile
- Show assigned templates on `/dashboard/clients/[id]` for coach to review
- Show template details (exercises, targets) before client logs

### 🔲 Check-in Improvements
- Progress charts (weight trend line chart using recharts or similar)
- 7-day rolling average visualized
- Steps trend

### 🔲 Community Feed
- Announcement board (coach posts, clients see)
- New table: `community_posts` (author_id, content, pinned, created_at)
- Simple feed with reactions or likes

### 🔲 Medication Management UI
- Dedicated page/dialog to add/edit/deactivate medications from client profile
- Currently can only add via timeline event

### 🔲 Business Suite (future / Phase 3+)
- Stripe integration for client billing/subscriptions
- Invoice generation
- Session reservations / calendar booking

### 🔲 Mobile Sidebar
- Current sidebar is `hidden md:flex` — add hamburger menu for mobile
- Sheet/drawer component from Shadcn for mobile nav

### 🔲 Goal Management
- Mark goals as complete
- Edit current_value (progress updates)
- Goal completion history

### 🔲 Notifications
- In-app notifications when coach updates macros, adds event, etc.

---

## Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=https://[project-ref].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[anon-key]
```

Set on Vercel dashboard → Project Settings → Environment Variables.

---

## Git Commit History

```
271bd33 Add Training Engine: exercise library, workout templates, and workout logging
239f72d Add OAuth callback, onboarding flow, admin panel, and client goal creation
6de6105 Role-aware UI: client dashboard, daily check-in, coach check-in viewer
ee20ca2 Phase 2: Wire up Supabase, build all pages, make Add Event functional
4cddc9a Add placeholder pages for Schedule, Training, Nutrition, Community
21300aa Initialize Apex Gym OS Phase 1 with schema, auth, dashboard, and timeline UI
77d6118 Initial commit from Create Next App
```

---

## Architectural Decisions

1. **Server Components + Server Actions** — no API routes. Mutations use `"use server"` actions, reads use `async` server components. `useTransition` for pending states on the client.

2. **JSONB metadata on timeline_events** — flexible schema for each event type without extra tables. Each type has a typed metadata interface in `database.ts`.

3. **RLS via helper functions** — `is_admin()` and `is_coach_of(client_id)` SQL functions keep policies DRY and readable.

4. **Bilateral prescription model** — templates are "coach intent", logs are "client actual". The two are linked via `template_id` FK but are independent records.

5. **Onboarding gate in middleware** — checks `onboarding_completed` on every request for clients. Coaches/admins bypass it.

6. **`getClients()` is role-aware** — admin gets all clients, coach gets only assigned clients, client role returns `[]`. All pages that show client lists use this single function.
