"use client";

import { useState, useMemo } from "react";
import { TimelineEventCard } from "./timeline-event";
import { TimelineFilter } from "./timeline-filter";
import { AddEventDialog } from "./add-event-dialog";
import type { TimelineEvent, TimelineEventType } from "@/lib/types/database";

interface TimelineProps {
  events: TimelineEvent[];
}

export function Timeline({ events }: TimelineProps) {
  const [activeFilters, setActiveFilters] = useState<Set<TimelineEventType>>(
    new Set()
  );

  function handleToggle(type: TimelineEventType) {
    setActiveFilters((prev) => {
      const next = new Set(prev);
      if (next.has(type)) {
        next.delete(type);
      } else {
        next.add(type);
      }
      return next;
    });
  }

  const filtered = useMemo(() => {
    if (activeFilters.size === 0) return events;
    return events.filter((e) => activeFilters.has(e.event_type));
  }, [events, activeFilters]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h3 className="text-lg font-semibold">Timeline</h3>
        <AddEventDialog />
      </div>

      <TimelineFilter active={activeFilters} onToggle={handleToggle} />

      <div className="mt-6">
        {filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No events match the selected filters.
          </p>
        ) : (
          filtered.map((event, i) => (
            <TimelineEventCard
              key={event.id}
              event={event}
              isLast={i === filtered.length - 1}
            />
          ))
        )}
      </div>
    </div>
  );
}
