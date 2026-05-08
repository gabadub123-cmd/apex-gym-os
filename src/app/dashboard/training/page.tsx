import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy } from "lucide-react";
import { redirect } from "next/navigation";
import {
  getCurrentProfile,
  getClients,
  getTimelineForClient,
  getExercises,
  getWorkoutLogsForClient,
  getWorkoutTemplatesForClient,
} from "@/lib/supabase/queries";
import { format } from "date-fns";
import type { TimelineEvent } from "@/lib/types/database";
import { AddExerciseForm } from "@/components/training/add-exercise-form";
import { ExerciseLibrary } from "@/components/training/exercise-library";
import { WorkoutHistory } from "@/components/training/workout-history";
import { LogWorkoutForm } from "@/components/training/log-workout-form";
import { TrainingCoachView } from "@/components/training/training-coach-view";

export default async function TrainingPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  const exercises = await getExercises();
  const isClient = profile.role === "client";

  if (isClient) {
    const [logs, templates, events] = await Promise.all([
      getWorkoutLogsForClient(profile.id),
      getWorkoutTemplatesForClient(profile.id),
      getTimelineForClient(profile.id),
    ]);

    const milestones = events
      .filter((e) => e.event_type === "milestone")
      .sort(
        (a, b) =>
          new Date(b.event_date).getTime() - new Date(a.event_date).getTime()
      );

    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <div>
          <h1 className="text-2xl font-bold">My Training</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Log workouts, track progress, and hit PRs.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold">
                  Log Workout
                </CardTitle>
              </CardHeader>
              <CardContent>
                <LogWorkoutForm
                  clientId={profile.id}
                  exercises={exercises}
                  templates={templates}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold">
                  Workout History ({logs.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <WorkoutHistory logs={logs} />
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            {templates.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold">
                    My Workout Plans
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {templates.map((t) => (
                    <div
                      key={t.id}
                      className="py-2 px-3 rounded-lg border border-border"
                    >
                      <p className="text-sm font-medium">{t.name}</p>
                      {t.day_label && (
                        <p className="text-xs text-muted-foreground">
                          {t.day_label}
                        </p>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold">
                  Personal Records
                </CardTitle>
              </CardHeader>
              <CardContent>
                <MilestonesList milestones={milestones.slice(0, 5)} isClient />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Coach / Admin view
  const clients = await getClients();
  const allEvents = (
    await Promise.all(clients.map((c) => getTimelineForClient(c.id)))
  ).flat();
  const clientMap = Object.fromEntries(
    clients.map((c) => [c.id, `${c.first_name} ${c.last_name}`])
  );

  const milestones = allEvents
    .filter((e) => e.event_type === "milestone")
    .sort(
      (a, b) =>
        new Date(b.event_date).getTime() - new Date(a.event_date).getTime()
    );

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold">Training</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Exercise library, workout templates, and client milestones.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <TrainingCoachView clients={clients} exercises={exercises} />

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">
                Recent Milestones
              </CardTitle>
            </CardHeader>
            <CardContent>
              <MilestonesList
                milestones={milestones.slice(0, 10)}
                isClient={false}
                clientMap={clientMap}
              />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold">
                  Exercise Library ({exercises.length})
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <AddExerciseForm />
              <ExerciseLibrary exercises={exercises} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function MilestonesList({
  milestones,
  isClient,
  clientMap,
}: {
  milestones: TimelineEvent[];
  isClient: boolean;
  clientMap?: Record<string, string>;
}) {
  if (milestones.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-4 text-center">
        {isClient
          ? "No milestones yet. Keep pushing!"
          : "No milestones yet."}
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {milestones.map((event) => {
        const meta = event.metadata as Record<string, unknown>;
        return (
          <div key={event.id} className="flex gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-yellow-500/20 border border-yellow-500/30">
              <Trophy className="h-3.5 w-3.5 text-yellow-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">{event.title}</p>
              <div className="flex items-center gap-2 mt-0.5">
                {!isClient && clientMap && (
                  <>
                    <span className="text-xs text-muted-foreground">
                      {clientMap[event.client_id] || "Unknown"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      &middot;
                    </span>
                  </>
                )}
                <span className="text-xs text-muted-foreground">
                  {format(new Date(event.event_date), "MMM d, yyyy")}
                </span>
              </div>
              {meta.weight_kg != null && (
                <div className="flex gap-2 mt-1">
                  <Badge
                    variant="outline"
                    className="text-[10px] text-yellow-400 border-yellow-500/30"
                  >
                    {String(meta.weight_kg)} kg
                    {meta.reps != null ? ` x ${String(meta.reps)}` : ""}
                  </Badge>
                  {meta.exercise != null && (
                    <Badge variant="outline" className="text-[10px]">
                      {String(meta.exercise)}
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
