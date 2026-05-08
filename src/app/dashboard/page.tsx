import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Calendar,
  Target,
  TrendingUp,
  TrendingDown,
  Scale,
  Pill,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { getDashboardStats } from "@/lib/supabase/queries";
import { format } from "date-fns";
import Link from "next/link";
import { CheckinForm } from "@/components/checkin/checkin-form";
import { AddGoalForm } from "@/components/clients/add-goal-form";

const eventTypeColors: Record<string, string> = {
  phase_change: "text-blue-400",
  medication_change: "text-red-400",
  supplement_change: "text-green-400",
  nutrition_change: "text-amber-400",
  milestone: "text-yellow-400",
  competition: "text-purple-400",
  note: "text-muted-foreground",
  measurement: "text-cyan-400",
};

const phaseColors: Record<string, string> = {
  bulk: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  cut: "bg-red-500/20 text-red-400 border-red-500/30",
  maintenance: "bg-green-500/20 text-green-400 border-green-500/30",
  competition_prep: "bg-purple-500/20 text-purple-400 border-purple-500/30",
};

export default async function DashboardPage() {
  const stats = await getDashboardStats();

  if (!stats) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Unable to load dashboard data.</p>
      </div>
    );
  }

  if (stats.type === "client") {
    return <ClientDashboard stats={stats} />;
  }

  return <CoachDashboard stats={stats} />;
}

