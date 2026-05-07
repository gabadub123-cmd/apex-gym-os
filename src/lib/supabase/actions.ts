"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { TimelineEventType, MedicationType } from "@/lib/types/database";

export async function addTimelineEvent(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const clientId = formData.get("client_id") as string;
  const eventType = formData.get("event_type") as TimelineEventType;
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const eventDate = formData.get("event_date") as string;

  const metadata: Record<string, unknown> = {};

  if (eventType === "phase_change") {
    const phase = formData.get("phase");
    if (phase) metadata.phase = phase;
    const calories = formData.get("calorie_target");
    if (calories) metadata.calorie_target = Number(calories);
    const targetWeight = formData.get("target_weight_kg");
    if (targetWeight) metadata.target_weight_kg = Number(targetWeight);
  }

  if (
    eventType === "medication_change" ||
    eventType === "supplement_change"
  ) {
    const dosage = formData.get("dosage");
    if (dosage) metadata.dosage = dosage;
    const frequency = formData.get("frequency");
    if (frequency) metadata.frequency = frequency;
  }

  if (eventType === "nutrition_change") {
    const protein = formData.get("protein_g");
    if (protein) metadata.protein_g = Number(protein);
    const carbs = formData.get("carbs_g");
    if (carbs) metadata.carbs_g = Number(carbs);
    const fat = formData.get("fat_g");
    if (fat) metadata.fat_g = Number(fat);
    const calories = formData.get("calories");
    if (calories) metadata.calories = Number(calories);
  }

  if (eventType === "measurement") {
    const weight = formData.get("weight_kg");
    if (weight) metadata.weight_kg = Number(weight);
    const bodyFat = formData.get("body_fat_pct");
    if (bodyFat) metadata.body_fat_pct = Number(bodyFat);
  }

  if (eventType === "competition") {
    const federation = formData.get("federation");
    if (federation) metadata.federation = federation;
    const division = formData.get("division");
    if (division) metadata.division = division;
    const location = formData.get("location");
    if (location) metadata.location = location;
  }

  const { error } = await supabase.from("timeline_events").insert({
    client_id: clientId,
    event_type: eventType,
    title,
    description: description || null,
    event_date: eventDate,
    metadata,
    created_by: user.id,
  });

  if (error) throw new Error(error.message);
  revalidatePath(`/dashboard/clients/${clientId}`);
}

export async function submitDailyCheckin(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const clientId = formData.get("client_id") as string;
  const date = formData.get("date") as string;

  const metric = {
    client_id: clientId,
    date,
    weight_kg: formData.get("weight_kg")
      ? Number(formData.get("weight_kg"))
      : null,
    steps: formData.get("steps") ? Number(formData.get("steps")) : null,
    sleep_hours: formData.get("sleep_hours")
      ? Number(formData.get("sleep_hours"))
      : null,
    sleep_quality: formData.get("sleep_quality")
      ? Number(formData.get("sleep_quality"))
      : null,
    stress_level: formData.get("stress_level")
      ? Number(formData.get("stress_level"))
      : null,
    hunger_level: formData.get("hunger_level")
      ? Number(formData.get("hunger_level"))
      : null,
    energy_level: formData.get("energy_level")
      ? Number(formData.get("energy_level"))
      : null,
    notes: (formData.get("notes") as string) || null,
  };

  const { error } = await supabase.from("client_metrics").upsert(metric, {
    onConflict: "client_id,date",
  });

  if (error) throw new Error(error.message);
  revalidatePath(`/dashboard/clients/${clientId}`);
}

export async function addMedication(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const clientId = formData.get("client_id") as string;

  const { error } = await supabase.from("medications").insert({
    client_id: clientId,
    name: formData.get("name") as string,
    type: formData.get("type") as MedicationType,
    dosage: (formData.get("dosage") as string) || null,
    dosage_unit: (formData.get("dosage_unit") as string) || null,
    frequency: (formData.get("frequency") as string) || null,
    start_date: formData.get("start_date") as string,
    notes: (formData.get("notes") as string) || null,
    created_by: user.id,
  });

  if (error) throw new Error(error.message);
  revalidatePath(`/dashboard/clients/${clientId}`);
}

export async function addGoal(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const clientId = formData.get("client_id") as string;

  const { error } = await supabase.from("client_goals").insert({
    client_id: clientId,
    title: formData.get("title") as string,
    description: (formData.get("description") as string) || null,
    target_date: (formData.get("target_date") as string) || null,
    target_value: (formData.get("target_value") as string) || null,
    current_value: (formData.get("current_value") as string) || null,
    created_by: user.id,
  });

  if (error) throw new Error(error.message);
  revalidatePath(`/dashboard/clients/${clientId}`);
}

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("profiles")
    .update({
      first_name: formData.get("first_name") as string,
      last_name: formData.get("last_name") as string,
      phone: (formData.get("phone") as string) || null,
      date_of_birth: (formData.get("date_of_birth") as string) || null,
      gender: (formData.get("gender") as string) || null,
      bio: (formData.get("bio") as string) || null,
    })
    .eq("id", user.id);

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard");
}
