import { format, differenceInYears } from "date-fns";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Calendar,
  Target,
  Pill,
  TrendingDown,
  TrendingUp,
  Minus,
} from "lucide-react";
import type { Profile, ClientGoal, Medication, ClientMetric } from "@/lib/types/database";

const phaseColors: Record<string, string> = {
  bulk: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  cut: "bg-red-500/20 text-red-400 border-red-500/30",
  maintenance: "bg-green-500/20 text-green-400 border-green-500/30",
  competition_prep: "bg-purple-500/20 text-purple-400 border-purple-500/30",
};

interface ClientProfileHeaderProps {
  client: Profile;
  currentPhase: string;
  goals: ClientGoal[];
  activeMeds: Medication[];
  metrics: ClientMetric[];
}

export function ClientProfileHeader({
  client,
  currentPhase,
  goals,
  activeMeds,
  metrics,
}: ClientProfileHeaderProps) {
  const initials = `${client.first_name[0]}${client.last_name[0]}`.toUpperCase();
  const age = client.date_of_birth
    ? differenceInYears(new Date(), new Date(client.date_of_birth))
    : null;

  const latestMetric = metrics[0];
  const avgWeight =
    metrics.length > 0
      ? (
          metrics.reduce((sum, m) => sum + (m.weight_kg || 0), 0) /
          metrics.filter((m) => m.weight_kg).length
        ).toFixed(1)
      : null;

  const avgSteps =
    metrics.length > 0
      ? Math.round(
          metrics.reduce((sum, m) => sum + (m.steps || 0), 0) /
            metrics.filter((m) => m.steps).length
        )
      : null;

  const weightTrend =
    metrics.length >= 2
      ? (metrics[0].weight_kg || 0) - (metrics[metrics.length - 1].weight_kg || 0)
      : 0;

  const phaseKey = currentPhase.toLowerCase();
  const phaseColorClass = phaseColors[phaseKey] || "bg-muted text-muted-foreground";

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row gap-6">
          <Avatar className="h-20 w-20 text-2xl">
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold">
                {client.first_name} {client.last_name}
              </h1>
              <Badge variant="outline" className={phaseColorClass}>
                {currentPhase}
              </Badge>
              {age && (
                <span className="text-sm text-muted-foreground">
                  {age}y · {client.gender}
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                Client since {format(new Date(client.created_at), "MMM yyyy")}
              </span>
              <span className="flex items-center gap-1.5">
                <Target className="h-3.5 w-3.5" />
                {goals.filter((g) => !g.completed).length} active goals
              </span>
              <span className="flex items-center gap-1.5">
                <Pill className="h-3.5 w-3.5" />
                {activeMeds.length} active supplements/meds
              </span>
            </div>
          </div>
        </div>

        <Separator className="my-4" />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <QuickStat
            label="Current Weight"
            value={latestMetric?.weight_kg ? `${latestMetric.weight_kg} kg` : "—"}
          />
          <QuickStat
            label="7-Day Avg Weight"
            value={avgWeight ? `${avgWeight} kg` : "—"}
            trend={weightTrend}
          />
          <QuickStat
            label="7-Day Avg Steps"
            value={avgSteps ? avgSteps.toLocaleString() : "—"}
          />
          <QuickStat
            label="Energy"
            value={
              latestMetric?.energy_level
                ? `${latestMetric.energy_level}/5`
                : "—"
            }
          />
        </div>
      </CardContent>
    </Card>
  );
}

function QuickStat({
  label,
  value,
  trend,
}: {
  label: string;
  value: string;
  trend?: number;
}) {
  return (
    <div className="space-y-1">
      <p className="text-xs text-muted-foreground">{label}</p>
      <div className="flex items-center gap-1.5">
        <p className="text-lg font-semibold">{value}</p>
        {trend !== undefined && trend !== 0 && (
          <span className="flex items-center">
            {trend < 0 ? (
              <TrendingDown className="h-4 w-4 text-green-400" />
            ) : trend > 0 ? (
              <TrendingUp className="h-4 w-4 text-red-400" />
            ) : (
              <Minus className="h-4 w-4 text-muted-foreground" />
            )}
          </span>
        )}
      </div>
    </div>
  );
}
