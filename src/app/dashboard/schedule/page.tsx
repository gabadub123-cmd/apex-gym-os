import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getClients, getTimelineForClient, getMetricsForClient } from "@/lib/supabase/queries";
import { format, startOfWeek, addDays, isWithinInterval } from "date-fns";

const eventTypeColors: Record<string, string> = {
  phase_change: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  medication_change: "bg-red-500/20 text-red-400 border-red-500/30",
  supplement_change: "bg-green-500/20 text-green-400 border-green-500/30",
  nutrition_change: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  milestone: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  competition: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  note: "bg-muted/50 text-muted-foreground border-border",
  measurement: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
};

export default async function SchedulePage() {
  const clients = await getClients();
  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const allEvents = (
    await Promise.all(clients.map((c) => getTimelineForClient(c.id)))
  ).flat();

  const clientCheckins = await Promise.all(
    clients.map(async (client) => {
      const metrics = await getMetricsForClient(client.id, 1);
      return {
        client,
        lastCheckin: metrics[0]?.date || null,
      };
    })
  );

  const checkedInToday = clientCheckins.filter(
    (c) => c.lastCheckin === format(today, "yyyy-MM-dd")
  );

  const missedToday = clientCheckins.filter(
    (c) => c.lastCheckin !== format(today, "yyyy-MM-dd")
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold">Schedule</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Week of {format(weekStart, "MMM d")} &ndash;{" "}
          {format(addDays(weekStart, 6), "MMM d, yyyy")}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">
                This Week&apos;s Events
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {weekDays.map((day) => {
                  const dayStr = format(day, "yyyy-MM-dd");
                  const dayEvents = allEvents.filter(
                    (e) => e.event_date === dayStr
                  );
                  const isToday =
                    format(today, "yyyy-MM-dd") === dayStr;

                  return (
                    <div
                      key={dayStr}
                      className={`flex gap-4 p-3 rounded-lg ${
                        isToday ? "bg-primary/5 border border-primary/20" : ""
                      }`}
                    >
                      <div className="w-16 shrink-0 text-center">
                        <p className="text-xs text-muted-foreground uppercase">
                          {format(day, "EEE")}
                        </p>
                        <p
                          className={`text-lg font-bold ${
                            isToday ? "text-primary" : ""
                          }`}
                        >
                          {format(day, "d")}
                        </p>
                      </div>
                      <div className="flex-1 space-y-1.5">
                        {dayEvents.length === 0 ? (
                          <p className="text-xs text-muted-foreground py-1">
                            No events
                          </p>
                        ) : (
                          dayEvents.map((event) => (
                            <div
                              key={event.id}
                              className="flex items-center gap-2"
                            >
                              <Badge
                                variant="outline"
                                className={`text-[10px] ${
                                  eventTypeColors[event.event_type] || ""
                                }`}
                              >
                                {event.event_type.replace("_", " ")}
                              </Badge>
                              <span className="text-sm truncate">
                                {event.title}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">
                Today&apos;s Check-ins
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {clients.length === 0 ? (
                <p className="text-sm text-muted-foreground">No clients</p>
              ) : (
                <>
                  <p className="text-xs text-muted-foreground mb-3">
                    {checkedInToday.length}/{clients.length} checked in
                  </p>
                  {missedToday.map(({ client }) => (
                    <div
                      key={client.id}
                      className="flex items-center gap-2 text-sm"
                    >
                      <div className="h-2 w-2 rounded-full bg-amber-400" />
                      <span>
                        {client.first_name} {client.last_name}
                      </span>
                      <Badge
                        variant="outline"
                        className="text-[10px] ml-auto text-amber-400 border-amber-500/30"
                      >
                        Missing
                      </Badge>
                    </div>
                  ))}
                  {checkedInToday.map(({ client }) => (
                    <div
                      key={client.id}
                      className="flex items-center gap-2 text-sm"
                    >
                      <div className="h-2 w-2 rounded-full bg-green-400" />
                      <span>
                        {client.first_name} {client.last_name}
                      </span>
                      <Badge
                        variant="outline"
                        className="text-[10px] ml-auto text-green-400 border-green-500/30"
                      >
                        Done
                      </Badge>
                    </div>
                  ))}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
