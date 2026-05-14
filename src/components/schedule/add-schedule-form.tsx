"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Plus, X } from "lucide-react";
import { createScheduledEvent } from "@/lib/supabase/actions";
import type { Profile } from "@/lib/types/database";

interface AddScheduleFormProps {
  clients: Profile[];
  defaultClientId?: string;
  defaultDate?: string;
  role: "admin" | "coach" | "client";
  /** When true, renders as a small inline "+" trigger on a day row */
  compact?: boolean;
}

export function AddScheduleForm({
  clients,
  defaultClientId,
  defaultDate,
  role,
  compact = false,
}: AddScheduleFormProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [clientId, setClientId] = useState(defaultClientId || "");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);

    if (role === "client") {
      fd.set("client_id", defaultClientId || "");
    } else {
      fd.set("client_id", clientId);
    }

    startTransition(async () => {
      await createScheduledEvent(fd);
      setOpen(false);
    });
  }

  const triggerLabel = role === "client" ? "Request Event" : "Add Event";

  if (!open) {
    if (compact) {
      return (
        <button
          onClick={() => setOpen(true)}
          className="flex items-center justify-center h-5 w-5 rounded border border-dashed border-border text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors"
          title={triggerLabel}
        >
          <Plus className="h-3 w-3" />
        </button>
      );
    }
    return (
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <Plus className="h-3.5 w-3.5 mr-1" />
        {triggerLabel}
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md space-y-4 rounded-xl border border-border bg-background p-5 shadow-xl"
      >
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold">
            {role === "client" ? "Request Event" : "Schedule Event"}
          </p>
          <button type="button" onClick={() => setOpen(false)}>
            <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
          </button>
        </div>

        {/* Client selector — only for coach/admin */}
        {role !== "client" && (
          <div>
            <label className="text-xs text-muted-foreground">Client</label>
            {clients.length === 0 ? (
              <p className="mt-1 text-xs text-amber-400 rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2">
                No clients found. Add client accounts first, then assign them to
                coaches.
              </p>
            ) : (
              <select
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                required
                className="mt-1 w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="">Select client…</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.first_name} {c.last_name}
                  </option>
                ))}
              </select>
            )}
          </div>
        )}

        <div>
          <label className="text-xs text-muted-foreground">Title</label>
          <Input
            name="title"
            required
            placeholder="e.g. Leg Day, Posing Practice, Check-in"
            className="mt-1 h-9 text-sm"
          />
        </div>

        <div>
          <label className="text-xs text-muted-foreground">
            Description (optional)
          </label>
          <Input
            name="description"
            placeholder="Additional details…"
            className="mt-1 h-9 text-sm"
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="text-xs text-muted-foreground">Date</label>
            <Input
              type="date"
              name="event_date"
              required
              defaultValue={
                defaultDate || new Date().toISOString().split("T")[0]
              }
              className="mt-1 h-9 text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Start</label>
            <Input type="time" name="start_time" className="mt-1 h-9 text-sm" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">End</label>
            <Input type="time" name="end_time" className="mt-1 h-9 text-sm" />
          </div>
        </div>

        {role === "client" && (
          <p className="text-[10px] text-amber-400">
            Your request will be reviewed by your coach before it appears on
            the schedule.
          </p>
        )}

        <div className="flex gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="flex-1 h-9 text-xs"
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            size="sm"
            className="flex-1 h-9 text-xs"
            disabled={isPending || (role !== "client" && clients.length === 0)}
          >
            {isPending ? (
              <Loader2 className="h-3 w-3 animate-spin mr-1" />
            ) : (
              <Plus className="h-3 w-3 mr-1" />
            )}
            {role === "client" ? "Submit Request" : "Save Event"}
          </Button>
        </div>
      </form>
    </div>
  );
}
