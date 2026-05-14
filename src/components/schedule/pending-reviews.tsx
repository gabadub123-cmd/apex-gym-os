"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, Loader2, Clock } from "lucide-react";
import { reviewScheduledEvent } from "@/lib/supabase/actions";
import type { ScheduledEvent, Profile } from "@/lib/types/database";
import { format } from "date-fns";

export function PendingReviews({
  events,
  clientMap,
}: {
  events: ScheduledEvent[];
  clientMap: Record<string, Profile>;
}) {
  if (events.length === 0) {
    return (
      <div className="text-center py-4">
        <Clock className="h-5 w-5 text-muted-foreground mx-auto mb-1.5" />
        <p className="text-xs text-muted-foreground">No pending requests</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {events.map((event) => (
        <PendingEventRow
          key={event.id}
          event={event}
          client={clientMap[event.client_id]}
        />
      ))}
    </div>
  );
}

function PendingEventRow({
  event,
  client,
}: {
  event: ScheduledEvent;
  client?: Profile;
}) {
  const [isPending, startTransition] = useTransition();

  function handleReview(status: "approved" | "declined") {
    const formData = new FormData();
    formData.set("event_id", event.id);
    formData.set("status", status);
    startTransition(() => reviewScheduledEvent(formData));
  }

  return (
    <div className="flex items-start justify-between gap-3 p-3 rounded-lg border border-amber-500/20 bg-amber-500/5">
      <div className="min-w-0 space-y-1">
        <p className="text-sm font-medium truncate">{event.title}</p>
        <div className="flex items-center gap-2 flex-wrap">
          {client && (
            <Badge variant="outline" className="text-[10px] text-purple-400 border-purple-500/30">
              {client.first_name} {client.last_name}
            </Badge>
          )}
          <span className="text-xs text-muted-foreground">
            {format(new Date(event.event_date), "MMM d, yyyy")}
          </span>
          {event.start_time && (
            <span className="text-xs text-muted-foreground">
              {event.start_time.slice(0, 5)}
              {event.end_time ? ` - ${event.end_time.slice(0, 5)}` : ""}
            </span>
          )}
        </div>
        {event.description && (
          <p className="text-xs text-muted-foreground">{event.description}</p>
        )}
      </div>

      <div className="flex items-center gap-1 shrink-0">
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        ) : (
          <>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 text-green-400 hover:text-green-300 hover:bg-green-500/10"
              onClick={() => handleReview("approved")}
              title="Approve"
            >
              <Check className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/10"
              onClick={() => handleReview("declined")}
              title="Decline"
            >
              <X className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
