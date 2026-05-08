import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  getCurrentProfile,
  getAllProfiles,
  getCoachAssignments,
} from "@/lib/supabase/queries";
import { AdminUserTable } from "@/components/admin/admin-user-table";
import { AdminAssignments } from "@/components/admin/admin-assignments";
import { Users, UserCheck, Shield } from "lucide-react";

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

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold">Admin Panel</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage users, coaches, and client assignments.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">
              All Users ({allProfiles.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AdminUserTable profiles={allProfiles} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold">
                Coach &rarr; Client Assignments
              </CardTitle>
              {unassignedClients.length > 0 && (
                <Badge variant="outline" className="text-xs text-amber-400 border-amber-500/30">
                  {unassignedClients.length} unassigned
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <AdminAssignments
              coaches={coaches}
              clients={clients}
              assignmentMap={assignmentMap}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
