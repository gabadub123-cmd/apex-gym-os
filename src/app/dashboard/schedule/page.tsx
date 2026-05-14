import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  getCurrentProfile,
  getClients,
  getTimelineForClient,
  getMetricsForClient,
  getScheduledEventsForWeek,
  getPendingScheduleReviews,
} from "@/lib/supabase/queries";
import { format, startOfWeek, addDays } from "date-fns";
import { redirect } from "next/navigation";
import { ScheduleForm } from "@/components/schedule/schedule-form";
import { PendingReviews } from "@/components/schedule/pending-reviews";
import { ScheduleEventCard } from "@/components/schedule/schedule-event-card";
import type { Profile, ScheduledEvent } from "@/lib/types/database";

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
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  const weekEnd = addDays(weekStart, 6);
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const startStr = format(weekStart, "yyyy-MM-dd");
  const endStr = format(weekEnd, "yyyy-MM-dd");
  const todayStr = format(today, "yyyy-MM-dd");

  // ── Client view ──────────────────────────────────────────────────────
  if (profile.role === "client") {
    const [timelineEvents, scheduledEvents] = await Promise.all([
      getTimelineForClient(profile.id),
      getScheduledEventsForWeek(startStr, endStr),
    ]);

    const myPending = scheduledEvents.filter((e) => e.status === "pending");

    return (
      <div className="space-y-6 max-w-5xl mx-auto">
        <div>
          <h1 className="text-2xl font-bold">My Schedule</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Week of {format(weekStart, "MMM d")} &ndash;{" "}
            {format(weekEnd, "MMM d, yyyy")}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-2">
            <WeeklyCalendar
              weekDays={weekDays}
              todayStr={todayStr}
              timelineEvents={timelineEvents}
              scheduledEvents={scheduledEvents.filter(
                (e) => e.status !== "declined"
              )}
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Request event form */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold">
                  Request an Event
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScheduleForm
                  clients={[]}
                  defaultClientId={profile.id}
                  isClient
                />
              </CardContent>
            </Card>

            {/* Pending requests */}
            {myPending.length > 0 && (
              <Card className="border-amber-500/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold text-amber-400">
                    Pending Requests ({myPending.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {myPending.map((event) => (
                    <div
                      key={event.id}
                      className="flex items-start justify-between gap-2 py-2 border-b border-border last:border-0"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">
                          {event.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(event.event_date), "MMM d")}
                          {event.start_time
                            ? ` at ${event.start_time.slice(0, 5)}`
                            : ""}
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className="text-[10px] text-amber-400 border-amber-500/30 shrink-0"
                      >
                        Awaiting
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── Coach / Admin view ───────────────────────────────────────────────
  const clients = await getClients();

  const [allTimelineEvents, scheduledEvents, pendingReviews] =
    await Promise.all([
      Promise.all(clients.map((c) => getTimelineForClient(c.id))).then((r) =>
        r.flat()
      ),
      getScheduledEventsForWeek(startStr, endStr),
      getPendingScheduleReviews(),
    ]);

  // Check-in status
  const clientCheckins = await Promise.all(
    clients.map(async (client) => {
      const metrics = await getMetricsForClient(client.id, 1);
      return { client, lastCheckin: metrics[0]?.date || null };
    })
  );

  const checkedIn = clientCheckins.filter((c) => c.lastCheckin === todayStr);
  const missed = clientCheckins.filter((c) => c.lastCheckin !== todayStr);
  const clientMap = Object.fromEntries(clients.map((c) => [c.id, c]));

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold">Schedule</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Week of {format(weekStart, "MMM d")} &ndash;{" "}
          {format(weekEnd, "MMM d, yyyy")}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar — takes 2 columns */}
        <div className="lg:col-span-2">
          <WeeklyCalendar
            weekDays={weekDays}
            todayStr={todayStr}
            timelineEvents={allTimelineEvents}
            scheduledEvents={scheduledEvents}
            clientMap={clientMap}
            showClient
          />
        </div>

        {/* Sidebar — takes 1 column */}
        <div className="space-y-6">
          {/* ── Add Event form (always visible) ── */}
          <Card className="border-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">
                Schedule Event
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScheduleForm clients={clients} />
            </CardContent>
          </Card>

          {/* ── Pending client requests ── */}
          {pendingReviews.length > 0 && (
            <Card className="border-amber-500/20">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold text-amber-400">
                    Client Requests
                  </CardTitle>
                  <Badge
                    variant="outline"
                    className="text-[10px] text-amber-400 border-amber-500/30"
                  >
                    {pendingReviews.length}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <PendingReviews
                  events={pendingReviews}
                  clientMap={clientMap}
                />
              </CardContent>
            </Card>
          )}

          {/* ── Today's check-ins ── */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">
                Today&apos;s Check-ins
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-xs text-muted-foreground mb-2">
                {checkedIn.length}/{clients.length} checked in today
              </p>
              {missed.map(({ client }) => (
                <div
                  key={client.id}
                  className="flex items-center gap-2 text-sm"
                >
                  <div className="h-2 w-2 rounded-full bg-amber-400 shrink-0" />
                  <span className="truncate">
                    {client.first_name} {client.last_name}
                  </span>
                  <Badge
                    variant="outline"
                    className="text-[10px] ml-auto text-amber-400 border-amber-500/30 shrink-0"
                  >
                    Missing
                  </Badge>
                </div>
              ))}
              {checkedIn.map(({ client }) => (
                <div
                  key={client.id}
                  className="flex items-center gap-2 text-sm"
                >
                  <div className="h-2 w-2 rounded-full bg-green-400 shrink-0" />
                  <span className="truncate">
                    {client.first_name} {client.last_name}
                  </span>
                  <Badge
                    variant="outline"
                    className="text-[10px] ml-auto text-green-400 border-green-500/30 shrink-0"
                  >
                    Done
                  </Badge>
                </div>
              ))}
              {clients.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  No clients assigned yet.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ── Weekly Calendar (server component) ────────────────────────────────────────

function WeeklyCalendar({
  weekDays,
  todayStr,
  timelineEvents,
  scheduledEvents,
  clientMap,
  showClient,
}: {
  weekDays: Date[];
  todayStr: string;
  timelineEvents: { id: string; event_type: string; title: string; event_date: string }[];
  scheduledEvents: ScheduledEvent[];
  clientMap?: Record<string, Profile>;
  showClient?: boolean;
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold">
          This Week&apos;s Events
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="divide-y divide-border">
          {weekDays.map((day) => {
            const dayStr = format(day, "yyyy-MM-dd");
            const isToday = todayStr === dayStr;

            const dayTimeline = timelineEvents.filter(
              (e) => e.event_date === dayStr
            );
            const dayScheduled = scheduledEvents.filter(
              (e) => e.event_date === dayStr
            );
            const hasEvents =
              dayTimeline.length > 0 || dayScheduled.length > 0;

            return (
              <div
                key={dayStr}
                className={`flex gap-4 py-3 px-2 rounded-lg ${
                  isToday ? "bg-primary/5 border border-primary/20" : ""
                }`}
              >
                <div className="w-14 shrink-0 text-center">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                    {format(day, "EEE")}
                  </p>
                  <p
                    className={`text-xl font-bold leading-none mt-0.5 ${
                      isToday ? "text-primary" : ""
                    }`}
                  >
                    {format(day, "d")}
                  </p>
                </div>

                <div className="flex-1 min-w-0 space-y-1.5">
                  {!hasEvents ? (
                    <p className="text-xs text-muted-foreground py-1">
                      No events
                    </p>
                  ) : (
                    <>
                      {dayScheduled.map((event) => (
                        <ScheduleEventCard
                          key={event.id}
                          event={event}
                          client={
                            showClient && clientMap
                              ? clientMap[event.client_id]
                              : undefined
                          }
                          showClient={showClient}
                          canDelete
                        />
                      ))}
                      {dayTimeline.map((event) => (
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
                            {event.event_type.replace(/_/g, " ")}
                          </Badge>
                          <span className="text-sm truncate">
                            {event.title}
                          </span>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
