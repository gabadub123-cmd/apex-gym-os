"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Plus, X } from "lucide-react";
import { addGoal } from "@/lib/supabase/actions";

export function AddGoalForm({ clientId }: { clientId: string }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("client_id", clientId);
    startTransition(async () => {
      await addGoal(formData);
      setOpen(false);
    });
  }

  if (!open) {
    return (
      <Button
        variant="outline"
        size="sm"
        className="w-full text-xs"
        onClick={() => setOpen(true)}
      >
        <Plus className="h-3 w-3 mr-1" />
        Add Goal
      </Button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-lg border border-border p-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium">New Goal</p>
        <button type="button" onClick={() => setOpen(false)}>
          <X className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
      </div>
      <div className="space-y-2">
        <Label htmlFor="goal-title" className="text-xs">Goal</Label>
        <Input
          id="goal-title"
          name="title"
          placeholder="e.g. Lose 5kg"
          required
          className="h-8 text-sm"
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <Label htmlFor="goal-current" className="text-xs">Current</Label>
          <Input
            id="goal-current"
            name="current_value"
            placeholder="85kg"
            className="h-8 text-sm"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="goal-target" className="text-xs">Target</Label>
          <Input
            id="goal-target"
            name="target_value"
            placeholder="80kg"
            className="h-8 text-sm"
          />
        </div>
      </div>
      <div className="space-y-1">
        <Label htmlFor="goal-date" className="text-xs">Target Date</Label>
        <Input
          id="goal-date"
          name="target_date"
          type="date"
          className="h-8 text-sm"
        />
      </div>
      <Button type="submit" size="sm" className="w-full" disabled={isPending}>
        {isPending && <Loader2 className="h-3 w-3 mr-1 animate-spin" />}
        Save Goal
      </Button>
    </form>
  );
}
