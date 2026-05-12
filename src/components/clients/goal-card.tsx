"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, RotateCcw, Loader2, Pencil } from "lucide-react";
import { toggleGoalComplete, updateGoalProgress } from "@/lib/supabase/actions";
import type { ClientGoal } from "@/lib/types/database";

export function GoalCard({ goal }: { goal: ClientGoal }) {
  const [isPending, startTransition] = useTransition();
  const [editing, setEditing] = useState(false);
  const [progress, setProgress] = useState(goal.current_value || "");

  function handleToggle() {
    const formData = new FormData();
    formData.set("goal_id", goal.id);
    formData.set("completed", String(!goal.completed));
    startTransition(() => toggleGoalComplete(formData));
  }

  function handleSaveProgress() {
    const formData = new FormData();
    formData.set("goal_id", goal.id);
    formData.set("current_value", progress);
    startTransition(async () => {
      await updateGoalProgress(formData);
      setEditing(false);
    });
  }

  return (
    <div
      className={`space-y-1.5 p-2 rounded-lg border transition-colors ${
        goal.completed
          ? "border-green-500/20 bg-green-500/5"
          : "border-border"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <p
          className={`text-sm font-medium ${
            goal.completed ? "line-through text-muted-foreground" : ""
          }`}
        >
          {goal.title}
        </p>
        <button
          onClick={handleToggle}
          disabled={isPending}
          className="shrink-0 mt-0.5"
          title={goal.completed ? "Mark incomplete" : "Mark complete"}
        >
          {isPending ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
          ) : goal.completed ? (
            <RotateCcw className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
          ) : (
            <Check className="h-3.5 w-3.5 text-muted-foreground hover:text-green-400" />
          )}
        </button>
      </div>

      {!goal.completed && (
        <>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {editing ? (
              <div className="flex items-center gap-1 flex-1">
                <Input
                  value={progress}
                  onChange={(e) => setProgress(e.target.value)}
                  className="h-6 text-xs flex-1"
                  placeholder="Current value"
                />
                <Button
                  size="sm"
                  className="h-6 px-2 text-[10px]"
                  onClick={handleSaveProgress}
                  disabled={isPending}
                >
                  Save
                </Button>
              </div>
            ) : (
              <>
                <span>{goal.current_value || "—"}</span>
                <span>&rarr;</span>
                <span className="font-medium text-foreground">
                  {goal.target_value}
                </span>
                <button
                  onClick={() => setEditing(true)}
                  className="ml-auto"
                  title="Update progress"
                >
                  <Pencil className="h-2.5 w-2.5 text-muted-foreground hover:text-foreground" />
                </button>
              </>
            )}
          </div>
          {goal.target_date && (
            <p className="text-xs text-muted-foreground">
              Target: {goal.target_date}
            </p>
          )}
        </>
      )}
    </div>
  );
}
