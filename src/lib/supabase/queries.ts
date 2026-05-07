"use server";

import { createClient } from "@/lib/supabase/server";
import type {
  Profile,
  TimelineEvent,
  Medication,
  ClientGoal,
  ClientMetric,
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
    clientCount: clients.length,
    eventsThisWeek: eventsThisWeek || 0,
    activeGoals: activeGoals || 0,
    upcomingEvents: upcomingEvents || [],
    clients,
  };
}
