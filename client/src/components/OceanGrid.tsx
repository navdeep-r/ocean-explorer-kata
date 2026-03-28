"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Coordinate } from "@/lib/api";

interface OceanGridProps {
  width: number;
  height: number;
  probePosition: Coordinate | null;
  probeDirection: string | null;
  obstacles: Coordinate[];
  visitedCoordinates: Coordinate[];
  isConfigured: boolean;
}

const directionArrows: Record<string, string> = {
  N: "↑",
  E: "→",
  S: "↓",
  W: "←",
};

const directionRotation: Record<string, string> = {
  N: "rotate-0",
  E: "rotate-90",
  S: "rotate-180",
  W: "-rotate-90",
};

export default function OceanGrid({
  width,
  height,
  probePosition,
  probeDirection,
  obstacles,
  visitedCoordinates,
  isConfigured,
}: OceanGridProps) {
  const obstacleSet = new Set(obstacles.map((o) => `${o.x},${o.y}`));
  const visitedSet = new Set(visitedCoordinates.map((v) => `${v.x},${v.y}`));

  // Calculate visit order for path visualization
  const visitOrder = new Map<string, number>();
  visitedCoordinates.forEach((v, i) => {
    const key = `${v.x},${v.y}`;
    if (!visitOrder.has(key)) visitOrder.set(key, i);
  });

  const cellSize = Math.min(
    Math.max(28, Math.floor(500 / Math.max(width, height))),
    56
  );

  return (
    <Card className="glass-panel border-cyan-glow/10 flex-1">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold text-cyan-glow flex items-center gap-2">
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
          </svg>
          Ocean Floor Map
          {isConfigured && (
            <span className="text-xs text-muted-foreground font-normal ml-auto">
              {width} × {height}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!isConfigured ? (
          <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 mx-auto rounded-full bg-cyan-glow/5 border border-cyan-glow/10 flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-8 h-8 text-cyan-glow/30" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M12 3C8.5 3 6 5.5 6 8c0 1.5.5 2.5 1 3.5L5 21h14l-2-9.5c.5-1 1-2 1-3.5 0-2.5-2.5-5-6-5z" />
                  <circle cx="12" cy="8" r="2" />
                </svg>
              </div>
              <p>Configure grid to begin exploration</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            {/* Y-axis label */}
            <div className="flex items-start gap-2">
              <div className="flex flex-col items-center justify-between" style={{ height: height * (cellSize + 2) }}>
                <span className="text-[10px] text-muted-foreground">{height - 1}</span>
                <span className="text-[10px] text-muted-foreground -rotate-90 whitespace-nowrap">Y axis</span>
                <span className="text-[10px] text-muted-foreground">0</span>
              </div>

              {/* Grid */}
              <div
                className="grid gap-[2px] p-2 rounded-lg bg-ocean-900/50 border border-cyan-glow/10"
                style={{
                  gridTemplateColumns: `repeat(${width}, ${cellSize}px)`,
                  gridTemplateRows: `repeat(${height}, ${cellSize}px)`,
                }}
              >
                {Array.from({ length: height }).map((_, rowIdx) => {
                  const y = height - 1 - rowIdx;
                  return Array.from({ length: width }).map((_, x) => {
                    const key = `${x},${y}`;
                    const isProbe =
                      probePosition?.x === x && probePosition?.y === y;
                    const isObstacle = obstacleSet.has(key);
                    const isVisited = visitedSet.has(key);
                    const order = visitOrder.get(key);

                    return (
                      <div
                        key={key}
                        className={`grid-cell rounded-sm flex items-center justify-center text-xs font-mono relative transition-all duration-300 ${
                          isProbe
                            ? "bg-cyan-glow/30 border-2 border-cyan-glow probe-pulse"
                            : isObstacle
                            ? "bg-amber-warn/20 border border-amber-warn/40"
                            : isVisited
                            ? "bg-teal-glow/10 border border-teal-glow/20"
                            : "bg-ocean-800/30 border border-ocean-700/20 hover:bg-ocean-700/30"
                        }`}
                        style={{ width: cellSize, height: cellSize }}
                        title={`(${x}, ${y})`}
                      >
                        {isProbe ? (
                          <div className={`text-cyan-glow font-bold text-base ${directionRotation[probeDirection || "N"]} transition-transform duration-300`}>
                            ▲
                          </div>
                        ) : isObstacle ? (
                          <span className="text-amber-warn text-xs">◆</span>
                        ) : isVisited && order !== undefined ? (
                          <span className="text-teal-glow/60 text-[10px]">{order}</span>
                        ) : null}
                      </div>
                    );
                  });
                })}
              </div>
            </div>

            {/* X-axis label */}
            <div className="flex items-center gap-2 pl-6">
              <span className="text-[10px] text-muted-foreground">0</span>
              <span className="text-[10px] text-muted-foreground flex-1 text-center">X axis</span>
              <span className="text-[10px] text-muted-foreground">{width - 1}</span>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 text-[10px] text-muted-foreground mt-1">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-sm bg-cyan-glow/30 border border-cyan-glow" />
                Probe
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-sm bg-amber-warn/20 border border-amber-warn/40" />
                Obstacle
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-sm bg-teal-glow/10 border border-teal-glow/20" />
                Visited
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
