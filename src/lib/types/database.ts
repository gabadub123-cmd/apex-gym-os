export type UserRole = "admin" | "coach" | "client";

export type TimelineEventType =
  | "phase_change"
  | "medication_change"
  | "supplement_change"
  | "nutrition_change"
  | "milestone"
  | "competition"
  | "note"
  | "measurement";

export type MedicationType = "ped" | "supplement" | "medication";

export type CoachClientStatus = "active" | "inactive" | "pending";

export interface Profile {
  id: string;
  role: UserRole;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  avatar_url: string | null;
  date_of_birth: string | null;
  gender: string | null;
  bio: string | null;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface CoachClient {
  id: string;
  coach_id: string;
  client_id: string;
  status: CoachClientStatus;
  assigned_at: string;
  notes: string | null;
}

export interface TimelineEvent {
  id: string;
  client_id: string;
  event_type: TimelineEventType;
  title: string;
  description: string | null;
  event_date: string;
  metadata: Record<string, unknown>;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Medication {
  id: string;
  client_id: string;
  name: string;
  type: MedicationType;
  dosage: string | null;
  dosage_unit: string | null;
  frequency: string | null;
  start_date: string;
  end_date: string | null;
  active: boolean;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface ClientGoal {
  id: string;
  client_id: string;
  title: string;
  description: string | null;
  target_date: string | null;
  target_value: string | null;
  current_value: string | null;
  completed: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface ClientMetric {
  id: string;
  client_id: string;
  date: string;
  weight_kg: number | null;
  steps: number | null;
  sleep_hours: number | null;
  sleep_quality: number | null;
  stress_level: number | null;
  hunger_level: number | null;
  energy_level: number | null;
  menstrual_phase: string | null;
  notes: string | null;
  created_at: string;
}

export interface PhaseChangeMetadata {
  phase: string;
  target_weight_kg?: number;
  calorie_target?: number;
  competition?: string;
  surplus?: number;
}

export interface NutritionChangeMetadata {
  protein_g?: number;
  carbs_g?: number;
  fat_g?: number;
  calories?: number;
}

export interface MedicationChangeMetadata {
  medication: string;
  dosage: string;
  frequency: string;
  type?: string;
  prescriber?: string;
}

export interface MeasurementMetadata {
  weight_kg?: number;
  body_fat_pct?: number;
  lean_mass_kg?: number;
}

export interface MilestoneMetadata {
  exercise?: string;
  weight_kg?: number;
  reps?: number;
  bodyweight_kg?: number;
}

export interface CompetitionMetadata {
  federation?: string;
  division?: string;
  location?: string;
  placement?: string;
}

export interface SupplementChangeMetadata {
  supplement: string;
  dosage: string;
  frequency: string;
}

// ─── Training Engine ───

export type ExerciseCategory =
  | "chest"
  | "back"
  | "shoulders"
  | "legs"
  | "arms"
  | "core"
  | "cardio"
  | "compound"
  | "other";

export interface Exercise {
  id: string;
  name: string;
  category: ExerciseCategory;
  video_url: string | null;
  instructions: string | null;
  created_by: string | null;
  created_at: string;
}

export interface WorkoutTemplate {
  id: string;
  coach_id: string;
  client_id: string;
  name: string;
  day_label: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface WorkoutTemplateExercise {
  id: string;
  template_id: string;
  exercise_id: string;
  order_index: number;
  sets: number;
  reps: string;
  weight_kg: number | null;
  tempo: string | null;
  rest_seconds: number | null;
  notes: string | null;
  exercise?: Exercise;
}

export interface WorkoutLog {
  id: string;
  client_id: string;
  template_id: string | null;
  name: string;
  date: string;
  duration_minutes: number | null;
  notes: string | null;
  created_at: string;
}

export interface WorkoutLogSet {
  id: string;
  log_id: string;
  exercise_id: string;
  set_number: number;
  reps: number | null;
  weight_kg: number | null;
  rpe: number | null;
  notes: string | null;
  exercise?: Exercise;
}

// ─── Nutrition Logger ───

export type MealType = "breakfast" | "lunch" | "dinner" | "snack";

export interface FoodLog {
  id: string;
  client_id: string;
  date: string;
  meal: MealType;
  food_name: string;
  protein_g: number | null;
  carbs_g: number | null;
  fat_g: number | null;
  calories: number | null;
  created_at: string;
}

export interface WaterLog {
  id: string;
  client_id: string;
  date: string;
  amount_ml: number;
  created_at: string;
}
