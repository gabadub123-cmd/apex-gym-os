"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Plus, Trash2, X } from "lucide-react";
import { createWorkoutTemplate } from "@/lib/supabase/actions";
import type { Exercise } from "@/lib/types/database";

interface ExerciseRow {
  exercise_id: string;
  sets: number;
  reps: string;
  weight_kg?: number;
  tempo?: string;
  rest_seconds?: number;
  notes?: string;
}

interface Props {
  clientId: string;
  exercises: Exercise[];
  onClose?: () => void;
}

export function CreateTemplateForm({ clientId, exercises, onClose }: Props) {
  const [name, setName] = useState("");
  const [dayLabel, setDayLabel] = useState("");
  const [notes, setNotes] = useState("");
  const [rows, setRows] = useState<ExerciseRow[]>([]);
  const [isPending, startTransition] = useTransition();

  function addRow() {
    if (exercises.length === 0) return;
    setRows((r) => [
      ...r,
      {
        exercise_id: exercises[0].id,
        sets: 3,
        reps: "10",
      },
    ]);
  }

  function updateRow(i: number, updates: Partial<ExerciseRow>) {
    setRows((r) => r.map((row, idx) => (idx === i ? { ...row, ...updates } : row)));
  }

  function removeRow(i: number) {
    setRows((r) => r.filter((_, idx) => idx !== i));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const formData = new FormData();
    formData.set("client_id", clientId);
    formData.set("name", name);
    if (dayLabel) formData.set("day_label", dayLabel);
    if (notes) formData.set("notes", notes);
    formData.set("exercises", JSON.stringify(rows));

    startTransition(async () => {
      await createWorkoutTemplate(formData);
      onClose?.();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-border p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold">New Workout Template</p>
        {onClose && (
          <button type="button" onClick={onClose}>
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs">Template Name</Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Push Day A"
            required
            className="h-8 text-sm"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Day Label</Label>
          <Input
            value={dayLabel}
            onChange={(e) => setDayLabel(e.target.value)}
            placeholder="Monday / Day 1"
            className="h-8 text-sm"
          />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs">Exercises</Label>
          <Button type="button" variant="outline" size="sm" className="h-6 px-2 text-xs" onClick={addRow}>
            <Plus className="h-3 w-3 mr-0.5" /> Add
          </Button>
        </div>

        {rows.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-3">
            Add exercises to this template
          </p>
        )}

        {rows.map((row, i) => (
          <div key={i} className="grid grid-cols-12 gap-1.5 items-end bg-muted/30 rounded p-2">
            <div className="col-span-4">
              <Label className="text-[10px] text-muted-foreground">Exercise</Label>
              <select
                value={row.exercise_id}
                onChange={(e) => updateRow(i, { exercise_id: e.target.value })}
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
              <Label className="text-[10px] text-muted-foreground">Sets</Label>
              <Input
                type="number"
                min={1}
                value={row.sets}
                onChange={(e) => updateRow(i, { sets: Number(e.target.value) })}
                className="h-7 text-xs"
              />
            </div>
            <div className="col-span-2">
              <Label className="text-[10px] text-muted-foreground">Reps</Label>
              <Input
                value={row.reps}
                onChange={(e) => updateRow(i, { reps: e.target.value })}
                placeholder="8-12"
                className="h-7 text-xs"
              />
            </div>
            <div className="col-span-2">
              <Label className="text-[10px] text-muted-foreground">Weight</Label>
              <Input
                type="number"
                value={row.weight_kg || ""}
                onChange={(e) => updateRow(i, { weight_kg: e.target.value ? Number(e.target.value) : undefined })}
                placeholder="kg"
                className="h-7 text-xs"
              />
            </div>
            <div className="col-span-1">
              <Label className="text-[10px] text-muted-foreground">Tempo</Label>
              <Input
                value={row.tempo || ""}
                onChange={(e) => updateRow(i, { tempo: e.target.value })}
                placeholder="3010"
                className="h-7 text-xs"
              />
            </div>
            <div className="col-span-1 flex justify-end pb-0.5">
              <button type="button" onClick={() => removeRow(i)}>
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
          placeholder="Focus on mind-muscle connection..."
          className="h-8 text-sm"
        />
      </div>

      <Button type="submit" size="sm" className="w-full" disabled={isPending || !name}>
        {isPending && <Loader2 className="h-3 w-3 mr-1 animate-spin" />}
        Save Template
      </Button>
    </form>
  );
}
