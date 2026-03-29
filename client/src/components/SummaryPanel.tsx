"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
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

type Tab = "stats" | "history" | "path" | "errors";

export default function SummaryPanel({
  visitedCoordinates,
  totalSteps,
  invalidMoveCount,
  finalPosition,
  finalDirection,
  commandHistory,
  isConfigured,
}: SummaryPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("stats");

  const successCount = commandHistory.filter((c) => c.success).length;
  const failCount = commandHistory.filter((c) => !c.success).length;
  const errorLogs = commandHistory.filter((c) => !c.success);
  const uniqueCells = new Set(visitedCoordinates.map((v) => `${v.x},${v.y}`)).size;

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

  const tabs: { key: Tab; label: string; count?: number }[] = [
    { key: "stats", label: "Summary" },
    { key: "history", label: "History", count: commandHistory.length },
    { key: "path", label: "Path", count: visitedCoordinates.length },
    { key: "errors", label: "Blocked", count: failCount },
  ];

  return (
    <Card className="glass-panel border-cyan-glow/10 shrink-0">
      {/* Collapsible header bar — always visible with inline stats */}
      <CardHeader className="py-2 px-4 cursor-pointer select-none" onClick={() => setIsOpen(!isOpen)}>
        <CardTitle className="text-sm font-semibold text-cyan-glow flex items-center gap-3">
          <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M3 9h18M9 21V9" />
          </svg>
          Mission Data

          {/* Inline stat badges — visible even when collapsed */}
          <div className="flex items-center gap-2 ml-auto text-[10px] font-mono">
            <span className="text-foreground/70">{totalSteps} steps</span>
            <span className="text-muted-foreground">·</span>
            <span className="text-teal-glow/70">{uniqueCells} cells</span>
            <span className="text-muted-foreground">·</span>
            <span className="text-emerald-ok/70">{successCount} ok</span>
            {failCount > 0 && (
              <>
                <span className="text-muted-foreground">·</span>
                <span className="text-amber-warn/70">{failCount} blocked</span>
              </>
            )}
            {commandHistory.length > 0 && (
              <>
                <span className="text-muted-foreground">·</span>
                <span className="text-cyan-glow/70">{commandHistory.length} cmds</span>
              </>
            )}
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground shrink-0"
            onClick={(e) => { e.stopPropagation(); exportSummary(); }}
            title="Export JSON"
          >
            <svg viewBox="0 0 20 20" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M6 10l4 4 4-4M10 14V3M3 17h14" />
            </svg>
          </Button>

          <svg
            viewBox="0 0 20 20"
            className={`w-3.5 h-3.5 text-muted-foreground transition-transform shrink-0 ${isOpen ? "rotate-180" : ""}`}
            fill="currentColor"
          >
            <path d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" />
          </svg>
        </CardTitle>
      </CardHeader>

      {/* Expanded content */}
      {isOpen && (
        <CardContent className="pt-0 fade-in">
          {/* Tabs */}
          <div className="flex gap-1 mb-3 border-b border-cyan-glow/8 pb-2">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                  activeTab === tab.key
                    ? "bg-cyan-glow/15 text-cyan-glow"
                    : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                }`}
              >
                {tab.label}
                {tab.count !== undefined && tab.count > 0 && (
                  <span className="ml-1 text-[9px] text-muted-foreground">({tab.count})</span>
                )}
              </button>
            ))}
          </div>

          {/* Stats tab */}
          {activeTab === "stats" && (
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-2">
              <div className="bg-background/50 rounded-md p-2.5 text-center">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Total Steps</p>
                <p className="text-lg font-mono text-foreground font-bold">{totalSteps}</p>
              </div>
              <div className="bg-background/50 rounded-md p-2.5 text-center">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Unique Cells</p>
                <p className="text-lg font-mono text-teal-glow font-bold">{uniqueCells}</p>
              </div>
              <div className="bg-background/50 rounded-md p-2.5 text-center">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Successful</p>
                <p className="text-lg font-mono text-emerald-ok font-bold">{successCount}</p>
              </div>
              <div className="bg-background/50 rounded-md p-2.5 text-center">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Blocked</p>
                <p className="text-lg font-mono text-amber-warn font-bold">{failCount}</p>
              </div>
              {finalPosition && (
                <div className="bg-background/50 rounded-md p-2.5 text-center lg:col-span-1 col-span-2">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Final State</p>
                  <p className="text-sm font-mono text-cyan-glow">
                    ({finalPosition.x},{finalPosition.y}) {directionNames[finalDirection || "N"]}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* History tab — full-width command log */}
          {activeTab === "history" && (
            <ScrollArea className="h-48">
              {commandHistory.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-6">No commands executed yet</p>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-1">
                  {commandHistory.map((cmd, i) => (
                    <div
                      key={i}
                      className={`flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs ${
                        cmd.success
                          ? "bg-emerald-ok/5 border border-emerald-ok/10"
                          : "bg-red-alert/5 border border-red-alert/10"
                      }`}
                    >
                      <Badge
                        variant="outline"
                        className={`text-[10px] w-5 h-5 p-0 flex items-center justify-center shrink-0 ${
                          cmd.success
                            ? "border-emerald-ok/30 text-emerald-ok"
                            : "border-red-alert/30 text-red-alert"
                        }`}
                      >
                        {cmd.command}
                      </Badge>
                      <span className="flex-1 text-muted-foreground truncate">
                        {cmd.message}
                      </span>
                      {cmd.position && (
                        <span className="text-[10px] text-cyan-glow/50 font-mono shrink-0">
                          ({cmd.position.x},{cmd.position.y})
                        </span>
                      )}
                      <span className="text-[10px] text-muted-foreground/40 font-mono shrink-0">
                        #{i + 1}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          )}

          {/* Path tab */}
          {activeTab === "path" && (
            <ScrollArea className="h-36">
              {visitedCoordinates.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-6">No coordinates visited</p>
              ) : (
                <div className="grid grid-cols-6 lg:grid-cols-10 gap-1">
                  {visitedCoordinates.map((coord, i) => (
                    <div
                      key={i}
                      className="bg-background/50 rounded px-1.5 py-0.5 text-center text-[10px] font-mono text-teal-glow/70 border border-teal-glow/10"
                    >
                      {coord.x},{coord.y}
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          )}

          {/* Errors tab */}
          {activeTab === "errors" && (
            <ScrollArea className="h-36">
              {errorLogs.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-6">No blocked actions</p>
              ) : (
                <div className="space-y-1">
                  {errorLogs.map((err, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2 px-2 py-1.5 rounded-md bg-amber-warn/5 border border-amber-warn/10 text-xs"
                    >
                      <span className="text-amber-warn mt-0.5 shrink-0">⚠</span>
                      <span className="text-muted-foreground">{err.message}</span>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          )}
        </CardContent>
      )}
    </Card>
  );
}
