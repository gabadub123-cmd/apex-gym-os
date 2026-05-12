"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type {
  TimelineEventType,
  MedicationType,
  ExerciseCategory,
  MealType,
} from "@/lib/types/database";

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

export async function completeOnboarding(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const updates: Record<string, unknown> = {
    onboarding_completed: true,
  };

  const phone = formData.get("phone") as string;
  if (phone) updates.phone = phone;
  const dob = formData.get("date_of_birth") as string;
  if (dob) updates.date_of_birth = dob;
  const gender = formData.get("gender") as string;
  if (gender) updates.gender = gender;
  const bio = formData.get("bio") as string;
  if (bio) updates.bio = bio;

  const { error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", user.id);

  if (error) throw new Error(error.message);

  const goalTitle = formData.get("goal_title") as string;
  if (goalTitle) {
    await supabase.from("client_goals").insert({
      client_id: user.id,
      title: goalTitle,
      target_value: (formData.get("goal_target") as string) || null,
      created_by: user.id,
    });
  }

  revalidatePath("/dashboard");
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

export async function assignClientToCoach(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const coachId = formData.get("coach_id") as string;
  const clientId = formData.get("client_id") as string;

  const { error } = await supabase.from("coach_clients").upsert(
    {
      coach_id: coachId,
      client_id: clientId,
      status: "active",
    },
    { onConflict: "coach_id,client_id" }
  );

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/admin");
}

export async function removeClientFromCoach(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const coachId = formData.get("coach_id") as string;
  const clientId = formData.get("client_id") as string;

  const { error } = await supabase
    .from("coach_clients")
    .delete()
    .eq("coach_id", coachId)
    .eq("client_id", clientId);

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/admin");
}

export async function updateUserRole(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const userId = formData.get("user_id") as string;
  const role = formData.get("role") as string;

  const { error } = await supabase
    .from("profiles")
    .update({ role })
    .eq("id", userId);

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/admin");
}

// ─── Training Engine Actions ───

export async function addExercise(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase.from("exercises").insert({
    name: formData.get("name") as string,
    category: formData.get("category") as ExerciseCategory,
    video_url: (formData.get("video_url") as string) || null,
    instructions: (formData.get("instructions") as string) || null,
    created_by: user.id,
  });

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/training");
}

export async function createWorkoutTemplate(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const clientId = formData.get("client_id") as string;

  const { data, error } = await supabase
    .from("workout_templates")
    .insert({
      coach_id: user.id,
      client_id: clientId,
      name: formData.get("name") as string,
      day_label: (formData.get("day_label") as string) || null,
      notes: (formData.get("notes") as string) || null,
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  const exercisesJson = formData.get("exercises") as string;
  if (exercisesJson) {
    const exercises = JSON.parse(exercisesJson) as {
      exercise_id: string;
      sets: number;
      reps: string;
      weight_kg?: number;
      tempo?: string;
      rest_seconds?: number;
      notes?: string;
    }[];

    if (exercises.length > 0) {
      const rows = exercises.map((ex, i) => ({
        template_id: data.id,
        exercise_id: ex.exercise_id,
        order_index: i,
        sets: ex.sets,
        reps: ex.reps,
        weight_kg: ex.weight_kg || null,
        tempo: ex.tempo || null,
        rest_seconds: ex.rest_seconds || null,
        notes: ex.notes || null,
      }));

      const { error: exError } = await supabase
        .from("workout_template_exercises")
        .insert(rows);
      if (exError) throw new Error(exError.message);
    }
  }

  revalidatePath(`/dashboard/clients/${clientId}`);
  revalidatePath("/dashboard/training");
}

export async function logWorkout(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const clientId = formData.get("client_id") as string;

  const { data, error } = await supabase
    .from("workout_logs")
    .insert({
      client_id: clientId,
      template_id: (formData.get("template_id") as string) || null,
      name: formData.get("name") as string,
      date: formData.get("date") as string,
      duration_minutes: formData.get("duration_minutes")
        ? Number(formData.get("duration_minutes"))
        : null,
      notes: (formData.get("notes") as string) || null,
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  const setsJson = formData.get("sets") as string;
  if (setsJson) {
    const sets = JSON.parse(setsJson) as {
      exercise_id: string;
      set_number: number;
      reps?: number;
      weight_kg?: number;
      rpe?: number;
      notes?: string;
    }[];

    if (sets.length > 0) {
      const rows = sets.map((s) => ({
        log_id: data.id,
        exercise_id: s.exercise_id,
        set_number: s.set_number,
        reps: s.reps ?? null,
        weight_kg: s.weight_kg ?? null,
        rpe: s.rpe ?? null,
        notes: s.notes || null,
      }));

      const { error: setError } = await supabase
        .from("workout_log_sets")
        .insert(rows);
      if (setError) throw new Error(setError.message);
    }
  }

  revalidatePath("/dashboard/training");
  revalidatePath(`/dashboard/clients/${clientId}`);
}

// ─── Nutrition Logger Actions ───

export async function addFoodLog(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const clientId = formData.get("client_id") as string;

  const { error } = await supabase.from("food_logs").insert({
    client_id: clientId,
    date: formData.get("date") as string,
    meal: formData.get("meal") as MealType,
    food_name: formData.get("food_name") as string,
    protein_g: formData.get("protein_g")
      ? Number(formData.get("protein_g"))
      : null,
    carbs_g: formData.get("carbs_g")
      ? Number(formData.get("carbs_g"))
      : null,
    fat_g: formData.get("fat_g") ? Number(formData.get("fat_g")) : null,
    calories: formData.get("calories")
      ? Number(formData.get("calories"))
      : null,
  });

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/nutrition");
}

export async function deleteFoodLog(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const id = formData.get("id") as string;

  const { error } = await supabase.from("food_logs").delete().eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/nutrition");
}

export async function addWater(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const clientId = formData.get("client_id") as string;
  const date = formData.get("date") as string;
  const amount = Number(formData.get("amount_ml"));

  const { error } = await supabase.from("water_logs").insert({
    client_id: clientId,
    date,
    amount_ml: amount,
  });

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/nutrition");
}

// ─── Goal Actions ───

export async function toggleGoalComplete(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const goalId = formData.get("goal_id") as string;
  const completed = formData.get("completed") === "true";

  const { error } = await supabase
    .from("client_goals")
    .update({ completed })
    .eq("id", goalId);

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard");
}

export async function updateGoalProgress(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const goalId = formData.get("goal_id") as string;
  const currentValue = formData.get("current_value") as string;

  const { error } = await supabase
    .from("client_goals")
    .update({ current_value: currentValue })
    .eq("id", goalId);

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard");
}
