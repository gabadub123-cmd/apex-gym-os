"use client";

import { useState } from "react";
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

export function AddEventDialog() {
  const [open, setOpen] = useState(false);
  const [eventType, setEventType] = useState<TimelineEventType>("note");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // TODO: Submit to Supabase when connected
    setOpen(false);
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
            <Input id="title" placeholder="Event title" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              defaultValue={new Date().toISOString().split("T")[0]}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Details about this event..."
              rows={3}
            />
          </div>

          {(eventType === "phase_change") && (
            <div className="space-y-2">
              <Label>Phase</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select phase" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bulk">Bulk</SelectItem>
                  <SelectItem value="cut">Cut</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="competition_prep">Competition Prep</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {(eventType === "medication_change" || eventType === "supplement_change") && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="dosage">Dosage</Label>
                <Input id="dosage" placeholder="e.g. 150mg" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="frequency">Frequency</Label>
                <Input id="frequency" placeholder="e.g. daily" />
              </div>
            </div>
          )}

          {eventType === "nutrition_change" && (
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label htmlFor="protein">Protein (g)</Label>
                <Input id="protein" type="number" placeholder="140" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="carbs">Carbs (g)</Label>
                <Input id="carbs" type="number" placeholder="280" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fat">Fat (g)</Label>
                <Input id="fat" type="number" placeholder="65" />
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Save Event</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
