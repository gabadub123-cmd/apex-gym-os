"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Droplets, Loader2, Plus } from "lucide-react";
import { addWater } from "@/lib/supabase/actions";

const GOAL_ML = 3000;
const INCREMENT_ML = 250;

export function WaterTracker({
  clientId,
  date,
  totalMl,
}: {
  clientId: string;
  date: string;
  totalMl: number;
}) {
  const [isPending, startTransition] = useTransition();
  const pct = Math.min(100, Math.round((totalMl / GOAL_ML) * 100));
  const glasses = Math.round(totalMl / INCREMENT_ML);

  function handleAdd() {
    const formData = new FormData();
    formData.set("client_id", clientId);
    formData.set("date", date);
    formData.set("amount_ml", String(INCREMENT_ML));
    startTransition(() => addWater(formData));
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Droplets className="h-4 w-4 text-cyan-400" />
          <span className="text-sm font-medium">Water</span>
        </div>
        <span className="text-xs text-muted-foreground">
          {(totalMl / 1000).toFixed(1)}L / {(GOAL_ML / 1000).toFixed(1)}L
        </span>
      </div>

      <div className="h-3 rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full bg-cyan-400 transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="flex gap-0.5">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className={`h-5 w-2 rounded-sm transition-colors ${
                i < glasses ? "bg-cyan-400" : "bg-muted"
              }`}
            />
          ))}
        </div>
        <Button
          variant="outline"
          size="sm"
          className="h-7 text-xs"
          onClick={handleAdd}
          disabled={isPending}
        >
          {isPending ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <Plus className="h-3 w-3 mr-0.5" />
          )}
          {INCREMENT_ML}ml
        </Button>
      </div>
    </div>
  );
}
