"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { TimelineEventType } from "@/lib/types/database";
import {
  ArrowRightLeft,
  Pill,
  FlaskConical,
  UtensilsCrossed,
  Trophy,
  Swords,
  StickyNote,
  Ruler,
} from "lucide-react";

const filters: { type: TimelineEventType; label: string; icon: React.ElementType }[] = [
  { type: "phase_change", label: "Phases", icon: ArrowRightLeft },
  { type: "medication_change", label: "Meds", icon: Pill },
  { type: "supplement_change", label: "Supps", icon: FlaskConical },
  { type: "nutrition_change", label: "Nutrition", icon: UtensilsCrossed },
  { type: "milestone", label: "Milestones", icon: Trophy },
  { type: "competition", label: "Comps", icon: Swords },
  { type: "measurement", label: "Measures", icon: Ruler },
  { type: "note", label: "Notes", icon: StickyNote },
];

interface TimelineFilterProps {
  active: Set<TimelineEventType>;
  onToggle: (type: TimelineEventType) => void;
}

export function TimelineFilter({ active, onToggle }: TimelineFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {filters.map(({ type, label, icon: Icon }) => {
        const isActive = active.size === 0 || active.has(type);
        return (
          <Badge
            key={type}
            variant={isActive ? "default" : "outline"}
            className={cn(
              "cursor-pointer select-none gap-1 transition-all",
              !isActive && "opacity-50"
            )}
            onClick={() => onToggle(type)}
          >
            <Icon className="h-3 w-3" />
            {label}
          </Badge>
        );
      })}
    </div>
  );
}
