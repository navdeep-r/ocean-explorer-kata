"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import type { Coordinate, CommandResult } from "@/lib/api";

interface SummaryPanelProps {
  visitedCoordinates: Coordinate[];
  totalSteps: number;
  invalidMoveCount: number;
  finalPosition: Coordinate | null;
  finalDirection: string | null;
  commandHistory: CommandResult[];
  isConfigured: boolean;
}

const directionNames: Record<string, string> = {
  N: "North",
  E: "East",
  S: "South",
  W: "West",
};

export default function SummaryPanel({
  visitedCoordinates,
  totalSteps,
  invalidMoveCount,
  finalPosition,
  finalDirection,
  commandHistory,
  isConfigured,
}: SummaryPanelProps) {
  const successCount = commandHistory.filter((c) => c.success).length;
  const failCount = commandHistory.filter((c) => !c.success).length;
  const errorLogs = commandHistory.filter((c) => !c.success);

  const exportSummary = () => {
    const data = {
      visitedCoordinates,
      totalSteps,
      invalidMoveCount,
      finalPosition,
      finalDirection: finalDirection ? directionNames[finalDirection] : null,
      commandHistory: commandHistory.map((c, i) => ({
        step: i + 1,
        command: c.command,
        success: c.success,
        message: c.message,
        position: c.position,
      })),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ocean-explorer-summary.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isConfigured) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 fade-in">
      {/* Summary Stats */}
      <Card className="glass-panel border-cyan-glow/10">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-cyan-glow flex items-center gap-2">
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M3 9h18M9 21V9" />
            </svg>
            Mission Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-background/50 rounded-md p-2.5 text-center">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Total Steps</p>
              <p className="text-xl font-mono text-foreground font-bold">{totalSteps}</p>
            </div>
            <div className="bg-background/50 rounded-md p-2.5 text-center">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Unique Cells</p>
              <p className="text-xl font-mono text-teal-glow font-bold">
                {new Set(visitedCoordinates.map((v) => `${v.x},${v.y}`)).size}
              </p>
            </div>
            <div className="bg-background/50 rounded-md p-2.5 text-center">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Successful</p>
              <p className="text-xl font-mono text-emerald-ok font-bold">{successCount}</p>
            </div>
            <div className="bg-background/50 rounded-md p-2.5 text-center">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Blocked</p>
              <p className="text-xl font-mono text-amber-warn font-bold">{failCount}</p>
            </div>
          </div>

          {finalPosition && (
            <div className="bg-background/50 rounded-md p-2.5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Final Position</p>
                  <p className="text-sm font-mono text-cyan-glow">
                    ({finalPosition.x}, {finalPosition.y}) facing {directionNames[finalDirection || "N"]}
                  </p>
                </div>
              </div>
            </div>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={exportSummary}
            className="w-full h-7 text-xs border-cyan-glow/20 hover:bg-cyan-glow/10 text-cyan-glow"
          >
            Export Summary (JSON)
          </Button>
        </CardContent>
      </Card>

      {/* Visited Coordinates */}
      <Card className="glass-panel border-cyan-glow/10">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-cyan-glow flex items-center gap-2">
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            Visited Coordinates
            <Badge variant="outline" className="text-[10px] ml-auto border-cyan-glow/20 text-muted-foreground">
              {visitedCoordinates.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-40">
            {visitedCoordinates.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-6">No coordinates visited</p>
            ) : (
              <div className="grid grid-cols-4 gap-1">
                {visitedCoordinates.map((coord, i) => (
                  <div
                    key={i}
                    className="bg-background/50 rounded px-2 py-1 text-center text-[11px] font-mono text-teal-glow/80 border border-teal-glow/10"
                  >
                    <span className="text-muted-foreground/50 text-[9px]">{i}:</span> ({coord.x},{coord.y})
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Error Log */}
      <Card className="glass-panel border-cyan-glow/10">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-cyan-glow flex items-center gap-2">
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            Blocked Actions Log
            {errorLogs.length > 0 && (
              <Badge variant="outline" className="text-[10px] ml-auto border-amber-warn/30 text-amber-warn">
                {errorLogs.length}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-40">
            {errorLogs.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-6">No blocked actions</p>
            ) : (
              <div className="space-y-1">
                {errorLogs.map((err, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2 px-2 py-1.5 rounded-md bg-amber-warn/5 border border-amber-warn/10 text-xs"
                  >
                    <span className="text-amber-warn mt-0.5">⚠</span>
                    <span className="text-muted-foreground">{err.message}</span>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
