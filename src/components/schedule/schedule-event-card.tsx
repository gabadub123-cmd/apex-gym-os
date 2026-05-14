"use client";

import { useTransition } from "react";
import { Badge } from "@/components/ui/badge";
import { Loader2, Trash2 } from "lucide-react";
import { deleteScheduledEvent } from "@/lib/supabase/actions";
import type { ScheduledEvent, Profile } from "@/lib/types/database";

const statusStyles: Record<string, string> = {
  approved: "text-green-400 border-green-500/30",
  pending: "text-amber-400 border-amber-500/30",
  declined: "text-red-400 border-red-500/30",
  completed: "text-blue-400 border-blue-500/30",
};

export function ScheduleEventCard({
  event,
  client,
  showClient,
  canDelete,
}: {
  event: ScheduledEvent;
  client?: Profile;
  showClient?: boolean;
  canDelete?: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    const formData = new FormData();
    formData.set("event_id", event.id);
    startTransition(() => deleteScheduledEvent(formData));
  }

  return (
    <div className="flex items-center gap-2 group">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          {event.start_time && (
            <span className="text-[10px] text-muted-foreground font-mono shrink-0">
              {event.start_time.slice(0, 5)}
            </span>
          )}
          <span className="text-sm truncate font-medium">{event.title}</span>
        </div>
        {showClient && client && (
          <span className="text-[10px] text-muted-foreground">
            {client.first_name} {client.last_name}
          </span>
        )}
      </div>
      <Badge
        variant="outline"
        className={`text-[10px] shrink-0 ${statusStyles[event.status] || ""}`}
      >
        {event.status}
      </Badge>
      {canDelete && (
        <button
          onClick={handleDelete}
          disabled={isPending}
          className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
          title="Delete event"
        >
          {isPending ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <Trash2 className="h-3 w-3" />
          )}
        </button>
      )}
    </div>
  );
}