function CoachDashboard({
  stats,
}: {
  stats: Extract<NonNullable<Awaited<ReturnType<typeof getDashboardStats>>>, { type: "coach" }>;
}) {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold">
          Welcome back, {stats.profile.first_name || "Coach"}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Here&apos;s what&apos;s happening with your clients.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Clients" value={String(stats.clientCount)} />
        <StatCard icon={Calendar} label="Events This Week" value={String(stats.eventsThisWeek)} />
        <StatCard icon={Target} label="Active Goals" value={String(stats.activeGoals)} />
        <StatCard icon={TrendingUp} label="Upcoming" value={String(stats.upcomingEvents.length)} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Upcoming Events</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.upcomingEvents.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No upcoming events</p>
            ) : (
              <div className="space-y-3">
                {stats.upcomingEvents.map((event) => (
                  <div key={event.id} className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{event.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(event.event_date), "MMM d, yyyy")}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className={`text-[10px] shrink-0 ${eventTypeColors[event.event_type] || ""}`}
                    >
                      {event.event_type.replace("_", " ")}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Your Clients</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.clients.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No clients assigned yet</p>
            ) : (
              <div className="space-y-3">
                {stats.clients.slice(0, 5).map((client) => (
                  <Link
                    key={client.id}
                    href={`/dashboard/clients/${client.id}`}
                    className="flex items-center gap-3 p-2 -mx-2 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                      {client.first_name[0]}{client.last_name[0]}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{client.first_name} {client.last_name}</p>
                      <p className="text-xs text-muted-foreground">{client.email}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ClientDashboard({
  stats,
}: {
  stats: Extract<NonNullable<Awaited<ReturnType<typeof getDashboardStats>>>, { type: "client" }>;
}) {
  const last7 = stats.metrics.slice(0, 7);
  const latestWeight = last7[0]?.weight_kg;
  const weightTrend =
    last7.length >= 2
      ? (last7[0].weight_kg || 0) - (last7[last7.length - 1].weight_kg || 0)
      : 0;

  const nutritionMeta = (stats.latestNutrition?.metadata || {}) as Record<string, unknown>;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">
            Hey, {stats.profile.first_name || "Athlete"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {format(new Date(), "EEEE, MMMM d")}
          </p>
        </div>
        <Badge
          variant="outline"
          className={`ml-auto ${phaseColors[stats.phase.toLowerCase()] || "bg-muted text-muted-foreground"}`}
        >
          {stats.phase} Phase
        </Badge>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={Scale}
          label="Current Weight"
          value={latestWeight ? `${latestWeight} kg` : "—"}
        />
        <StatCard
          icon={weightTrend <= 0 ? TrendingDown : TrendingUp}
          label="7-Day Avg"
          value={stats.avgWeight ? `${stats.avgWeight.toFixed(1)} kg` : "—"}
        />
        <StatCard
          icon={Target}
          label="Active Goals"
          value={String(stats.goals.filter((g) => !g.completed).length)}
        />
        <StatCard
          icon={Pill}
          label="Active Meds"
          value={String(stats.medications.length)}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">
                {stats.todayCheckin ? "Today’s Check-in (Submitted)" : "Daily Check-in"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CheckinForm
                clientId={stats.profile.id}
                existingCheckin={stats.todayCheckin || undefined}
              />
            </CardContent>
          </Card>

          {nutritionMeta.protein_g != null && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold">Today&apos;s Macro Targets</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-4 text-center">
                  <MacroDisplay label="Protein" value={nutritionMeta.protein_g as number} unit="g" color="text-blue-400" />
                  <MacroDisplay label="Carbs" value={nutritionMeta.carbs_g as number} unit="g" color="text-amber-400" />
                  <MacroDisplay label="Fat" value={nutritionMeta.fat_g as number} unit="g" color="text-red-400" />
                  <MacroDisplay label="Calories" value={nutritionMeta.calories as number} unit="kcal" color="text-green-400" />
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              {stats.events.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">No events yet</p>
              ) : (
                <div className="space-y-3">
                  {stats.events.slice(0, 5).map((event) => (
                    <div key={event.id} className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{event.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(event.event_date), "MMM d, yyyy")}
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className={`text-[10px] shrink-0 ${eventTypeColors[event.event_type] || ""}`}
                      >
                        {event.event_type.replace("_", " ")}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">My Goals</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {stats.goals.filter((g) => !g.completed).length === 0 ? (
                <p className="text-sm text-muted-foreground">No active goals</p>
              ) : (
                stats.goals
                  .filter((g) => !g.completed)
                  .map((goal) => (
                    <div key={goal.id} className="space-y-1">
                      <p className="text-sm font-medium">{goal.title}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{goal.current_value}</span>
                        <span>&rarr;</span>
                        <span className="font-medium text-foreground">{goal.target_value}</span>
                      </div>
                      {goal.target_date && (
                        <p className="text-xs text-muted-foreground">Target: {goal.target_date}</p>
                      )}
                    </div>
                  ))
              )}
              <AddGoalForm clientId={stats.profile.id} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">My Supplements &amp; Meds</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {stats.medications.length === 0 ? (
                <p className="text-sm text-muted-foreground">None active</p>
              ) : (
                stats.medications.map((med) => (
                  <div key={med.id} className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium">{med.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {med.dosage}{med.dosage_unit} &middot; {med.frequency}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className={
                        med.type === "ped"
                          ? "text-red-400 border-red-500/30 text-[10px]"
                          : "text-green-400 border-green-500/30 text-[10px]"
                      }
                    >
                      {med.type.toUpperCase()}
                    </Badge>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Weight Log (7 days)</CardTitle>
            </CardHeader>
            <CardContent>
              {last7.length === 0 ? (
                <p className="text-sm text-muted-foreground">No data yet. Submit your first check-in!</p>
              ) : (
                <div className="space-y-1.5">
                  {last7.map((m) => (
                    <div key={m.id} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground text-xs">
                        {format(new Date(m.date), "EEE, MMM d")}
                      </span>
                      <span className="font-medium">
                        {m.weight_kg ? `${m.weight_kg} kg` : "—"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function MacroDisplay({
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
    <div>
      <p className={`text-xl font-bold ${color}`}>
        {value ?? "—"}
        <span className="text-xs font-normal text-muted-foreground ml-0.5">
          {value != null ? unit : ""}
        </span>
      </p>
      <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">{label}</p>
    </div>
  );
}
