import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Calendar, Target, TrendingUp } from "lucide-react";
import { getDashboardStats } from "@/lib/supabase/queries";
import { format } from "date-fns";
import Link from "next/link";

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

export default async function DashboardPage() {
  const stats = await getDashboardStats();

  if (!stats) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Unable to load dashboard data.</p>
      </div>
    );
  }

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
        <StatCard
          icon={Users}
          label="Clients"
          value={String(stats.clientCount)}
        />
        <StatCard
          icon={Calendar}
          label="Events This Week"
          value={String(stats.eventsThisWeek)}
        />
        <StatCard
          icon={Target}
          label="Active Goals"
          value={String(stats.activeGoals)}
        />
        <StatCard
          icon={TrendingUp}
          label="Upcoming"
          value={String(stats.upcomingEvents.length)}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">
              Upcoming Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.upcomingEvents.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No upcoming events
              </p>
            ) : (
              <div className="space-y-3">
                {stats.upcomingEvents.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-start justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">
                        {event.title}
                      </p>
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
            <CardTitle className="text-sm font-semibold">
              Your Clients
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.clients.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No clients assigned yet
              </p>
            ) : (
              <div className="space-y-3">
                {stats.clients.slice(0, 5).map((client) => (
                  <Link
                    key={client.id}
                    href={`/dashboard/clients/${client.id}`}
                    className="flex items-center gap-3 p-2 -mx-2 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                      {client.first_name[0]}
                      {client.last_name[0]}
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {client.first_name} {client.last_name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {client.email}
                      </p>
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

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Users;
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
