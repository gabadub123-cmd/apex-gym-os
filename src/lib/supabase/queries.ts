"use server";

import { createClient } from "@/lib/supabase/server";
import type {
  Profile,
  TimelineEvent,
  Medication,
  ClientGoal,
  ClientMetric,
  Exercise,
  WorkoutTemplate,
  WorkoutTemplateExercise,
  FoodLog,
  WaterLog,
  WorkoutLog,
  WorkoutLogSet,
  ScheduledEvent,
} from "@/lib/types/database";

export async function getCurrentProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return data;
}

export async function getClients(): Promise<Profile[]> {
  const supabase = await createClient();
  const profile = await getCurrentProfile();
  if (!profile) return [];

  if (profile.role === "admin") {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("role", "client")
      .order("first_name");
    return data || [];
  }

  if (profile.role === "coach") {
    const { data: assignments } = await supabase
      .from("coach_clients")
      .select("client_id")
      .eq("coach_id", profile.id)
      .eq("status", "active");

    if (!assignments || assignments.length === 0) return [];

    const clientIds = assignments.map((a) => a.client_id);
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .in("id", clientIds)
      .order("first_name");
    return data || [];
  }

  return [];
}

export async function getClientById(id: string): Promise<Profile | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .single();
  return data;
}

export async function getTimelineForClient(
  clientId: string
): Promise<TimelineEvent[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("timeline_events")
    .select("*")
    .eq("client_id", clientId)
    .order("event_date", { ascending: false });
  return data || [];
}

export async function getMedicationsForClient(
  clientId: string
): Promise<Medication[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("medications")
    .select("*")
    .eq("client_id", clientId)
    .order("start_date", { ascending: false });
  return data || [];
}

export async function getGoalsForClient(
  clientId: string
): Promise<ClientGoal[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("client_goals")
    .select("*")
    .eq("client_id", clientId)
    .order("created_at", { ascending: false });
  return data || [];
}

export async function getMetricsForClient(
  clientId: string,
  limit = 7
): Promise<ClientMetric[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("client_metrics")
    .select("*")
    .eq("client_id", clientId)
    .order("date", { ascending: false })
    .limit(limit);
  return data || [];
}

export async function getLatestPhase(clientId: string): Promise<string> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("timeline_events")
    .select("metadata")
    .eq("client_id", clientId)
    .eq("event_type", "phase_change")
    .order("event_date", { ascending: false })
    .limit(1)
    .single();

  if (!data) return "Unknown";
  const phase = (data.metadata as { phase?: string })?.phase;
  return phase ? phase.charAt(0).toUpperCase() + phase.slice(1) : "Unknown";
}

export async function getDashboardStats() {
  const supabase = await createClient();
  const profile = await getCurrentProfile();
  if (!profile) return null;

  if (profile.role === "client") {
    return getClientDashboardStats(profile);
  }

  const clients = await getClients();
  const today = new Date().toISOString().split("T")[0];

  const { count: eventsThisWeek } = await supabase
    .from("timeline_events")
    .select("*", { count: "exact", head: true })
    .gte(
      "event_date",
      new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
    );

  const { count: activeGoals } = await supabase
    .from("client_goals")
    .select("*", { count: "exact", head: true })
    .eq("completed", false);

  const { data: upcomingEvents } = await supabase
    .from("timeline_events")
    .select("*")
    .gte("event_date", today)
    .order("event_date", { ascending: true })
    .limit(5);

  return {
    profile,
    type: "coach" as const,
    clientCount: clients.length,
    eventsThisWeek: eventsThisWeek || 0,
    activeGoals: activeGoals || 0,
    upcomingEvents: upcomingEvents || [],
    clients,
  };
}

async function getClientDashboardStats(profile: Profile) {
  const [metrics, goals, medications, events, phase] = await Promise.all([
    getMetricsForClient(profile.id, 30),
    getGoalsForClient(profile.id),
    getMedicationsForClient(profile.id),
    getTimelineForClient(profile.id),
    getLatestPhase(profile.id),
  ]);

  const today = new Date().toISOString().split("T")[0];
  const todayCheckin = metrics.find((m) => m.date === today);

  const last7 = metrics.slice(0, 7);
  const avgWeight =
    last7.length > 0
      ? last7.reduce((sum, m) => sum + (m.weight_kg || 0), 0) /
        last7.filter((m) => m.weight_kg).length
      : null;

  const latestNutrition = events.find(
    (e) => e.event_type === "nutrition_change"
  );

  return {
    profile,
    type: "client" as const,
    phase,
    metrics,
    todayCheckin,
    avgWeight,
    goals,
    medications: medications.filter((m) => m.active),
    events,
    latestNutrition,
    upcomingEvents: events.filter((e) => e.event_date >= today),
  };
}

export async function getAllProfiles(): Promise<Profile[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .order("role")
    .order("first_name");
  return data || [];
}

export async function getCoaches(): Promise<Profile[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("role", "coach")
    .order("first_name");
  return data || [];
}

