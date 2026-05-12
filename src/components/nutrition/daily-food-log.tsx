"use client";

import { useTransition } from "react";
import { Badge } from "@/components/ui/badge";
import { Trash2, Loader2 } from "lucide-react";
import { deleteFoodLog } from "@/lib/supabase/actions";
import type { FoodLog, MealType } from "@/lib/types/database";

const mealLabels: Record<MealType, { label: string; color: string }> = {
  breakfast: { label: "Breakfast", color: "text-amber-400 border-amber-500/30" },
  lunch: { label: "Lunch", color: "text-blue-400 border-blue-500/30" },
  dinner: { label: "Dinner", color: "text-purple-400 border-purple-500/30" },
  snack: { label: "Snack", color: "text-green-400 border-green-500/30" },
};

export function DailyFoodLog({ entries }: { entries: FoodLog[] }) {
  if (entries.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-4">
        No food logged today. Start tracking!
      </p>
    );
  }

  const grouped: Record<MealType, FoodLog[]> = {
    breakfast: [],
    lunch: [],
    dinner: [],
    snack: [],
  };
  for (const entry of entries) {
    grouped[entry.meal].push(entry);
  }

  return (
    <div className="space-y-3">
      {(Object.keys(grouped) as MealType[]).map((meal) => {
        const items = grouped[meal];
        if (items.length === 0) return null;
        const info = mealLabels[meal];

        return (
          <div key={meal} className="space-y-1.5">
            <Badge variant="outline" className={`text-[10px] ${info.color}`}>
              {info.label}
            </Badge>
            {items.map((item) => (
              <FoodLogRow key={item.id} item={item} />
            ))}
          </div>
        );
      })}
    </div>
  );
}

function FoodLogRow({ item }: { item: FoodLog }) {
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    const formData = new FormData();
    formData.set("id", item.id);
    startTransition(() => deleteFoodLog(formData));
  }

  return (
    <div className="flex items-center justify-between gap-2 py-1 px-2 rounded hover:bg-muted/30 group">
      <div className="min-w-0 flex-1">
        <p className="text-sm truncate">{item.food_name}</p>
        <div className="flex gap-2 text-[10px] text-muted-foreground">
          {item.protein_g != null && (
            <span className="text-blue-400">P: {item.protein_g}g</span>
          )}
          {item.carbs_g != null && (
            <span className="text-amber-400">C: {item.carbs_g}g</span>
          )}
          {item.fat_g != null && (
            <span className="text-red-400">F: {item.fat_g}g</span>
          )}
          {item.calories != null && (
            <span className="text-green-400">{item.calories} kcal</span>
          )}
        </div>
      </div>
      <button
        onClick={handleDelete}
        disabled={isPending}
        className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
      >
        {isPending ? (
          <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
        ) : (
          <Trash2 className="h-3 w-3 text-muted-foreground hover:text-destructive" />
        )}
      </button>
    </div>
  );
}
