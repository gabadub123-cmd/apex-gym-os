import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { redirect } from "next/navigation";
import {
  getCurrentProfile,
  getClients,
  getTimelineForClient,
  getLatestPhase,
} from "@/lib/supabase/queries";
import Link from "next/link";

export default async function NutritionPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  if (profile.role === "client") {
    return <ClientNutrition profileId={profile.id} />;
  }

  return <CoachNutrition />;
}

async function CoachNutrition() {
  const clients = await getClients();

  const clientNutrition = await Promise.all(
    clients.map(async (client) => {
      const events = await getTimelineForClient(client.id);
      const latestNutrition = events.find((e) => e.event_type === "nutrition_change");
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
          {clientNutrition.map(({ client, phase, protein, carbs, fat, calories, lastUpdated }) => (
            <Link key={client.id} href={`/dashboard/clients/${client.id}`}>
              <Card className="hover:border-primary/30 transition-colors">
                <CardContent className="p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex items-center gap-3 min-w-[180px]">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-bold">
                        {client.first_name[0]}{client.last_name[0]}
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{client.first_name} {client.last_name}</p>
                        <Badge variant="outline" className="text-[10px] mt-0.5">{phase}</Badge>
                      </div>
                    </div>

                    {protein || carbs || fat ? (
                      <div className="flex flex-1 items-center gap-6">
                        <MacroStat label="Protein" value={protein} unit="g" color="text-blue-400" />
                        <MacroStat label="Carbs" value={carbs} unit="g" color="text-amber-400" />
                        <MacroStat label="Fat" value={fat} unit="g" color="text-red-400" />
                        {calories != null && <MacroStat label="Calories" value={calories} unit="kcal" color="text-green-400" />}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No nutrition targets set</p>
                    )}

                    {lastUpdated && (
                      <p className="text-xs text-muted-foreground ml-auto shrink-0">Updated {lastUpdated}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

async function ClientNutrition({ profileId }: { profileId: string }) {
  const events = await getTimelineForClient(profileId);
  const nutritionEvents = events.filter((e) => e.event_type === "nutrition_change");
  const latest = nutritionEvents[0];
  const meta = (latest?.metadata || {}) as Record<string, unknown>;

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold">My Nutrition</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Your current macro targets set by your coach.
        </p>
      </div>

      {latest ? (
        <>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Current Targets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center py-4">
                <MacroLarge label="Protein" value={meta.protein_g as number} unit="g" color="text-blue-400" />
                <MacroLarge label="Carbs" value={meta.carbs_g as number} unit="g" color="text-amber-400" />
                <MacroLarge label="Fat" value={meta.fat_g as number} unit="g" color="text-red-400" />
                <MacroLarge label="Calories" value={meta.calories as number} unit="kcal" color="text-green-400" />
              </div>
              <p className="text-xs text-muted-foreground text-center mt-2">
                Last updated: {latest.event_date}
              </p>
            </CardContent>
          </Card>

          {nutritionEvents.length > 1 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold">Nutrition History</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {nutritionEvents.map((event) => {
                  const m = event.metadata as Record<string, unknown>;
                  return (
                    <div key={event.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                      <div>
                        <p className="text-sm font-medium">{event.title}</p>
                        <p className="text-xs text-muted-foreground">{event.event_date}</p>
                      </div>
                      <div className="flex gap-3 text-xs">
                        {m.protein_g != null && <span className="text-blue-400">P: {String(m.protein_g)}g</span>}
                        {m.carbs_g != null && <span className="text-amber-400">C: {String(m.carbs_g)}g</span>}
                        {m.fat_g != null && <span className="text-red-400">F: {String(m.fat_g)}g</span>}
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}
        </>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              No nutrition targets set yet. Your coach will add them.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function MacroStat({ label, value, unit, color }: { label: string; value?: number; unit: string; color: string }) {
  return (
    <div className="text-center">
      <p className={`text-lg font-bold ${color}`}>
        {value ?? "—"}
        <span className="text-xs font-normal text-muted-foreground ml-0.5">{value != null ? unit : ""}</span>
      </p>
      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</p>
    </div>
  );
}

function MacroLarge({ label, value, unit, color }: { label: string; value?: number; unit: string; color: string }) {
  return (
    <div>
      <p className={`text-3xl font-bold ${color}`}>{value ?? "—"}</p>
      <p className="text-xs text-muted-foreground mt-1">
        {value != null ? unit : ""} {label}
      </p>
    </div>
  );
}
