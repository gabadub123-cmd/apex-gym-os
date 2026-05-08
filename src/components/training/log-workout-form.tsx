"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Plus, Trash2, X, Dumbbell } from "lucide-react";
import { logWorkout } from "@/lib/supabase/actions";
import type { Exercise, WorkoutTemplate } from "@/lib/types/database";

interface SetRow {
  exercise_id: string;
  set_number: number;
  reps?: number;
  weight_kg?: number;
  rpe?: number;
}

interface Props {
  clientId: string;
  exercises: Exercise[];
  templates: WorkoutTemplate[];
  onClose?: () => void;
}

export function LogWorkoutForm({ clientId, exercises, templates, onClose }: Props) {
  const [name, setName] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [duration, setDuration] = useState("");
  const [notes, setNotes] = useState("");
  const [sets, setSets] = useState<SetRow[]>([]);
  const [isPending, startTransition] = useTransition();
  const [selectedTemplate, setSelectedTemplate] = useState("");

  function addSet() {
    if (exercises.length === 0) return;
    const lastExId = sets.length > 0 ? sets[sets.length - 1].exercise_id : exercises[0].id;
    const sameExCount = sets.filter((s) => s.exercise_id === lastExId).length;
    setSets((s) => [
      ...s,
      {
        exercise_id: lastExId,
        set_number: sameExCount + 1,
        reps: undefined,
        weight_kg: undefined,
      },
    ]);
  }

  function updateSet(i: number, updates: Partial<SetRow>) {
    setSets((s) => s.map((set, idx) => (idx === i ? { ...set, ...updates } : set)));
  }

  function removeSet(i: number) {
    setSets((s) => s.filter((_, idx) => idx !== i));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const formData = new FormData();
    formData.set("client_id", clientId);
    formData.set("name", name || "Workout");
    formData.set("date", date);
    if (selectedTemplate) formData.set("template_id", selectedTemplate);
    if (duration) formData.set("duration_minutes", duration);
    if (notes) formData.set("notes", notes);
    formData.set("sets", JSON.stringify(sets));

    startTransition(async () => {
      await logWorkout(formData);
      onClose?.();
    });
  }

  const exerciseMap = Object.fromEntries(exercises.map((e) => [e.id, e.name]));

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-border p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Dumbbell className="h-4 w-4 text-primary" />
          <p className="text-sm font-semibold">Log Workout</p>
        </div>
        {onClose && (
          <button type="button" onClick={onClose}>
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs">Workout Name</Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Push Day"
            className="h-8 text-sm"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Date</Label>
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="h-8 text-sm"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Duration (min)</Label>
          <Input
            type="number"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            placeholder="60"
            className="h-8 text-sm"
          />
        </div>
      </div>

      {templates.length > 0 && (
        <div className="space-y-1.5">
          <Label className="text-xs">From Template (optional)</Label>
          <select
            value={selectedTemplate}
            onChange={(e) => {
              setSelectedTemplate(e.target.value);
              if (e.target.value) {
                const tmpl = templates.find((t) => t.id === e.target.value);
                if (tmpl) setName(tmpl.name);
              }
            }}
            className="flex h-8 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="">Select template...</option>
            {templates.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} {t.day_label ? `(${t.day_label})` : ""}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs">Sets</Label>
          <Button type="button" variant="outline" size="sm" className="h-6 px-2 text-xs" onClick={addSet}>
            <Plus className="h-3 w-3 mr-0.5" /> Add Set
          </Button>
        </div>

        {sets.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-3">
            Add sets to log your workout
          </p>
        )}

        {sets.map((s, i) => (
          <div key={i} className="grid grid-cols-12 gap-1.5 items-end bg-muted/30 rounded p-2">
            <div className="col-span-4">
              <Label className="text-[10px] text-muted-foreground">Exercise</Label>
              <select
                value={s.exercise_id}
                onChange={(e) => updateSet(i, { exercise_id: e.target.value })}
                className="flex h-7 w-full rounded border border-input bg-transparent px-2 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                {exercises.map((ex) => (
                  <option key={ex.id} value={ex.id}>
                    {ex.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-span-2">
              <Label className="text-[10px] text-muted-foreground">Set #</Label>
              <Input
                type="number"
                min={1}
                value={s.set_number}
                onChange={(e) => updateSet(i, { set_number: Number(e.target.value) })}
                className="h-7 text-xs"
              />
            </div>
            <div className="col-span-2">
              <Label className="text-[10px] text-muted-foreground">Reps</Label>
              <Input
                type="number"
                value={s.reps ?? ""}
                onChange={(e) => updateSet(i, { reps: e.target.value ? Number(e.target.value) : undefined })}
                placeholder="10"
                className="h-7 text-xs"
              />
            </div>
            <div className="col-span-2">
              <Label className="text-[10px] text-muted-foreground">Weight</Label>
              <Input
                type="number"
                value={s.weight_kg ?? ""}
                onChange={(e) => updateSet(i, { weight_kg: e.target.value ? Number(e.target.value) : undefined })}
                placeholder="kg"
                className="h-7 text-xs"
              />
            </div>
            <div className="col-span-1">
              <Label className="text-[10px] text-muted-foreground">RPE</Label>
              <Input
                type="number"
                min={1}
                max={10}
                value={s.rpe ?? ""}
                onChange={(e) => updateSet(i, { rpe: e.target.value ? Number(e.target.value) : undefined })}
                className="h-7 text-xs"
              />
            </div>
            <div className="col-span-1 flex justify-end pb-0.5">
              <button type="button" onClick={() => removeSet(i)}>
                <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs">Notes (optional)</Label>
        <Input
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Felt strong today..."
          className="h-8 text-sm"
        />
      </div>

      <Button type="submit" size="sm" className="w-full" disabled={isPending}>
        {isPending && <Loader2 className="h-3 w-3 mr-1 animate-spin" />}
        Save Workout Log
      </Button>
    </form>
  );
}
