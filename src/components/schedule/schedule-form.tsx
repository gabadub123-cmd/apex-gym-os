"use client";

import { useTransition, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createScheduledEvent } from "@/lib/supabase/actions";
import type { Profile } from "@/lib/types/database";

interface ScheduleFormProps {
  clients: Profile[];
  defaultClientId?: string;
  isClient?: boolean;
}

export function ScheduleForm({
  clients,
  defaultClientId,
  isClient,
}: ScheduleFormProps) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage(null);
    const formData = new FormData(e.currentTarget);

    if (isClient && defaultClientId) {
      formData.set("client_id", defaultClientId);
    }

    startTransition(async () => {
      try {
        await createScheduledEvent(formData);
        setMessage("Event scheduled!");
        e.currentTarget?.reset();
      } catch (err) {
        setMessage(
          err instanceof Error ? err.message : "Failed to schedule event"
        );
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {message && (
        <p
          className={`text-sm px-3 py-2 rounded-md ${
            message.includes("scheduled")
              ? "text-green-400 bg-green-500/10"
              : "text-red-400 bg-red-500/10"
          }`}
        >
          {message}
        </p>
      )}

      {/* Client selector — only for coach/admin */}
      {!isClient && (
        <div className="space-y-2">
          <Label htmlFor="client_id">Client</Label>
          {clients.length === 0 ? (
            <p className="text-xs text-amber-400 rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2">
              No clients yet. Add clients in the Admin panel first.
            </p>
          ) : (
            <select
              id="client_id"
              name="client_id"
              required
              className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
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

      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          name="title"
          required
          placeholder="e.g. Leg Day, Posing Practice"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          name="description"
          placeholder="Optional details…"
        />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-2">
          <Label htmlFor="event_date">Date</Label>
          <Input
            id="event_date"
            name="event_date"
            type="date"
            required
            defaultValue={new Date().toISOString().split("T")[0]}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="start_time">Start</Label>
          <Input id="start_time" name="start_time" type="time" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="end_time">End</Label>
          <Input id="end_time" name="end_time" type="time" />
        </div>
      </div>

      {isClient && (
        <p className="text-xs text-amber-400 bg-amber-500/10 rounded-md px-3 py-2">
          Your coach will review this request before it goes live.
        </p>
      )}

      <Button
        type="submit"
        className="w-full"
        disabled={isPending || (!isClient && clients.length === 0)}
      >
        {isPending
          ? "Saving…"
          : isClient
            ? "Request Event"
            : "Add to Schedule"}
      </Button>
    </form>
  );
}
