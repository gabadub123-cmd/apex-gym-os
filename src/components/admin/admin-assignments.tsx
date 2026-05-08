"use client";

import { useTransition } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, X, Plus } from "lucide-react";
import {
  assignClientToCoach,
  removeClientFromCoach,
} from "@/lib/supabase/actions";
import type { Profile } from "@/lib/types/database";

interface Props {
  coaches: Profile[];
  clients: Profile[];
  assignmentMap: Record<string, string[]>;
}

export function AdminAssignments({ coaches, clients, assignmentMap }: Props) {
  const clientMap = Object.fromEntries(clients.map((c) => [c.id, c]));
  const assignedIds = new Set(Object.values(assignmentMap).flat());
  const unassigned = clients.filter((c) => !assignedIds.has(c.id));

  return (
    <div className="space-y-4">
      {coaches.map((coach) => (
        <CoachBlock
          key={coach.id}
          coach={coach}
          clientIds={assignmentMap[coach.id] || []}
          clientMap={clientMap}
          unassigned={unassigned}
        />
      ))}
      {coaches.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-4">
          No coaches yet. Promote a user to coach above.
        </p>
      )}
    </div>
  );
}

function CoachBlock({
  coach,
  clientIds,
  clientMap,
  unassigned,
}: {
  coach: Profile;
  clientIds: string[];
  clientMap: Record<string, Profile>;
  unassigned: Profile[];
}) {
  const [isPending, startTransition] = useTransition();

  function handleAssign(clientId: string) {
    const formData = new FormData();
    formData.append("coach_id", coach.id);
    formData.append("client_id", clientId);
    startTransition(() => assignClientToCoach(formData));
  }

  function handleRemove(clientId: string) {
    const formData = new FormData();
    formData.append("coach_id", coach.id);
    formData.append("client_id", clientId);
    startTransition(() => removeClientFromCoach(formData));
  }

  return (
    <div className="rounded-lg border border-border p-3 space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">
          {coach.first_name} {coach.last_name}
        </p>
        <Badge variant="outline" className="text-[10px] text-green-400 border-green-500/30">
          {clientIds.length} clients
        </Badge>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {clientIds.map((cid) => {
          const c = clientMap[cid];
          return (
            <div
              key={cid}
              className="flex items-center gap-1 bg-muted rounded-md px-2 py-0.5"
            >
              <span className="text-xs">
                {c ? `${c.first_name} ${c.last_name}` : cid.slice(0, 8)}
              </span>
              <button
                onClick={() => handleRemove(cid)}
                className="text-muted-foreground hover:text-destructive"
                disabled={isPending}
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          );
        })}
        {clientIds.length === 0 && (
          <span className="text-xs text-muted-foreground">No clients assigned</span>
        )}
      </div>

      {unassigned.length > 0 && (
        <div className="pt-1">
          <p className="text-xs text-muted-foreground mb-1">Assign:</p>
          <div className="flex flex-wrap gap-1">
            {unassigned.map((c) => (
              <Button
                key={c.id}
                variant="outline"
                size="sm"
                className="h-6 px-2 text-[10px]"
                onClick={() => handleAssign(c.id)}
                disabled={isPending}
              >
                {isPending ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Plus className="h-3 w-3 mr-0.5" />
                )}
                {c.first_name}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
