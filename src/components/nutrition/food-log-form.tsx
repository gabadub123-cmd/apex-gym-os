"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Plus, X } from "lucide-react";
import { addFoodLog } from "@/lib/supabase/actions";
import type { MealType } from "@/lib/types/database";

const meals: { value: MealType; label: string; emoji: string }[] = [
  { value: "breakfast", label: "Breakfast", emoji: "🌅" },
  { value: "lunch", label: "Lunch", emoji: "☀️" },
  { value: "dinner", label: "Dinner", emoji: "🌙" },
  { value: "snack", label: "Snack", emoji: "🍎" },
];

export function FoodLogForm({ clientId, date }: { clientId: string; date: string }) {
  const [open, setOpen] = useState(false);
  const [meal, setMeal] = useState<MealType>("breakfast");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("client_id", clientId);
    formData.set("date", date);
    formData.set("meal", meal);

    startTransition(async () => {
      await addFoodLog(formData);
      e.currentTarget.reset();
    });
  }

  if (!open) {
    return (
      <Button variant="outline" size="sm" className="w-full" onClick={() => setOpen(true)}>
        <Plus className="h-3.5 w-3.5 mr-1" />
        Log Food
      </Button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border border-border p-3 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium">Add Food Entry</p>
        <button type="button" onClick={() => setOpen(false)}>
          <X className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
      </div>

      <div className="flex gap-1.5">
        {meals.map((m) => (
          <button
            key={m.value}
            type="button"
            onClick={() => setMeal(m.value)}
            className={`flex-1 py-1.5 rounded-md text-xs font-medium transition-colors ${
              meal === m.value
                ? "bg-primary text-primary-foreground"
                : "bg-muted/50 text-muted-foreground hover:bg-muted"
            }`}
          >
            {m.emoji} {m.label}
          </button>
        ))}
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs">Food</Label>
        <Input
          name="food_name"
          placeholder="e.g. Chicken breast, rice, broccoli"
          required
          className="h-8 text-sm"
        />
      </div>

      <div className="grid grid-cols-4 gap-2">
        <div className="space-y-1">
          <Label className="text-[10px] text-blue-400">Protein (g)</Label>
          <Input name="protein_g" type="number" placeholder="30" className="h-7 text-xs" />
        </div>
        <div className="space-y-1">
          <Label className="text-[10px] text-amber-400">Carbs (g)</Label>
          <Input name="carbs_g" type="number" placeholder="45" className="h-7 text-xs" />
        </div>
        <div className="space-y-1">
          <Label className="text-[10px] text-red-400">Fat (g)</Label>
          <Input name="fat_g" type="number" placeholder="10" className="h-7 text-xs" />
        </div>
        <div className="space-y-1">
          <Label className="text-[10px] text-green-400">Calories</Label>
          <Input name="calories" type="number" placeholder="400" className="h-7 text-xs" />
        </div>
      </div>

      <Button type="submit" size="sm" className="w-full" disabled={isPending}>
        {isPending && <Loader2 className="h-3 w-3 mr-1 animate-spin" />}
        Add Entry
      </Button>
    </form>
  );
}
