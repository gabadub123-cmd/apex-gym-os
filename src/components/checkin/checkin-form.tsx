"use client";

import { useTransition, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { submitDailyCheckin } from "@/lib/supabase/actions";
import type { ClientMetric } from "@/lib/types/database";

interface CheckinFormProps {
  clientId: string;
  existingCheckin?: ClientMetric;
}

const ratingOptions = [1, 2, 3, 4, 5];

export function CheckinForm({ clientId, existingCheckin }: CheckinFormProps) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage(null);
    const formData = new FormData(e.currentTarget);
    formData.set("client_id", clientId);
    formData.set("date", new Date().toISOString().split("T")[0]);

    startTransition(async () => {
      try {
        await submitDailyCheckin(formData);
        setMessage("Check-in saved!");
      } catch (err) {
        setMessage(
          err instanceof Error ? err.message : "Failed to save check-in"
        );
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {message && (
        <p
          className={`text-sm px-3 py-2 rounded-md ${
            message.includes("saved")
              ? "text-green-400 bg-green-500/10"
              : "text-red-400 bg-red-500/10"
          }`}
        >
          {message}
        </p>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="weight_kg">Weight (kg)</Label>
          <Input
            id="weight_kg"
            name="weight_kg"
            type="number"
            step="0.1"
            placeholder="75.0"
            defaultValue={existingCheckin?.weight_kg ?? ""}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="steps">Steps</Label>
          <Input
            id="steps"
            name="steps"
            type="number"
            placeholder="10000"
            defaultValue={existingCheckin?.steps ?? ""}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="sleep_hours">Sleep (hours)</Label>
          <Input
            id="sleep_hours"
            name="sleep_hours"
            type="number"
            step="0.5"
            placeholder="7.5"
            defaultValue={existingCheckin?.sleep_hours ?? ""}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <RatingField
          name="sleep_quality"
          label="Sleep Quality"
          defaultValue={existingCheckin?.sleep_quality}
        />
        <RatingField
          name="energy_level"
          label="Energy"
          defaultValue={existingCheckin?.energy_level}
        />
        <RatingField
          name="hunger_level"
          label="Hunger"
          defaultValue={existingCheckin?.hunger_level}
        />
        <RatingField
          name="stress_level"
          label="Stress"
          defaultValue={existingCheckin?.stress_level}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          name="notes"
          placeholder="How are you feeling today? Any issues?"
          rows={2}
          defaultValue={existingCheckin?.notes ?? ""}
        />
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isPending}>
          {isPending
            ? "Saving..."
            : existingCheckin
              ? "Update Check-in"
              : "Submit Check-in"}
        </Button>
      </div>
    </form>
  );
}

function RatingField({
  name,
  label,
  defaultValue,
}: {
  name: string;
  label: string;
  defaultValue?: number | null;
}) {
  const [value, setValue] = useState<number | null>(defaultValue ?? null);

  return (
    <div className="space-y-2">
      <Label className="text-xs">{label}</Label>
      <input type="hidden" name={name} value={value ?? ""} />
      <div className="flex gap-1">
        {ratingOptions.map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setValue(n)}
            className={`flex h-8 w-8 items-center justify-center rounded-md text-xs font-medium transition-colors ${
              value === n
                ? "bg-primary text-primary-foreground"
                : "bg-muted/50 text-muted-foreground hover:bg-muted"
            }`}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}
