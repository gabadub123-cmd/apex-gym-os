import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronRight } from "lucide-react";
import type { Profile } from "@/lib/types/database";

const phaseColors: Record<string, string> = {
  bulk: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  cut: "bg-red-500/20 text-red-400 border-red-500/30",
  maintenance: "bg-green-500/20 text-green-400 border-green-500/30",
  unknown: "bg-muted text-muted-foreground",
};

interface ClientCardProps {
  client: Profile;
  currentPhase: string;
  eventCount: number;
}

export function ClientCard({ client, currentPhase, eventCount }: ClientCardProps) {
  const initials = `${client.first_name[0]}${client.last_name[0]}`.toUpperCase();
  const phaseKey = currentPhase.toLowerCase();
  const phaseColor = phaseColors[phaseKey] || phaseColors.unknown;

  return (
    <Link href={`/dashboard/clients/${client.id}`}>
      <Card className="group hover:border-primary/50 transition-colors cursor-pointer">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="text-sm">{initials}</AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <p className="font-semibold truncate">
                {client.first_name} {client.last_name}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className={`text-[10px] ${phaseColor}`}>
                  {currentPhase}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {eventCount} events
                </span>
              </div>
            </div>

            <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
