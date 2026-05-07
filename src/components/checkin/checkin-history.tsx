"use client";

import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import type { ClientMetric } from "@/lib/types/database";

function ratingColor(value: number | null) {
  if (!value) return "text-muted-foreground";
  if (value >= 4) return "text-green-400";
  if (value >= 3) return "text-amber-400";
  return "text-red-400";
}

export function CheckinHistory({ metrics }: { metrics: ClientMetric[] }) {
  if (metrics.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-4">
        No check-in data yet.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {metrics.map((m) => (
        <div
          key={m.id}
          className="rounded-lg border border-border p-3 space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">
              {format(new Date(m.date), "EEE, MMM d, yyyy")}
            </span>
            {m.weight_kg && (
              <Badge variant="outline" className="text-xs">
                {m.weight_kg} kg
              </Badge>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            {m.steps != null && (
              <div>
                <span className="text-muted-foreground">Steps:</span>{" "}
                <span className="font-medium">
                  {m.steps.toLocaleString()}
                </span>
              </div>
            )}
            {m.sleep_hours != null && (
              <div>
                <span className="text-muted-foreground">Sleep:</span>{" "}
                <span className="font-medium">{m.sleep_hours}h</span>
              </div>
            )}
            {m.sleep_quality != null && (
              <div>
                <span className="text-muted-foreground">Sleep Q:</span>{" "}
                <span className={`font-medium ${ratingColor(m.sleep_quality)}`}>
                  {m.sleep_quality}/5
                </span>
              </div>
            )}
            {m.energy_level != null && (
              <div>
                <span className="text-muted-foreground">Energy:</span>{" "}
                <span className={`font-medium ${ratingColor(m.energy_level)}`}>
                  {m.energy_level}/5
                </span>
              </div>
            )}
            {m.hunger_level != null && (
              <div>
                <span className="text-muted-foreground">Hunger:</span>{" "}
                <span className={`font-medium ${ratingColor(m.hunger_level)}`}>
                  {m.hunger_level}/5
                </span>
              </div>
            )}
            {m.stress_level != null && (
              <div>
                <span className="text-muted-foreground">Stress:</span>{" "}
                <span
                  className={`font-medium ${ratingColor(
                    m.stress_level ? 6 - m.stress_level : null
                  )}`}
                >
                  {m.stress_level}/5
                </span>
              </div>
            )}
          </div>

          {m.notes && (
            <p className="text-xs text-muted-foreground italic mt-1">
              {m.notes}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
