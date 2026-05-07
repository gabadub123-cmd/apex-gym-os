import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  getClients,
  getTimelineForClient,
  getLatestPhase,
} from "@/lib/supabase/queries";
import Link from "next/link";

export default async function NutritionPage() {
  const clients = await getClients();

  const clientNutrition = await Promise.all(
    clients.map(async (client) => {
      const events = await getTimelineForClient(client.id);
      const latestNutrition = events.find(
        (e) => e.event_type === "nutrition_change"
      );
      const phase = await getLatestPhase(client.id);
      const meta = (latestNutrition?.metadata || {}) as Record<string, unknown>;
      return {
        client,
        phase,
        protein: meta.protein_g as number | undefined,
        carbs: meta.carbs_g as number | undefined,
        fat: meta.fat_g as number | undefined,
        calories: meta.calories as number | undefined,
        lastUpdated: latestNutrition?.event_date,
      };
    })
  );

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold">Nutrition</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Current macro targets for all clients.
        </p>
      </div>

      {clients.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No clients yet.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {clientNutrition.map(
            ({ client, phase, protein, carbs, fat, calories, lastUpdated }) => (
              <Link
                key={client.id}
                href={`/dashboard/clients/${client.id}`}
              >
                <Card className="hover:border-primary/30 transition-colors">
                  <CardContent className="p-5">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      <div className="flex items-center gap-3 min-w-[180px]">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-bold">
                          {client.first_name[0]}
                          {client.last_name[0]}
                        </div>
                        <div>
                          <p className="text-sm font-semibold">
                            {client.first_name} {client.last_name}
                          </p>
                          <Badge variant="outline" className="text-[10px] mt-0.5">
                            {phase}
                          </Badge>
                        </div>
                      </div>

                      {protein || carbs || fat ? (
                        <div className="flex flex-1 items-center gap-6">
                          <MacroStat
                            label="Protein"
                            value={protein}
                            unit="g"
                            color="text-blue-400"
                          />
                          <MacroStat
                            label="Carbs"
                            value={carbs}
                            unit="g"
                            color="text-amber-400"
                          />
                          <MacroStat
                            label="Fat"
                            value={fat}
                            unit="g"
                            color="text-red-400"
                          />
                          {calories && (
                            <MacroStat
                              label="Calories"
                              value={calories}
                              unit="kcal"
                              color="text-green-400"
                            />
                          )}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          No nutrition targets set
                        </p>
                      )}

                      {lastUpdated && (
                        <p className="text-xs text-muted-foreground ml-auto shrink-0">
                          Updated {lastUpdated}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          )}
        </div>
      )}
    </div>
  );
}

function MacroStat({
  label,
  value,
  unit,
  color,
}: {
  label: string;
  value?: number;
  unit: string;
  color: string;
}) {
  return (
    <div className="text-center">
      <p className={`text-lg font-bold ${color}`}>
        {value ?? "—"}
        <span className="text-xs font-normal text-muted-foreground ml-0.5">
          {value ? unit : ""}
        </span>
      </p>
      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
        {label}
      </p>
    </div>
  );
}
