import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy } from "lucide-react";
import { redirect } from "next/navigation";
import {
  getCurrentProfile,
  getClients,
  getTimelineForClient,
} from "@/lib/supabase/queries";
import { format } from "date-fns";
import type { TimelineEvent } from "@/lib/types/database";

export default async function TrainingPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  let allEvents: TimelineEvent[];
  let clientMap: Record<string, string> = {};

  if (profile.role === "client") {
    allEvents = await getTimelineForClient(profile.id);
    clientMap[profile.id] = `${profile.first_name} ${profile.last_name}`;
  } else {
    const clients = await getClients();
    allEvents = (
      await Promise.all(clients.map((c) => getTimelineForClient(c.id)))
    ).flat();
    clientMap = Object.fromEntries(
      clients.map((c) => [c.id, `${c.first_name} ${c.last_name}`])
    );
  }

  const milestones = allEvents
    .filter((e) => e.event_type === "milestone")
    .sort(
      (a, b) =>
        new Date(b.event_date).getTime() - new Date(a.event_date).getTime()
    );

  const recentMilestones = milestones.slice(0, 10);

  const prsByExercise = milestones.reduce<Record<string, TimelineEvent>>(
    (acc, event) => {
      const exercise = (event.metadata as Record<string, unknown>)
        .exercise as string;
      if (!exercise) return acc;
      const key = `${event.client_id}-${exercise}`;
      if (
        !acc[key] ||
        ((event.metadata as Record<string, unknown>).weight_kg as number) >
          ((acc[key].metadata as Record<string, unknown>).weight_kg as number)
      ) {
        acc[key] = event;
      }
      return acc;
    },
    {}
  );

  const isClient = profile.role === "client";

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold">
          {isClient ? "My Training" : "Training"}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {isClient
            ? "Your milestones and personal records."
            : "Client milestones and personal records."}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">
              Recent Milestones
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentMilestones.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                {isClient
                  ? "No milestones yet. Keep pushing!"
                  : "No milestones yet. Add milestones from a client's timeline."}
              </p>
            ) : (
              <div className="space-y-4">
                {recentMilestones.map((event) => {
                  const meta = event.metadata as Record<string, unknown>;
                  return (
                    <div key={event.id} className="flex gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-yellow-500/20 border border-yellow-500/30">
                        <Trophy className="h-4 w-4 text-yellow-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{event.title}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          {!isClient && (
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
                          <div className="flex gap-2 mt-1.5">
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
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">
              Personal Records
            </CardTitle>
          </CardHeader>
          <CardContent>
            {Object.keys(prsByExercise).length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No PRs recorded yet.
              </p>
            ) : (
              <div className="space-y-3">
                {Object.values(prsByExercise).map((event) => {
                  const meta = event.metadata as Record<string, unknown>;
                  return (
                    <div
                      key={event.id}
                      className="flex items-center justify-between gap-3 py-2"
                    >
                      <div>
                        <p className="text-sm font-medium">
                          {String(meta.exercise)}
                        </p>
                        {!isClient && (
                          <p className="text-xs text-muted-foreground">
                            {clientMap[event.client_id] || "Unknown"}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-yellow-400">
                          {String(meta.weight_kg)} kg
                        </p>
                        {meta.reps != null && (
                          <p className="text-xs text-muted-foreground">
                            {String(meta.reps)} rep
                            {Number(meta.reps) !== 1 ? "s" : ""}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
