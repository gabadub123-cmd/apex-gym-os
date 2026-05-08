"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Video } from "lucide-react";
import type { Exercise } from "@/lib/types/database";

const categoryColors: Record<string, string> = {
  compound: "text-yellow-400 border-yellow-500/30",
  chest: "text-blue-400 border-blue-500/30",
  back: "text-green-400 border-green-500/30",
  shoulders: "text-purple-400 border-purple-500/30",
  legs: "text-red-400 border-red-500/30",
  arms: "text-cyan-400 border-cyan-500/30",
  core: "text-amber-400 border-amber-500/30",
  cardio: "text-pink-400 border-pink-500/30",
  other: "text-muted-foreground",
};

export function ExerciseLibrary({ exercises }: { exercises: Exercise[] }) {
  const [search, setSearch] = useState("");

  const filtered = exercises.filter(
    (e) =>
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-2.5 top-2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search exercises..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 h-8 text-sm"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">
          {exercises.length === 0
            ? "No exercises yet. Add your first exercise above."
            : "No matches found."}
        </p>
      ) : (
        <div className="space-y-1.5 max-h-[400px] overflow-y-auto">
          {filtered.map((ex) => (
            <div
              key={ex.id}
              className="flex items-center justify-between gap-2 py-1.5 px-2 rounded hover:bg-muted/50"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{ex.name}</p>
                {ex.instructions && (
                  <p className="text-xs text-muted-foreground truncate">
                    {ex.instructions}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                {ex.video_url && (
                  <Video className="h-3.5 w-3.5 text-muted-foreground" />
                )}
                <Badge
                  variant="outline"
                  className={`text-[10px] ${categoryColors[ex.category] || ""}`}
                >
                  {ex.category}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
