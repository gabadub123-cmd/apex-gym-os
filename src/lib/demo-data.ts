import type {
  Profile,
  TimelineEvent,
  Medication,
  ClientGoal,
  ClientMetric,
} from "@/lib/types/database";

export const demoClients: Profile[] = [
  {
    id: "00000000-0000-0000-0000-000000000003",
    role: "client",
    first_name: "Sophie",
    last_name: "Anderson",
    email: "sophie@example.com",
    phone: null,
    avatar_url: null,
    date_of_birth: "1995-03-10",
    gender: "female",
    bio: null,
    onboarding_completed: true,
    created_at: "2025-08-15T00:00:00Z",
    updated_at: "2026-05-06T00:00:00Z",
  },
  {
    id: "00000000-0000-0000-0000-000000000004",
    role: "client",
    first_name: "Jake",
    last_name: "Thompson",
    email: "jake@example.com",
    phone: null,
    avatar_url: null,
    date_of_birth: "1992-11-05",
    gender: "male",
    bio: null,
    onboarding_completed: true,
    created_at: "2025-09-20T00:00:00Z",
    updated_at: "2026-05-06T00:00:00Z",
  },
];

export const demoTimelineEvents: TimelineEvent[] = [
  {
    id: "evt-01",
    client_id: "00000000-0000-0000-0000-000000000003",
    event_type: "phase_change",
    title: "Started Bulk Phase",
    description: "Off-season mass building block. Focus on progressive overload.",
    event_date: "2025-09-01",
    metadata: { phase: "bulk", target_weight_kg: 62, calorie_target: 2400 },
    created_by: "00000000-0000-0000-0000-000000000002",
    created_at: "2025-09-01T00:00:00Z",
    updated_at: "2025-09-01T00:00:00Z",
  },
  {
    id: "evt-02",
    client_id: "00000000-0000-0000-0000-000000000003",
    event_type: "nutrition_change",
    title: "Macros Adjusted",
    description: "Increased carbs for training volume support.",
    event_date: "2025-09-15",
    metadata: { protein_g: 140, carbs_g: 280, fat_g: 65 },
    created_by: "00000000-0000-0000-0000-000000000002",
    created_at: "2025-09-15T00:00:00Z",
    updated_at: "2025-09-15T00:00:00Z",
  },
  {
    id: "evt-03",
    client_id: "00000000-0000-0000-0000-000000000003",
    event_type: "supplement_change",
    title: "Added Creatine",
    description: "Starting creatine monohydrate loading phase.",
    event_date: "2025-09-20",
    metadata: { supplement: "Creatine Monohydrate", dosage: "5g", frequency: "daily" },
    created_by: "00000000-0000-0000-0000-000000000002",
    created_at: "2025-09-20T00:00:00Z",
    updated_at: "2025-09-20T00:00:00Z",
  },
  {
    id: "evt-04",
    client_id: "00000000-0000-0000-0000-000000000003",
    event_type: "measurement",
    title: "Body Composition Check",
    description: "DEXA scan results from clinic.",
    event_date: "2025-10-15",
    metadata: { weight_kg: 59.2, body_fat_pct: 18.5, lean_mass_kg: 48.2 },
    created_by: "00000000-0000-0000-0000-000000000002",
    created_at: "2025-10-15T00:00:00Z",
    updated_at: "2025-10-15T00:00:00Z",
  },
  {
    id: "evt-05",
    client_id: "00000000-0000-0000-0000-000000000003",
    event_type: "milestone",
    title: "Hit 100kg Squat PR",
    description: "First time squatting triple digits!",
    event_date: "2025-11-02",
    metadata: { exercise: "Back Squat", weight_kg: 100, reps: 1 },
    created_by: "00000000-0000-0000-0000-000000000002",
    created_at: "2025-11-02T00:00:00Z",
    updated_at: "2025-11-02T00:00:00Z",
  },
  {
    id: "evt-06",
    client_id: "00000000-0000-0000-0000-000000000003",
    event_type: "phase_change",
    title: "Transitioned to Cut",
    description: "Starting 16-week contest prep for Spring Classic.",
    event_date: "2026-01-06",
    metadata: { phase: "cut", target_weight_kg: 54, calorie_target: 1800, competition: "Spring Classic 2026" },
    created_by: "00000000-0000-0000-0000-000000000002",
    created_at: "2026-01-06T00:00:00Z",
    updated_at: "2026-01-06T00:00:00Z",
  },
  {
    id: "evt-07",
    client_id: "00000000-0000-0000-0000-000000000003",
    event_type: "medication_change",
    title: "Started Fat Burner Stack",
    description: "Added thermogenic support for prep.",
    event_date: "2026-01-20",
    metadata: { medication: "Thermogenic Complex", dosage: "2 caps", frequency: "morning + pre-workout", type: "supplement" },
    created_by: "00000000-0000-0000-0000-000000000002",
    created_at: "2026-01-20T00:00:00Z",
    updated_at: "2026-01-20T00:00:00Z",
  },
  {
    id: "evt-08",
    client_id: "00000000-0000-0000-0000-000000000003",
    event_type: "nutrition_change",
    title: "Prep Diet Phase 2",
    description: "Dropped carbs, increased protein for deficit.",
    event_date: "2026-02-17",
    metadata: { protein_g: 155, carbs_g: 180, fat_g: 50, calories: 1790 },
    created_by: "00000000-0000-0000-0000-000000000002",
    created_at: "2026-02-17T00:00:00Z",
    updated_at: "2026-02-17T00:00:00Z",
  },
  {
    id: "evt-09",
    client_id: "00000000-0000-0000-0000-000000000003",
    event_type: "note",
    title: "Feeling great mentally",
    description: "Client reports high motivation despite caloric deficit. Sleep is good.",
    event_date: "2026-03-01",
    metadata: {},
    created_by: "00000000-0000-0000-0000-000000000002",
    created_at: "2026-03-01T00:00:00Z",
    updated_at: "2026-03-01T00:00:00Z",
  },
  {
    id: "evt-10",
    client_id: "00000000-0000-0000-0000-000000000003",
    event_type: "competition",
    title: "Spring Classic 2026",
    description: "Bikini division — first competition!",
    event_date: "2026-05-10",
    metadata: { federation: "NPC", division: "Bikini", location: "Amsterdam" },
    created_by: "00000000-0000-0000-0000-000000000002",
    created_at: "2026-05-10T00:00:00Z",
    updated_at: "2026-05-10T00:00:00Z",
  },
  {
    id: "evt-11",
    client_id: "00000000-0000-0000-0000-000000000004",
    event_type: "phase_change",
    title: "Started Maintenance",
    description: "Holding weight after previous bulk. Focusing on strength.",
    event_date: "2025-10-01",
    metadata: { phase: "maintenance", calorie_target: 2800 },
    created_by: "00000000-0000-0000-0000-000000000002",
    created_at: "2025-10-01T00:00:00Z",
    updated_at: "2025-10-01T00:00:00Z",
  },
  {
    id: "evt-12",
    client_id: "00000000-0000-0000-0000-000000000004",
    event_type: "medication_change",
    title: "TRT Protocol Start",
    description: "Started testosterone replacement therapy under medical supervision.",
    event_date: "2025-11-15",
    metadata: { medication: "Testosterone Cypionate", dosage: "150mg", frequency: "weekly", type: "ped", prescriber: "Dr. van den Berg" },
    created_by: "00000000-0000-0000-0000-000000000002",
    created_at: "2025-11-15T00:00:00Z",
    updated_at: "2025-11-15T00:00:00Z",
  },
  {
    id: "evt-13",
    client_id: "00000000-0000-0000-0000-000000000004",
    event_type: "milestone",
    title: "Deadlift 200kg",
    description: "Hit a 200kg conventional deadlift — 2x bodyweight!",
    event_date: "2026-01-12",
    metadata: { exercise: "Conventional Deadlift", weight_kg: 200, reps: 1, bodyweight_kg: 98 },
    created_by: "00000000-0000-0000-0000-000000000002",
    created_at: "2026-01-12T00:00:00Z",
    updated_at: "2026-01-12T00:00:00Z",
  },
  {
    id: "evt-14",
    client_id: "00000000-0000-0000-0000-000000000004",
    event_type: "phase_change",
    title: "Started Lean Bulk",
    description: "Slowly adding mass. 300kcal surplus.",
    event_date: "2026-02-01",
    metadata: { phase: "bulk", calorie_target: 3100, surplus: 300 },
    created_by: "00000000-0000-0000-0000-000000000002",
    created_at: "2026-02-01T00:00:00Z",
    updated_at: "2026-02-01T00:00:00Z",
  },
];

