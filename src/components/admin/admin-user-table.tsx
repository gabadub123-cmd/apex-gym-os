"use client";

import { useTransition } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Shield } from "lucide-react";
import { updateUserRole } from "@/lib/supabase/actions";
import type { Profile, UserRole } from "@/lib/types/database";

const roleBadgeStyles: Record<UserRole, string> = {
  admin: "text-blue-400 border-blue-500/30",
  coach: "text-green-400 border-green-500/30",
  client: "text-purple-400 border-purple-500/30",
};

export function AdminUserTable({
  profiles,
  currentUserId,
}: {
  profiles: Profile[];
  currentUserId: string;
}) {
  return (
    <div className="space-y-2">
      {profiles.map((p) => (
        <UserRow key={p.id} profile={p} isSelf={p.id === currentUserId} />
      ))}
    </div>
  );
}

function UserRow({ profile, isSelf }: { profile: Profile; isSelf: boolean }) {
  const [isPending, startTransition] = useTransition();

  function changeRole(newRole: UserRole) {
    const formData = new FormData();
    formData.append("user_id", profile.id);
    formData.append("role", newRole);
    startTransition(() => updateUserRole(formData));
  }

  const nextRoles: UserRole[] = (
    ["admin", "coach", "client"] as UserRole[]
  ).filter((r) => r !== profile.role);

  return (
    <div className="flex items-center justify-between gap-2 py-2 border-b border-border last:border-0">
      <div className="min-w-0 flex items-center gap-2">
        {isSelf && <Shield className="h-3.5 w-3.5 text-blue-400 shrink-0" />}
        <div>
          <p className="text-sm font-medium truncate">
            {profile.first_name} {profile.last_name}
            {isSelf && (
              <span className="text-xs text-muted-foreground ml-1">(you)</span>
            )}
          </p>
          <p className="text-xs text-muted-foreground truncate">
            {profile.email}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <Badge
          variant="outline"
          className={`text-[10px] ${roleBadgeStyles[profile.role]}`}
        >
          {profile.role.toUpperCase()}
        </Badge>
        {isSelf ? (
          <span className="text-[10px] text-muted-foreground italic">
            Protected
          </span>
        ) : isPending ? (
          <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
        ) : (
          <div className="flex gap-1">
            {nextRoles.map((role) => (
              <Button
                key={role}
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-[10px]"
                onClick={() => changeRole(role)}
              >
                &rarr; {role}
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
