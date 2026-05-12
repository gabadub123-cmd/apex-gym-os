import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { redirect } from "next/navigation";
import {
  getCurrentProfile,
  getClients,
  getTimelineForClient,
  getLatestPhase,
  getFoodLogsForDate,
  getFoodLogHistory,
  getWaterForDate,
} from "@/lib/supabase/queries";
import { format } from "date-fns";
import Link from "next/link";
import { FoodLogForm } from "@/components/nutrition/food-log-form";
import { DailyFoodLog } from "@/components/nutrition/daily-food-log";
import { WaterTracker } from "@/components/nutrition/water-tracker";
import { MacroSummary } from "@/components/nutrition/macro-progress";

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
      const latestNutrition = events.find(
        (e) => e.event_type === "nutrition_change"
      );
      const phase = await getLatestPhase(client.id);
      const meta = (latestNutrition?.metadata || {}) as Record<
        string,
        unknown
      >;

      const today = new Date().toISOString().split("T")[0];
      const foodLogs = await getFoodLogsForDate(client.id, today);
      const actualP = foodLogs.reduce((s, f) => s + (f.protein_g || 0), 0);
      const actualC = foodLogs.reduce((s, f) => s + (f.carbs_g || 0), 0);
      const actualF = foodLogs.reduce((s, f) => s + (f.fat_g || 0), 0);
      const actualCal = foodLogs.reduce((s, f) => s + (f.calories || 0), 0);
      const hasTarget = meta.protein_g || meta.carbs_g || meta.fat_g;

      return {
        client,
        phase,
        protein: meta.protein_g as number | undefined,
        carbs: meta.carbs_g as number | undefined,
        fat: meta.fat_g as number | undefined,
        calories: meta.calories as number | undefined,
        actualP,
        actualC,
        actualF,
        actualCal,
        hasTarget,
        logged: foodLogs.length > 0,
        lastUpdated: latestNutrition?.event_date,
      };
    })
  );

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold">Nutrition</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Client macro targets vs actual intake today.
        </p>
      </div>

      {clients.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No clients yet.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {clientNutrition.map(
            ({
              client,
              phase,
              protein,
              carbs,
              fat,
              calories,
              actualP,
              actualC,
              actualF,
              actualCal,
              hasTarget,
              logged,
              lastUpdated,
            }) => (
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
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <Badge
                              variant="outline"
                              className="text-[10px]"
                            >
                              {phase}
                            </Badge>
                            {logged && (
                              <Badge
                                variant="outline"
                                className="text-[10px] text-green-400 border-green-500/30"
                              >
                                Logged today
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>

                      {hasTarget ? (
                        <div className="flex flex-1 items-center gap-6">
                          <MacroCompare
                            label="Protein"
                            actual={actualP}
                            target={protein}
                            color="text-blue-400"
                          />
                          <MacroCompare
                            label="Carbs"
                            actual={actualC}
                            target={carbs}
                            color="text-amber-400"
                          />
                          <MacroCompare
                            label="Fat"
                            actual={actualF}
                            target={fat}
                            color="text-red-400"
                          />
                          <MacroCompare
                            label="Cal"
                            actual={actualCal}
                            target={calories}
                            color="text-green-400"
                          />
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          No nutrition targets set
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

async function ClientNutrition({ profileId }: { profileId: string }) {
  const today = new Date().toISOString().split("T")[0];

  const [events, foodLogs, waterMl, history] = await Promise.all([
    getTimelineForClient(profileId),
    getFoodLogsForDate(profileId, today),
    getWaterForDate(profileId, today),
    getFoodLogHistory(profileId, 7),
  ]);

  const nutritionEvents = events.filter(
    (e) => e.event_type === "nutrition_change"
  );
  const latest = nutritionEvents[0];
  const targets = (latest?.metadata || {}) as {
    protein_g?: number;
    carbs_g?: number;
    fat_g?: number;
    calories?: number;
  };

  const totalP = foodLogs.reduce((s, f) => s + (f.protein_g || 0), 0);
  const totalC = foodLogs.reduce((s, f) => s + (f.carbs_g || 0), 0);
  const totalF = foodLogs.reduce((s, f) => s + (f.fat_g || 0), 0);
  const totalCal = foodLogs.reduce((s, f) => s + (f.calories || 0), 0);
  const hasTargets = targets.protein_g || targets.carbs_g || targets.fat_g;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold">My Nutrition</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Track your daily food intake and hit your macro targets.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">
                Today&apos;s Food Log — {format(new Date(), "EEE, MMM d")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FoodLogForm clientId={profileId} date={today} />
              <DailyFoodLog entries={foodLogs} />
            </CardContent>
          </Card>

          {history.length > 1 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold">
                  Daily Totals (Last 7 Days)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {history.map((day) => (
                    <div
                      key={day.date}
                      className="flex items-center justify-between py-1.5 border-b border-border last:border-0 text-sm"
                    >
                      <span className="text-xs text-muted-foreground w-24">
                        {format(new Date(day.date), "EEE, MMM d")}
                      </span>
                      <div className="flex gap-4 text-xs">
                        <span className="text-blue-400">
                          P: {Math.round(day.protein)}g
                        </span>
                        <span className="text-amber-400">
                          C: {Math.round(day.carbs)}g
                        </span>
                        <span className="text-red-400">
                          F: {Math.round(day.fat)}g
                        </span>
                        <span className="text-green-400 font-medium">
                          {Math.round(day.calories)} kcal
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          {hasTargets ? (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold">
                  Today vs Targets
                </CardTitle>
              </CardHeader>
              <CardContent>
                <MacroSummary
                  protein={totalP}
                  carbs={totalC}
                  fat={totalF}
                  calories={totalCal}
                  targets={targets}
                />
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-sm text-muted-foreground">
                  No macro targets set yet. Your coach will add them.
                </p>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">
                Water Intake
              </CardTitle>
            </CardHeader>
            <CardContent>
              <WaterTracker
                clientId={profileId}
                date={today}
                totalMl={waterMl}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">
                Quick Stats
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-blue-400">
                    {Math.round(totalP)}
                  </p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                    Protein (g)
                  </p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-400">
                    {Math.round(totalCal)}
                  </p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                    Calories
                  </p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-amber-400">
                    {Math.round(totalC)}
                  </p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                    Carbs (g)
                  </p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-red-400">
                    {Math.round(totalF)}
                  </p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                    Fat (g)
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function MacroCompare({
  label,
  actual,
  target,
  color,
}: {
  label: string;
  actual: number;
  target?: number;
  color: string;
}) {
  const over = target ? actual > target : false;
  return (
    <div className="text-center">
      <p className={`text-sm font-bold ${over ? "text-red-400" : color}`}>
        {Math.round(actual)}
        {target ? (
          <span className="text-[10px] font-normal text-muted-foreground">
            /{target}
          </span>
        ) : null}
      </p>
      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
        {label}
      </p>
    </div>
  );
}
