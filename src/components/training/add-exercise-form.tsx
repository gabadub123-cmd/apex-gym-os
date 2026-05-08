"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Plus, X } from "lucide-react";
import { addExercise } from "@/lib/supabase/actions";
import type { ExerciseCategory } from "@/lib/types/database";

const categories: ExerciseCategory[] = [
  "compound",
  "chest",
  "back",
  "shoulders",
  "legs",
  "arms",
  "core",
  "cardio",
  "other",
];

export function AddExerciseForm() {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      await addExercise(formData);
      setOpen(false);
    });
  }

  if (!open) {
    return (
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <Plus className="h-3.5 w-3.5 mr-1" />
        Add Exercise
      </Button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-lg border border-border p-4 space-y-3"
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">New Exercise</p>
        <button type="button" onClick={() => setOpen(false)}>
          <X className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="ex-name" className="text-xs">Name</Label>
          <Input id="ex-name" name="name" placeholder="Back Squat" required className="h-8 text-sm" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="ex-cat" className="text-xs">Category</Label>
          <select
            id="ex-cat"
            name="category"
            required
            className="flex h-8 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c.charAt(0).toUpperCase() + c.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="ex-video" className="text-xs">Video URL (optional)</Label>
        <Input id="ex-video" name="video_url" placeholder="https://youtube.com/..." className="h-8 text-sm" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="ex-instr" className="text-xs">Instructions (optional)</Label>
        <Input id="ex-instr" name="instructions" placeholder="Keep chest up, drive through heels..." className="h-8 text-sm" />
      </div>
      <Button type="submit" size="sm" className="w-full" disabled={isPending}>
        {isPending && <Loader2 className="h-3 w-3 mr-1 animate-spin" />}
        Save Exercise
      </Button>
    </form>
  );
}