export const demoMedications: Medication[] = [
  {
    id: "med-01",
    client_id: "00000000-0000-0000-0000-000000000003",
    name: "Creatine Monohydrate",
    type: "supplement",
    dosage: "5",
    dosage_unit: "g",
    frequency: "daily",
    start_date: "2025-09-20",
    end_date: null,
    active: true,
    notes: null,
    created_by: "00000000-0000-0000-0000-000000000002",
    created_at: "2025-09-20T00:00:00Z",
    updated_at: "2025-09-20T00:00:00Z",
  },
  {
    id: "med-02",
    client_id: "00000000-0000-0000-0000-000000000003",
    name: "Whey Protein Isolate",
    type: "supplement",
    dosage: "30",
    dosage_unit: "g",
    frequency: "2x daily",
    start_date: "2025-09-01",
    end_date: null,
    active: true,
    notes: null,
    created_by: "00000000-0000-0000-0000-000000000002",
    created_at: "2025-09-01T00:00:00Z",
    updated_at: "2025-09-01T00:00:00Z",
  },
  {
    id: "med-03",
    client_id: "00000000-0000-0000-0000-000000000004",
    name: "Testosterone Cypionate",
    type: "ped",
    dosage: "150",
    dosage_unit: "mg",
    frequency: "weekly",
    start_date: "2025-11-15",
    end_date: null,
    active: true,
    notes: null,
    created_by: "00000000-0000-0000-0000-000000000002",
    created_at: "2025-11-15T00:00:00Z",
    updated_at: "2025-11-15T00:00:00Z",
  },
];

