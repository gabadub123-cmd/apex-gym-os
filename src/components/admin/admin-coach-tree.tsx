"use client";

import { useTransition } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  X,
  Plus,
  ChevronDown,
  ChevronRight,
  UserCheck,
  User,
} from "lucide-react";
import {
  assignClientToCoach,
  removeClientFromCoach,
} from "@/lib/supabase/actions";
import type { Profile } from "@/lib/types/database";
import Link from "next/link";
import { useState } from "react";

const phaseColors: Record<string, string> = {
  Bulk: "text-blue-400 border-blue-500/30",
  Cut: "text-red-400 border-red-500/30",
  Maintenance: "text-green-400 border-green-500/30",
  "Competition Prep": "text-purple-400 border-purple-500/30",
  "Competition prep": "text-purple-400 border-purple-500/30",
  Unknown: "text-muted-foreground border-border",
};

interface Props {
  coaches: Profile[];
  clients: Profile[];
  assignmentMap: Record<string, string[]>;
  clientPhases: Record<string, string>;
}

export function AdminCoachTree({
  coaches,
  clients,
  assignmentMap,
  clientPhases,
}: Props) {
  const clientMap = Object.fromEntries(clients.map((c) => [c.id, c]));
  const assignedIds = new Set(Object.values(assignmentMap).flat());
  const unassigned = clients.filter((c) => !assignedIds.has(c.id));

  if (coaches.length === 0) {
    return (
      <div className="text-center py-8">
        <UserCheck className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">
          No coaches yet. Promote a user to coach in the role panel.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {coaches.map((coach) => (
        <CoachNode
          key={coach.id}
          coach={coach}
          clientIds={assignmentMap[coach.id] || []}
          clientMap={clientMap}
          clientPhases={clientPhases}
          unassigned={unassigned}
        />
      ))}
    </div>
  );
}

function CoachNode({
  coach,
  clientIds,
  clientMap,
  clientPhases,
  unassigned,
}: {
  coach: Profile;
  clientIds: string[];
  clientMap: Record<string, Profile>;
  clientPhases: Record<string, string>;
  unassigned: Profile[];
}) {
  const [isPending, startTransition] = useTransition();
  const [expanded, setExpanded] = useState(true);
  const [showAssign, setShowAssign] = useState(false);

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
    <div className="rounded-lg border border-border overflow-hidden">
      {/* Coach header */}
      <div
        className="flex items-center gap-3 p-3 bg-green-500/5 cursor-pointer hover:bg-green-500/10 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        {expanded ? (
          <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
        ) : (
          <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
        )}
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-500/20 text-green-400 text-sm font-bold shrink-0">
          {coach.first_name[0]}
          {coach.last_name[0]}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate">
            {coach.first_name} {coach.last_name}
          </p>
          <p className="text-xs text-muted-foreground truncate">
            {coach.email}
          </p>
        </div>
        <Badge
          variant="outline"
          className="text-[10px] text-green-400 border-green-500/30 shrink-0"
        >
          {clientIds.length} client{clientIds.length !== 1 ? "s" : ""}
        </Badge>
      </div>

      {/* Client list */}
      {expanded && (
        <div className="border-t border-border">
          {clientIds.length === 0 ? (
            <div className="px-4 py-3 text-xs text-muted-foreground flex items-center gap-2">
              <User className="h-3.5 w-3.5" />
              No clients assigned to this coach
            </div>
          ) : (
            <div className="divide-y divide-border">
              {clientIds.map((cid) => {
                const c = clientMap[cid];
                if (!c) return null;
                const phase = clientPhases[cid] || "Unknown";

                return (
                  <div
                    key={cid}
                    className="flex items-center gap-3 px-4 py-2.5 pl-12 hover:bg-muted/30 transition-colors group"
                  >
                    <Link
                      href={`/dashboard/clients/${cid}`}
                      className="flex items-center gap-3 flex-1 min-w-0"
                    >
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-purple-500/10 text-purple-400 text-[10px] font-bold shrink-0">
                        {c.first_name[0]}
                        {c.last_name[0]}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">
                          {c.first_name} {c.last_name}
                        </p>
                      </div>
                    </Link>
                    <Badge
                      variant="outline"
                      className={`text-[10px] shrink-0 ${
                        phaseColors[phase] || phaseColors.Unknown
                      }`}
                    >
                      {phase}
                    </Badge>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemove(cid);
                      }}
                      className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all shrink-0"
                      disabled={isPending}
                      title="Unassign client"
                    >
                      {isPending ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <X className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Assign controls */}
          <div className="px-4 py-2 bg-muted/20 border-t border-border">
            {showAssign ? (
              <div className="space-y-2">
                {unassigned.length === 0 ? (
                  <p className="text-xs text-muted-foreground">
                    All clients are assigned.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {unassigned.map((c) => (
                      <Button
                        key={c.id}
                        variant="outline"
                        size="sm"
                        className="h-7 px-2.5 text-xs"
                        onClick={() => handleAssign(c.id)}
                        disabled={isPending}
                      >
                        {isPending ? (
                          <Loader2 className="h-3 w-3 animate-spin mr-1" />
                        ) : (
                          <Plus className="h-3 w-3 mr-1" />
                        )}
                        {c.first_name} {c.last_name}
                      </Button>
                    ))}
                  </div>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-[10px] text-muted-foreground"
                  onClick={() => setShowAssign(false)}
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                onClick={() => setShowAssign(true)}
              >
                <Plus className="h-3 w-3 mr-1" />
                Assign client
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