export async function getCoachAssignments(): Promise<
  { coach_id: string; client_id: string; status: string }[]
> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("coach_clients")
    .select("coach_id, client_id, status");
  return data || [];
}

// ─── Training Engine Queries ───

export async function getExercises(): Promise<Exercise[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("exercises")
    .select("*")
    .order("category")
    .order("name");
  return data || [];
}

export async function getWorkoutTemplatesForClient(
  clientId: string
): Promise<WorkoutTemplate[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("workout_templates")
    .select("*")
    .eq("client_id", clientId)
    .order("created_at", { ascending: false });
  return data || [];
}

export async function getTemplateExercises(
  templateId: string
): Promise<WorkoutTemplateExercise[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("workout_template_exercises")
    .select("*, exercise:exercises(*)")
    .eq("template_id", templateId)
    .order("order_index");
  return data || [];
}

export async function getWorkoutLogsForClient(
  clientId: string,
  limit = 20
): Promise<WorkoutLog[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("workout_logs")
    .select("*")
    .eq("client_id", clientId)
    .order("date", { ascending: false })
    .limit(limit);
  return data || [];
}

export async function getWorkoutLogSets(
  logId: string
): Promise<WorkoutLogSet[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("workout_log_sets")
    .select("*, exercise:exercises(*)")
    .eq("log_id", logId)
    .order("set_number");
  return data || [];
}

// ─── Nutrition Logger Queries ───

export async function getFoodLogsForDate(
  clientId: string,
  date: string
): Promise<FoodLog[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("food_logs")
    .select("*")
    .eq("client_id", clientId)
    .eq("date", date)
    .order("created_at");
  return data || [];
}

export async function getFoodLogHistory(
  clientId: string,
  limit = 7
): Promise<{ date: string; protein: number; carbs: number; fat: number; calories: number }[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("food_logs")
    .select("date, protein_g, carbs_g, fat_g, calories")
    .eq("client_id", clientId)
    .order("date", { ascending: false })
    .limit(100);

  if (!data || data.length === 0) return [];

  const byDate: Record<string, { protein: number; carbs: number; fat: number; calories: number }> = {};
  for (const row of data) {
    if (!byDate[row.date]) byDate[row.date] = { protein: 0, carbs: 0, fat: 0, calories: 0 };
    byDate[row.date].protein += row.protein_g || 0;
    byDate[row.date].carbs += row.carbs_g || 0;
    byDate[row.date].fat += row.fat_g || 0;
    byDate[row.date].calories += row.calories || 0;
  }

  return Object.entries(byDate)
    .sort(([a], [b]) => b.localeCompare(a))
    .slice(0, limit)
    .map(([date, totals]) => ({ date, ...totals }));
}

export async function getWaterForDate(
  clientId: string,
  date: string
): Promise<number> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("water_logs")
    .select("amount_ml")
    .eq("client_id", clientId)
    .eq("date", date);

  if (!data || data.length === 0) return 0;
  return data.reduce((sum, r) => sum + r.amount_ml, 0);
}

// ─── Schedule Queries ───

export async function getScheduledEventsForWeek(
  startDate: string,
  endDate: string,
  clientId?: string
): Promise<ScheduledEvent[]> {
  const supabase = await createClient();
  const profile = await getCurrentProfile();
  if (!profile) return [];

  let query = supabase
    .from("scheduled_events")
    .select("*")
    .gte("event_date", startDate)
    .lte("event_date", endDate)
    .order("event_date")
    .order("start_time");

  if (profile.role === "client") {
    query = query.eq("client_id", profile.id);
  } else if (clientId) {
    query = query.eq("client_id", clientId);
  }

  const { data } = await query;
  return data || [];
}

export async function getScheduledEventsForClient(
  clientId: string,
  limit = 20
): Promise<ScheduledEvent[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("scheduled_events")
    .select("*")
    .eq("client_id", clientId)
    .order("event_date", { ascending: false })
    .limit(limit);
  return data || [];
}

export async function getPendingScheduleReviews(): Promise<ScheduledEvent[]> {
  const supabase = await createClient();
  const profile = await getCurrentProfile();
  if (!profile) return [];

  let query = supabase
    .from("scheduled_events")
    .select("*")
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  if (profile.role === "coach") {
    // Only show pending events for the coach's clients
    const { data: assignments } = await supabase
      .from("coach_clients")
      .select("client_id")
      .eq("coach_id", profile.id)
      .eq("status", "active");

    if (!assignments || assignments.length === 0) return [];
    const clientIds = assignments.map((a) => a.client_id);
    query = query.in("client_id", clientIds);
  }

  const { data } = await query;
  return data || [];
}

export async function getMyCoach(clientId: string): Promise<Profile | null> {
  const supabase = await createClient();
  const { data: assignment } = await supabase
    .from("coach_clients")
    .select("coach_id")
    .eq("client_id", clientId)
    .eq("status", "active")
    .limit(1)
    .single();

  if (!assignment) return null;

  const { data: coach } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", assignment.coach_id)
    .single();

  return coach;
}
