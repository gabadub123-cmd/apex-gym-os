"use client";

import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRightLeft,
  Pill,
  FlaskConical,
  UtensilsCrossed,
  Trophy,
  Swords,
  StickyNote,
  Ruler,
  type LucideIcon,
} from "lucide-react";
import type { TimelineEvent, TimelineEventType } from "@/lib/types/database";
import { cn } from "@/lib/utils";

const eventConfig: Record<
  TimelineEventType,
  { icon: LucideIcon; color: string; bgColor: string; label: string }
> = {
  phase_change: {
    icon: ArrowRightLeft,
    color: "text-blue-400",
    bgColor: "bg-blue-500/20 border-blue-500/30",
    label: "Phase Change",
  },
  medication_change: {
    icon: Pill,
    color: "text-red-400",
    bgColor: "bg-red-500/20 border-red-500/30",
    label: "Medication",
  },
  supplement_change: {
    icon: FlaskConical,
    color: "text-green-400",
    bgColor: "bg-green-500/20 border-green-500/30",
    label: "Supplement",
  },
  nutrition_change: {
    icon: UtensilsCrossed,
    color: "text-amber-400",
    bgColor: "bg-amber-500/20 border-amber-500/30",
    label: "Nutrition",
  },
  milestone: {
    icon: Trophy,
    color: "text-yellow-400",
    bgColor: "bg-yellow-500/20 border-yellow-500/30",
    label: "Milestone",
  },
  competition: {
    icon: Swords,
    color: "text-purple-400",
    bgColor: "bg-purple-500/20 border-purple-500/30",
    label: "Competition",
  },
  note: {
    icon: StickyNote,
    color: "text-muted-foreground",
    bgColor: "bg-muted/50 border-border",
    label: "Note",
  },
  measurement: {
    icon: Ruler,
    color: "text-cyan-400",
    bgColor: "bg-cyan-500/20 border-cyan-500/30",
    label: "Measurement",
  },
};

function MetadataDisplay({ event }: { event: TimelineEvent }) {
  const meta = event.metadata as Record<string, unknown>;
  if (!meta || Object.keys(meta).length === 0) return null;

  const items: { label: string; value: string }[] = [];

  switch (event.event_type) {
    case "phase_change": {
      if (meta.phase) items.push({ label: "Phase", value: String(meta.phase) });
      if (meta.calorie_target) items.push({ label: "Calories", value: `${meta.calorie_target} kcal` });
      if (meta.target_weight_kg) items.push({ label: "Target", value: `${meta.target_weight_kg} kg` });
      break;
    }
    case "nutrition_change": {
      if (meta.protein_g) items.push({ label: "Protein", value: `${meta.protein_g}g` });
      if (meta.carbs_g) items.push({ label: "Carbs", value: `${meta.carbs_g}g` });
      if (meta.fat_g) items.push({ label: "Fat", value: `${meta.fat_g}g` });
      if (meta.calories) items.push({ label: "Calories", value: `${meta.calories} kcal` });
      break;
    }
    case "medication_change":
    case "supplement_change": {
      if (meta.dosage) items.push({ label: "Dosage", value: String(meta.dosage) });
      if (meta.frequency) items.push({ label: "Frequency", value: String(meta.frequency) });
      if (meta.prescriber) items.push({ label: "Prescriber", value: String(meta.prescriber) });
      break;
    }
    case "measurement": {
      if (meta.weight_kg) items.push({ label: "Weight", value: `${meta.weight_kg} kg` });
      if (meta.body_fat_pct) items.push({ label: "Body Fat", value: `${meta.body_fat_pct}%` });
      if (meta.lean_mass_kg) items.push({ label: "Lean Mass", value: `${meta.lean_mass_kg} kg` });
      break;
    }
    case "milestone": {
      if (meta.exercise) items.push({ label: "Exercise", value: String(meta.exercise) });
      if (meta.weight_kg) items.push({ label: "Weight", value: `${meta.weight_kg} kg` });
      if (meta.reps) items.push({ label: "Reps", value: String(meta.reps) });
      break;
    }
    case "competition": {
      if (meta.federation) items.push({ label: "Federation", value: String(meta.federation) });
      if (meta.division) items.push({ label: "Division", value: String(meta.division) });
      if (meta.location) items.push({ label: "Location", value: String(meta.location) });
      break;
    }
  }

  if (items.length === 0) return null;

  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {items.map((item) => (
        <span
          key={item.label}
          className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md bg-muted/50 text-muted-foreground"
        >
          <span className="font-medium">{item.label}:</span> {item.value}
        </span>
      ))}
    </div>
  );
}

interface TimelineEventCardProps {
  event: TimelineEvent;
  isLast: boolean;
}

export function TimelineEventCard({ event, isLast }: TimelineEventCardProps) {
  const config = eventConfig[event.event_type];
  const Icon = config.icon;
  const isFuture = new Date(event.event_date) > new Date();

  return (
    <div className="relative flex gap-4">
      <div className="flex flex-col items-center">
        <div
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-full border",
            config.bgColor,
            isFuture && "ring-2 ring-primary ring-offset-2 ring-offset-background"
          )}
        >
          <Icon className={cn("h-4 w-4", config.color)} />
        </div>
        {!isLast && (
          <div className="w-px flex-1 bg-border mt-2" />
        )}
      </div>

      <div className={cn("flex-1 pb-8", isLast && "pb-0")}>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-muted-foreground font-mono">
            {format(new Date(event.event_date), "MMM d, yyyy")}
          </span>
          <Badge variant="outline" className={cn("text-[10px] uppercase tracking-wider", config.color)}>
            {config.label}
          </Badge>
          {isFuture && (
            <Badge variant="secondary" className="text-[10px]">
              Upcoming
            </Badge>
          )}
        </div>
        <h4 className="text-sm font-semibold mt-1">{event.title}</h4>
        {event.description && (
          <p className="text-sm text-muted-foreground mt-0.5">
            {event.description}
          </p>
        )}
        <MetadataDisplay event={event} />
      </div>
    </div>
  );
}
