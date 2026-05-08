"use client";

import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Clock, Dumbbell } from "lucide-react";
import type { WorkoutLog } from "@/lib/types/database";

export function WorkoutHistory({ logs }: { logs: WorkoutLog[] }) {
  if (logs.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-4">
        No workouts logged yet.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {logs.map((log) => (
        <div
          key={log.id}
          className="flex items-center justify-between gap-3 py-2.5 px-3 rounded-lg border border-border hover:bg-muted/30 transition-colors"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
              <Dumbbell className="h-4 w-4 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{log.name}</p>
              <p className="text-xs text-muted-foreground">
                {format(new Date(log.date), "EEE, MMM d, yyyy")}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {log.duration_minutes != null && (
              <Badge variant="outline" className="text-[10px]">
                <Clock className="h-2.5 w-2.5 mr-0.5" />
                {log.duration_minutes}m
              </Badge>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
