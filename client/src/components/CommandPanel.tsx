"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import type { Coordinate, CommandResult } from "@/lib/api";

interface CommandPanelProps {
  onBatchExecute: (commands: string[]) => void;
  onStep: (command: string) => void;
  isConfigured: boolean;
  probePosition: Coordinate | null;
  probeDirection: string | null;
  commandHistory: CommandResult[];
  invalidMoveCount: number;
  totalSteps: number;
  status: string;
}

const COMMAND_BUTTONS = [
  { cmd: "F", label: "Forward", icon: "▲", shortcut: "W" },
  { cmd: "L", label: "Left", icon: "◀", shortcut: "A" },
  { cmd: "B", label: "Backward", icon: "▼", shortcut: "S" },
  { cmd: "R", label: "Right", icon: "▶", shortcut: "D" },
];

const directionNames: Record<string, string> = {
  N: "North",
  E: "East",
  S: "South",
  W: "West",
};

export default function CommandPanel({
  onBatchExecute,
  onStep,
  isConfigured,
  probePosition,
  probeDirection,
  commandHistory,
  invalidMoveCount,
  totalSteps,
  status,
}: CommandPanelProps) {
  const [batchInput, setBatchInput] = useState("");

  const handleBatch = () => {
    const cmds = batchInput
      .toUpperCase()
      .split("")
      .filter((c) => "FBLR".includes(c));
    if (cmds.length > 0) {
      onBatchExecute(cmds);
      setBatchInput("");
    }
  };

  return (
    <div className="space-y-3">
      {/* Live State */}
      <Card className="glass-panel border-cyan-glow/10">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-cyan-glow flex items-center gap-2">
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
            Probe Telemetry
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {isConfigured && probePosition ? (
            <>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-background/50 rounded-md p-2 text-center">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Position</p>
                  <p className="text-sm font-mono text-cyan-glow">
                    ({probePosition.x}, {probePosition.y})
                  </p>
                </div>
                <div className="bg-background/50 rounded-md p-2 text-center">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Heading</p>
                  <p className="text-sm font-mono text-cyan-glow">
                    {directionNames[probeDirection || "N"]}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-background/50 rounded-md p-2 text-center">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Steps</p>
                  <p className="text-sm font-mono text-foreground">{totalSteps}</p>
                </div>
                <div className="bg-background/50 rounded-md p-2 text-center">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Blocked</p>
                  <p className="text-sm font-mono text-amber-warn">{invalidMoveCount}</p>
                </div>
                <div className="bg-background/50 rounded-md p-2 text-center">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Status</p>
                  <p className="text-sm font-mono text-emerald-ok capitalize">{status}</p>
                </div>
              </div>
            </>
          ) : (
            <p className="text-xs text-muted-foreground text-center py-4">
              Awaiting grid initialization…
            </p>
          )}
        </CardContent>
      </Card>

      {/* Controls */}
      <Card className="glass-panel border-cyan-glow/10">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-cyan-glow flex items-center gap-2">
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
            Controls
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Step Buttons */}
          <div className="grid grid-cols-3 gap-1.5">
            <div />
            <Button
              variant="outline"
              size="sm"
              disabled={!isConfigured}
              onClick={() => onStep("F")}
              className="h-10 text-xs border-cyan-glow/20 hover:bg-cyan-glow/10 text-cyan-glow"
            >
              ▲ Fwd
            </Button>
            <div />
            <Button
              variant="outline"
              size="sm"
              disabled={!isConfigured}
              onClick={() => onStep("L")}
              className="h-10 text-xs border-cyan-glow/20 hover:bg-cyan-glow/10 text-cyan-glow"
            >
              ◀ Left
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={!isConfigured}
              onClick={() => onStep("B")}
              className="h-10 text-xs border-cyan-glow/20 hover:bg-cyan-glow/10 text-cyan-glow"
            >
              ▼ Back
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={!isConfigured}
              onClick={() => onStep("R")}
              className="h-10 text-xs border-cyan-glow/20 hover:bg-cyan-glow/10 text-cyan-glow"
            >
              Right ▶
            </Button>
          </div>

          <Separator className="bg-cyan-glow/10" />

          {/* Batch Input */}
          <div className="space-y-1.5">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
              Batch Commands (F, B, L, R)
            </p>
            <div className="flex gap-2">
              <input
                id="batch-commands"
                type="text"
                value={batchInput}
                onChange={(e) => setBatchInput(e.target.value)}
                placeholder="e.g. FFRFFLB"
                disabled={!isConfigured}
                className="flex-1 h-8 text-sm bg-background/50 border border-cyan-glow/15 rounded-md px-2 text-foreground placeholder:text-muted-foreground/50 focus:border-cyan-glow/40 focus:outline-none disabled:opacity-50"
              />
              <Button
                variant="outline"
                size="sm"
                disabled={!isConfigured || !batchInput.trim()}
                onClick={handleBatch}
                className="h-8 text-xs border-cyan-glow/20 hover:bg-cyan-glow/10 text-cyan-glow"
              >
                Run
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Command History */}
      <Card className="glass-panel border-cyan-glow/10">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-cyan-glow flex items-center gap-2">
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" />
            </svg>
            Command History
            {commandHistory.length > 0 && (
              <Badge variant="outline" className="text-[10px] ml-auto border-cyan-glow/20 text-muted-foreground">
                {commandHistory.length}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-48">
            {commandHistory.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-6">
                No commands executed yet
              </p>
            ) : (
              <div className="space-y-1">
                {commandHistory.map((cmd, i) => (
                  <div
                    key={i}
                    className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-xs fade-in ${
                      cmd.success
                        ? "bg-emerald-ok/5 border border-emerald-ok/10"
                        : "bg-red-alert/5 border border-red-alert/10"
                    }`}
                  >
                    <Badge
                      variant="outline"
                      className={`text-[10px] w-5 h-5 p-0 flex items-center justify-center ${
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
                    <span className="text-[10px] text-muted-foreground/60 font-mono">
                      #{i + 1}
                    </span>
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
