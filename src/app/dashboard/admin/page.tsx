import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  getCurrentProfile,
  getAllProfiles,
  getCoachAssignments,
  getLatestPhase,
} from "@/lib/supabase/queries";
import { AdminUserTable } from "@/components/admin/admin-user-table";
import { AdminCoachTree } from "@/components/admin/admin-coach-tree";
import {
  Users,
  UserCheck,
  Shield,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";

export default async function AdminPage() {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== "admin") redirect("/dashboard");

  const [allProfiles, assignments] = await Promise.all([
    getAllProfiles(),
    getCoachAssignments(),
  ]);

  const coaches = allProfiles.filter((p) => p.role === "coach");
  const clients = allProfiles.filter((p) => p.role === "client");
  const admins = allProfiles.filter((p) => p.role === "admin");

  const assignmentMap: Record<string, string[]> = {};
  for (const a of assignments) {
    if (!assignmentMap[a.coach_id]) assignmentMap[a.coach_id] = [];
    assignmentMap[a.coach_id].push(a.client_id);
  }

  const assignedClientIds = new Set(assignments.map((a) => a.client_id));
  const unassignedClients = clients.filter(
    (c) => !assignedClientIds.has(c.id)
  );

  // Get phases for all clients for display
  const clientPhases: Record<string, string> = {};
  await Promise.all(
    clients.map(async (c) => {
      clientPhases[c.id] = await getLatestPhase(c.id);
    })
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold">Admin Panel</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your team hierarchy and user roles.
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <Shield className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{admins.length}</p>
              <p className="text-xs text-muted-foreground">Admins</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-green-500/20 flex items-center justify-center">
              <UserCheck className="h-5 w-5 text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{coaches.length}</p>
              <p className="text-xs text-muted-foreground">Coaches</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <Users className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{clients.length}</p>
              <p className="text-xs text-muted-foreground">Clients</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{unassignedClients.length}</p>
              <p className="text-xs text-muted-foreground">Unassigned</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main content: Coach Tree + Role Management */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coach → Client hierarchy (takes 2/3) */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold">
                  Team Hierarchy
                </CardTitle>
                {unassignedClients.length > 0 && (
                  <Badge
                    variant="outline"
                    className="text-xs text-amber-400 border-amber-500/30"
                  >
                    {unassignedClients.length} unassigned
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <AdminCoachTree
                coaches={coaches}
                clients={clients}
                assignmentMap={assignmentMap}
                clientPhases={clientPhases}
              />
            </CardContent>
          </Card>

          {/* Unassigned clients */}
          {unassignedClients.length > 0 && (
            <Card className="border-amber-500/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-amber-400 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Unassigned Clients
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {unassignedClients.map((client) => (
                    <Link
                      key={client.id}
                      href={`/dashboard/clients/${client.id}`}
                      className="flex items-center gap-3 p-3 rounded-lg border border-border hover:border-primary/30 transition-colors"
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500/10 text-amber-400 text-xs font-bold">
                        {client.first_name[0]}
                        {client.last_name[0]}
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          {client.first_name} {client.last_name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {clientPhases[client.id] || "Unknown"} phase
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  Assign these clients to a coach using the team hierarchy above.
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Role management sidebar (takes 1/3) */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">
                User Roles ({allProfiles.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AdminUserTable
                profiles={allProfiles}
                currentUserId={profile.id}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
