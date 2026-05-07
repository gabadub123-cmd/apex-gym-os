-- Apex Gym OS — Seed Data
-- Use these UUIDs for local dev. In production, users come from Supabase Auth.

-- Insert directly into profiles (bypasses the auth trigger for seeding)
insert into public.profiles (id, role, first_name, last_name, email, gender, date_of_birth) values
  ('00000000-0000-0000-0000-000000000001', 'admin', 'Admin', 'User', 'admin@apexgym.com', 'male', '1990-01-15'),
  ('00000000-0000-0000-0000-000000000002', 'coach', 'Marcus', 'Rivera', 'marcus@apexgym.com', 'male', '1988-06-22'),
  ('00000000-0000-0000-0000-000000000003', 'client', 'Sophie', 'Anderson', 'sophie@example.com', 'female', '1995-03-10'),
  ('00000000-0000-0000-0000-000000000004', 'client', 'Jake', 'Thompson', 'jake@example.com', 'male', '1992-11-05');

-- Assign coach to clients
insert into public.coach_clients (coach_id, client_id, status) values
  ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000003', 'active'),
  ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000004', 'active');

-- Sophie's timeline: Competition prep journey
insert into public.timeline_events (client_id, event_type, title, description, event_date, metadata, created_by) values
  ('00000000-0000-0000-0000-000000000003', 'phase_change', 'Started Bulk Phase', 'Off-season mass building block. Focus on progressive overload.', '2025-09-01',
   '{"phase": "bulk", "target_weight_kg": 62, "calorie_target": 2400}',
   '00000000-0000-0000-0000-000000000002'),

  ('00000000-0000-0000-0000-000000000003', 'nutrition_change', 'Macros Adjusted', 'Increased carbs for training volume support.', '2025-09-15',
   '{"protein_g": 140, "carbs_g": 280, "fat_g": 65}',
   '00000000-0000-0000-0000-000000000002'),

  ('00000000-0000-0000-0000-000000000003', 'supplement_change', 'Added Creatine', 'Starting creatine monohydrate loading phase.', '2025-09-20',
   '{"supplement": "Creatine Monohydrate", "dosage": "5g", "frequency": "daily"}',
   '00000000-0000-0000-0000-000000000002'),

  ('00000000-0000-0000-0000-000000000003', 'measurement', 'Body Composition Check', 'DEXA scan results from clinic.', '2025-10-15',
   '{"weight_kg": 59.2, "body_fat_pct": 18.5, "lean_mass_kg": 48.2}',
   '00000000-0000-0000-0000-000000000002'),

  ('00000000-0000-0000-0000-000000000003', 'milestone', 'Hit 100kg Squat PR', 'First time squatting triple digits!', '2025-11-02',
   '{"exercise": "Back Squat", "weight_kg": 100, "reps": 1}',
   '00000000-0000-0000-0000-000000000002'),

  ('00000000-0000-0000-0000-000000000003', 'phase_change', 'Transitioned to Cut', 'Starting 16-week contest prep for Spring Classic.', '2026-01-06',
   '{"phase": "cut", "target_weight_kg": 54, "calorie_target": 1800, "competition": "Spring Classic 2026"}',
   '00000000-0000-0000-0000-000000000002'),

  ('00000000-0000-0000-0000-000000000003', 'medication_change', 'Started Fat Burner Stack', 'Added thermogenic support for prep.', '2026-01-20',
   '{"medication": "Thermogenic Complex", "dosage": "2 caps", "frequency": "morning + pre-workout", "type": "supplement"}',
   '00000000-0000-0000-0000-000000000002'),

  ('00000000-0000-0000-0000-000000000003', 'nutrition_change', 'Prep Diet Phase 2', 'Dropped carbs, increased protein for deficit.', '2026-02-17',
   '{"protein_g": 155, "carbs_g": 180, "fat_g": 50, "calories": 1790}',
   '00000000-0000-0000-0000-000000000002'),

  ('00000000-0000-0000-0000-000000000003', 'competition', 'Spring Classic 2026', 'Bikini division — first competition!', '2026-05-10',
   '{"federation": "NPC", "division": "Bikini", "location": "Amsterdam"}',
   '00000000-0000-0000-0000-000000000002'),

  ('00000000-0000-0000-0000-000000000003', 'note', 'Feeling great mentally', 'Client reports high motivation despite caloric deficit. Sleep is good.', '2026-03-01',
   '{}',
   '00000000-0000-0000-0000-000000000002');

