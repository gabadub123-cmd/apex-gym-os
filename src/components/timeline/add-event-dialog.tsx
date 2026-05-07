"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";
import { addTimelineEvent } from "@/lib/supabase/actions";
import type { TimelineEventType } from "@/lib/types/database";

const eventTypes: { value: TimelineEventType; label: string }[] = [
  { value: "phase_change", label: "Phase Change" },
  { value: "medication_change", label: "Medication Change" },
  { value: "supplement_change", label: "Supplement Change" },
  { value: "nutrition_change", label: "Nutrition Change" },
  { value: "milestone", label: "Milestone" },
  { value: "competition", label: "Competition" },
  { value: "measurement", label: "Measurement" },
  { value: "note", label: "Note" },
];

interface AddEventDialogProps {
  clientId: string;
}

export function AddEventDialog({ clientId }: AddEventDialogProps) {
  const [open, setOpen] = useState(false);
  const [eventType, setEventType] = useState<TimelineEventType>("note");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const formData = new FormData(form);
    formData.set("client_id", clientId);
    formData.set("event_type", eventType);

    startTransition(async () => {
      try {
        await addTimelineEvent(formData);
        setOpen(false);
        form.reset();
        setEventType("note");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to add event");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="inline-flex shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-medium h-7 gap-1 px-2.5 hover:bg-primary/80 transition-colors">
        <Plus className="h-4 w-4" />
        Add Event
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Timeline Event</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <p className="text-sm text-red-400 bg-red-500/10 px-3 py-2 rounded-md">
              {error}
            </p>
          )}

          <div className="space-y-2">
            <Label>Event Type</Label>
            <Select
              value={eventType}
              onValueChange={(v) => setEventType(v as TimelineEventType)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {eventTypes.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" name="title" placeholder="Event title" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="event_date">Date</Label>
            <Input
              id="event_date"
              name="event_date"
              type="date"
              defaultValue={new Date().toISOString().split("T")[0]}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Details about this event..."
              rows={3}
            />
          </div>

          {eventType === "phase_change" && (
            <>
              <div className="space-y-2">
                <Label>Phase</Label>
                <Select name="phase">
                  <SelectTrigger>
                    <SelectValue placeholder="Select phase" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bulk">Bulk</SelectItem>
                    <SelectItem value="cut">Cut</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="competition_prep">
                      Competition Prep
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="calorie_target">Calorie Target</Label>
                  <Input
                    id="calorie_target"
                    name="calorie_target"
                    type="number"
                    placeholder="2400"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="target_weight_kg">Target Weight (kg)</Label>
                  <Input
                    id="target_weight_kg"
                    name="target_weight_kg"
                    type="number"
                    step="0.1"
                    placeholder="75"
                  />
                </div>
              </div>
            </>
          )}

          {(eventType === "medication_change" ||
            eventType === "supplement_change") && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="dosage">Dosage</Label>
                <Input id="dosage" name="dosage" placeholder="e.g. 150mg" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="frequency">Frequency</Label>
                <Input
                  id="frequency"
                  name="frequency"
                  placeholder="e.g. daily"
                />
              </div>
            </div>
          )}

          {eventType === "nutrition_change" && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="protein_g">Protein (g)</Label>
                <Input
                  id="protein_g"
                  name="protein_g"
                  type="number"
                  placeholder="140"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="carbs_g">Carbs (g)</Label>
                <Input
                  id="carbs_g"
                  name="carbs_g"
                  type="number"
                  placeholder="280"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fat_g">Fat (g)</Label>
                <Input
                  id="fat_g"
                  name="fat_g"
                  type="number"
                  placeholder="65"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="calories">Calories</Label>
                <Input
                  id="calories"
                  name="calories"
                  type="number"
                  placeholder="2400"
                />
              </div>
            </div>
          )}

          {eventType === "measurement" && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="weight_kg">Weight (kg)</Label>
                <Input
                  id="weight_kg"
                  name="weight_kg"
                  type="number"
                  step="0.1"
                  placeholder="75.0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="body_fat_pct">Body Fat %</Label>
                <Input
                  id="body_fat_pct"
                  name="body_fat_pct"
                  type="number"
                  step="0.1"
                  placeholder="15.0"
                />
              </div>
            </div>
          )}

          {eventType === "competition" && (
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label htmlFor="federation">Federation</Label>
                <Input
                  id="federation"
                  name="federation"
                  placeholder="NPC"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="division">Division</Label>
                <Input
                  id="division"
                  name="division"
                  placeholder="Bikini"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  name="location"
                  placeholder="Amsterdam"
                />
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : "Save Event"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