export const demoGoals: ClientGoal[] = [
  {
    id: "goal-01",
    client_id: "00000000-0000-0000-0000-000000000003",
    title: "Stage weight",
    description: "Reach competition weight for Spring Classic",
    target_date: "2026-05-10",
    target_value: "54 kg",
    current_value: "57.8 kg",
    completed: false,
    created_by: "00000000-0000-0000-0000-000000000002",
    created_at: "2026-01-06T00:00:00Z",
    updated_at: "2026-05-06T00:00:00Z",
  },
  {
    id: "goal-02",
    client_id: "00000000-0000-0000-0000-000000000003",
    title: "Posing practice",
    description: "Complete 12 posing sessions before show",
    target_date: "2026-05-01",
    target_value: "12 sessions",
    current_value: "4 sessions",
    completed: false,
    created_by: "00000000-0000-0000-0000-000000000002",
    created_at: "2026-01-06T00:00:00Z",
    updated_at: "2026-05-06T00:00:00Z",
  },
  {
    id: "goal-03",
    client_id: "00000000-0000-0000-0000-000000000004",
    title: "Squat 200kg",
    description: "Hit a 200kg back squat",
    target_date: "2026-06-30",
    target_value: "200 kg",
    current_value: "180 kg",
    completed: false,
    created_by: "00000000-0000-0000-0000-000000000002",
    created_at: "2025-10-01T00:00:00Z",
    updated_at: "2026-05-06T00:00:00Z",
  },
];