-- Jake's timeline: Strength-focused client
insert into public.timeline_events (client_id, event_type, title, description, event_date, metadata, created_by) values
  ('00000000-0000-0000-0000-000000000004', 'phase_change', 'Started Maintenance', 'Holding weight after previous bulk. Focusing on strength.', '2025-10-01',
   '{"phase": "maintenance", "calorie_target": 2800}',
   '00000000-0000-0000-0000-000000000002'),

  ('00000000-0000-0000-0000-000000000004', 'medication_change', 'TRT Protocol Start', 'Started testosterone replacement therapy under medical supervision.', '2025-11-15',
   '{"medication": "Testosterone Cypionate", "dosage": "150mg", "frequency": "weekly", "type": "ped", "prescriber": "Dr. van den Berg"}',
   '00000000-0000-0000-0000-000000000002'),

  ('00000000-0000-0000-0000-000000000004', 'milestone', 'Deadlift 200kg', 'Hit a 200kg conventional deadlift — 2x bodyweight!', '2026-01-12',
   '{"exercise": "Conventional Deadlift", "weight_kg": 200, "reps": 1, "bodyweight_kg": 98}',
   '00000000-0000-0000-0000-000000000002'),

  ('00000000-0000-0000-0000-000000000004', 'phase_change', 'Started Lean Bulk', 'Slowly adding mass. 300kcal surplus.', '2026-02-01',
   '{"phase": "bulk", "calorie_target": 3100, "surplus": 300}',
   '00000000-0000-0000-0000-000000000002');

-- Sophie's medications
insert into public.medications (client_id, name, type, dosage, dosage_unit, frequency, start_date, active, created_by) values
  ('00000000-0000-0000-0000-000000000003', 'Creatine Monohydrate', 'supplement', '5', 'g', 'daily', '2025-09-20', true, '00000000-0000-0000-0000-000000000002'),
  ('00000000-0000-0000-0000-000000000003', 'Whey Protein Isolate', 'supplement', '30', 'g', '2x daily', '2025-09-01', true, '00000000-0000-0000-0000-000000000002'),
  ('00000000-0000-0000-0000-000000000003', 'Thermogenic Complex', 'supplement', '2', 'caps', '2x daily', '2026-01-20', true, '00000000-0000-0000-0000-000000000002');

-- Jake's medications
insert into public.medications (client_id, name, type, dosage, dosage_unit, frequency, start_date, active, created_by) values
  ('00000000-0000-0000-0000-000000000004', 'Testosterone Cypionate', 'ped', '150', 'mg', 'weekly', '2025-11-15', true, '00000000-0000-0000-0000-000000000002'),
  ('00000000-0000-0000-0000-000000000004', 'Omega-3 Fish Oil', 'supplement', '3', 'g', 'daily', '2025-10-01', true, '00000000-0000-0000-0000-000000000002');

-- Client goals
insert into public.client_goals (client_id, title, description, target_date, target_value, current_value, completed, created_by) values
  ('00000000-0000-0000-0000-000000000003', 'Stage weight', 'Reach competition weight for Spring Classic', '2026-05-10', '54 kg', '57.8 kg', false, '00000000-0000-0000-0000-000000000002'),
  ('00000000-0000-0000-0000-000000000003', 'Posing practice', 'Complete 12 posing sessions before show', '2026-05-01', '12 sessions', '4 sessions', false, '00000000-0000-0000-0000-000000000002'),
  ('00000000-0000-0000-0000-000000000004', 'Squat 200kg', 'Hit a 200kg back squat', '2026-06-30', '200 kg', '180 kg', false, '00000000-0000-0000-0000-000000000002');

-- Sample daily metrics for Sophie (last 7 days for rolling average demo)
insert into public.client_metrics (client_id, date, weight_kg, steps, sleep_hours, sleep_quality, stress_level, hunger_level, energy_level) values
  ('00000000-0000-0000-0000-000000000003', '2026-04-30', 57.8, 9200, 7.5, 4, 2, 3, 4),
  ('00000000-0000-0000-0000-000000000003', '2026-05-01', 58.1, 8800, 7.0, 3, 3, 4, 3),
  ('00000000-0000-0000-0000-000000000003', '2026-05-02', 57.5, 10100, 8.0, 5, 2, 3, 5),
  ('00000000-0000-0000-0000-000000000003', '2026-05-03', 57.9, 7600, 6.5, 3, 3, 4, 3),
  ('00000000-0000-0000-0000-000000000003', '2026-05-04', 57.4, 11200, 7.5, 4, 2, 3, 4),
  ('00000000-0000-0000-0000-000000000003', '2026-05-05', 57.6, 9500, 7.0, 4, 2, 3, 4),
  ('00000000-0000-0000-0000-000000000003', '2026-05-06', 57.3, 8900, 7.5, 4, 1, 2, 5);
