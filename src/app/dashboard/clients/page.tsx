import { ClientCard } from "@/components/clients/client-card";
import { demoClients, getTimelineForClient, getLatestPhase } from "@/lib/demo-data";

export default function ClientsPage() {
  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold">Clients</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {demoClients.length} active clients
        </p>
      </div>

      <div className="grid gap-3">
        {demoClients.map((client) => (
          <ClientCard
            key={client.id}
            client={client}
            currentPhase={getLatestPhase(client.id)}
            eventCount={getTimelineForClient(client.id).length}
          />
        ))}
      </div>
    </div>
  );
}
