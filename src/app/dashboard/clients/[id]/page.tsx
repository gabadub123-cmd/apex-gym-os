import { notFound } from "next/navigation";
import { ClientProfileHeader } from "@/components/clients/client-profile-header";
import { Timeline } from "@/components/timeline/timeline";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import {
  getClientById,
  getTimelineForClient,
  getMedicationsForClient,
  getGoalsForClient,
  getMetricsForClient,
  getLatestPhase,
} from "@/lib/demo-data";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ClientProfilePage({ params }: Props) {
  const { id } = await params;
  const client = getClientById(id);

  if (!client) notFound();

  const events = getTimelineForClient(id);
  const medications = getMedicationsForClient(id);
  const goals = getGoalsForClient(id);
  const metrics = getMetricsForClient(id);
  const currentPhase = getLatestPhase(id);
  const activeMeds = medications.filter((m) => m.active);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/clients" className={buttonVariants({ variant: "ghost", size: "icon" })}>
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <h2 className="text-lg font-semibold">Client Profile</h2>
      </div>

      <ClientProfileHeader
        client={client}
        currentPhase={currentPhase}
        goals={goals}
        activeMeds={activeMeds}
        metrics={metrics}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-6">
              <Timeline events={events} />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Active Goals</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {goals.filter((g) => !g.completed).length === 0 ? (
                <p className="text-sm text-muted-foreground">No active goals</p>
              ) : (
                goals
                  .filter((g) => !g.completed)
                  .map((goal) => (
                    <div key={goal.id} className="space-y-1">
                      <p className="text-sm font-medium">{goal.title}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{goal.current_value}</span>
                        <span>→</span>
                        <span className="font-medium text-foreground">
                          {goal.target_value}
                        </span>
                      </div>
                      {goal.target_date && (
                        <p className="text-xs text-muted-foreground">
                          Target: {goal.target_date}
                        </p>
                      )}
                    </div>
                  ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">
                Active Medications & Supplements
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {activeMeds.length === 0 ? (
                <p className="text-sm text-muted-foreground">None active</p>
              ) : (
                activeMeds.map((med) => (
                  <div key={med.id} className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium">{med.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {med.dosage}
                        {med.dosage_unit} · {med.frequency}
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
        </div>
      </div>
    </div>
  );
}
