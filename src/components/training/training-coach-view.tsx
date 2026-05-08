"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { CreateTemplateForm } from "./create-template-form";
import type { Profile, Exercise } from "@/lib/types/database";

interface Props {
  clients: Profile[];
  exercises: Exercise[];
}

export function TrainingCoachView({ clients, exercises }: Props) {
  const [creating, setCreating] = useState(false);
  const [selectedClient, setSelectedClient] = useState(
    clients.length > 0 ? clients[0].id : ""
  );

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold">
            Workout Templates
          </CardTitle>
          {!creating && (
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs"
              onClick={() => setCreating(true)}
            >
              <Plus className="h-3 w-3 mr-0.5" />
              Create Template
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {creating ? (
          <div className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                For Client
              </label>
              <select
                value={selectedClient}
                onChange={(e) => setSelectedClient(e.target.value)}
                className="flex h-8 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.first_name} {c.last_name}
                  </option>
                ))}
              </select>
            </div>
            <CreateTemplateForm
              clientId={selectedClient}
              exercises={exercises}
              onClose={() => setCreating(false)}
            />
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-sm text-muted-foreground">
              Create workout templates and assign them to your clients. They can
              then log their workouts against these templates.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
