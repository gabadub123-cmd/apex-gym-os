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
