import { ClientCard } from "@/components/clients/client-card";
import { getClients, getTimelineForClient, getLatestPhase } from "@/lib/supabase/queries";

export default async function ClientsPage() {
  const clients = await getClients();

  const clientsWithMeta = await Promise.all(
    clients.map(async (client) => ({
      client,
      currentPhase: await getLatestPhase(client.id),
      eventCount: (await getTimelineForClient(client.id)).length,
    }))
  );

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold">Clients</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {clients.length} active client{clients.length !== 1 ? "s" : ""}
        </p>
      </div>

      {clients.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No clients yet.</p>
          <p className="text-sm text-muted-foreground mt-1">
            Add clients in Supabase to get started.
          </p>
        </div>
      ) : (
        <div className="grid gap-3">
          {clientsWithMeta.map(({ client, currentPhase, eventCount }) => (
            <ClientCard
              key={client.id}
              client={client}
              currentPhase={currentPhase}
              eventCount={eventCount}
            />
          ))}
        </div>
      )}
    </div>
  );
}