export const demoMetrics: ClientMetric[] = [
  { id: "m1", client_id: "00000000-0000-0000-0000-000000000003", date: "2026-04-30", weight_kg: 57.8, steps: 9200, sleep_hours: 7.5, sleep_quality: 4, stress_level: 2, hunger_level: 3, energy_level: 4, menstrual_phase: null, notes: null, created_at: "2026-04-30T00:00:00Z" },
  { id: "m2", client_id: "00000000-0000-0000-0000-000000000003", date: "2026-05-01", weight_kg: 58.1, steps: 8800, sleep_hours: 7.0, sleep_quality: 3, stress_level: 3, hunger_level: 4, energy_level: 3, menstrual_phase: null, notes: null, created_at: "2026-05-01T00:00:00Z" },
  { id: "m3", client_id: "00000000-0000-0000-0000-000000000003", date: "2026-05-02", weight_kg: 57.5, steps: 10100, sleep_hours: 8.0, sleep_quality: 5, stress_level: 2, hunger_level: 3, energy_level: 5, menstrual_phase: null, notes: null, created_at: "2026-05-02T00:00:00Z" },
  { id: "m4", client_id: "00000000-0000-0000-0000-000000000003", date: "2026-05-03", weight_kg: 57.9, steps: 7600, sleep_hours: 6.5, sleep_quality: 3, stress_level: 3, hunger_level: 4, energy_level: 3, menstrual_phase: null, notes: null, created_at: "2026-05-03T00:00:00Z" },
  { id: "m5", client_id: "00000000-0000-0000-0000-000000000003", date: "2026-05-04", weight_kg: 57.4, steps: 11200, sleep_hours: 7.5, sleep_quality: 4, stress_level: 2, hunger_level: 3, energy_level: 4, menstrual_phase: null, notes: null, created_at: "2026-05-04T00:00:00Z" },
  { id: "m6", client_id: "00000000-0000-0000-0000-000000000003", date: "2026-05-05", weight_kg: 57.6, steps: 9500, sleep_hours: 7.0, sleep_quality: 4, stress_level: 2, hunger_level: 3, energy_level: 4, menstrual_phase: null, notes: null, created_at: "2026-05-05T00:00:00Z" },
  { id: "m7", client_id: "00000000-0000-0000-0000-000000000003", date: "2026-05-06", weight_kg: 57.3, steps: 8900, sleep_hours: 7.5, sleep_quality: 4, stress_level: 1, hunger_level: 2, energy_level: 5, menstrual_phase: null, notes: null, created_at: "2026-05-06T00:00:00Z" },
];

export function getClientById(id: string): Profile | undefined {
  return demoClients.find((c) => c.id === id);
}

export function getTimelineForClient(clientId: string): TimelineEvent[] {
  return demoTimelineEvents
    .filter((e) => e.client_id === clientId)
    .sort((a, b) => new Date(b.event_date).getTime() - new Date(a.event_date).getTime());
}

export function getMedicationsForClient(clientId: string): Medication[] {
  return demoMedications.filter((m) => m.client_id === clientId);
}

export function getGoalsForClient(clientId: string): ClientGoal[] {
  return demoGoals.filter((g) => g.client_id === clientId);
}

export function getMetricsForClient(clientId: string): ClientMetric[] {
  return demoMetrics
    .filter((m) => m.client_id === clientId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getLatestPhase(clientId: string): string {
  const events = getTimelineForClient(clientId).filter(
    (e) => e.event_type === "phase_change"
  );
  if (events.length === 0) return "Unknown";
  const phase = (events[0].metadata as { phase?: string }).phase;
  return phase ? phase.charAt(0).toUpperCase() + phase.slice(1) : "Unknown";
}
