"use client";

import { useRef, useEffect, useState } from "react";
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
  const containerRef = useRef<HTMLDivElement>(null);
  const [cellSize, setCellSize] = useState(32);

  const obstacleSet = new Set(obstacles.map((o) => `${o.x},${o.y}`));
  const visitedSet = new Set(visitedCoordinates.map((v) => `${v.x},${v.y}`));

  // Calculate visit order for path visualization
  const visitOrder = new Map<string, number>();
  visitedCoordinates.forEach((v, i) => {
    const key = `${v.x},${v.y}`;
    if (!visitOrder.has(key)) visitOrder.set(key, i);
  });

  // Auto-fit cell size to container — recalc on resize & grid change
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !isConfigured) return;

    const compute = () => {
      // Available space minus padding (axis labels ~24px, legend ~28px, gaps)
      const availW = container.clientWidth - 40;
      const availH = container.clientHeight - 60;
      const gap = 2;
      const maxCellW = Math.floor((availW - gap * (width - 1)) / width);
      const maxCellH = Math.floor((availH - gap * (height - 1)) / height);
      const size = Math.max(8, Math.min(maxCellW, maxCellH, 56));
      setCellSize(size);
    };

    compute();
    const ro = new ResizeObserver(compute);
    ro.observe(container);
    return () => ro.disconnect();
  }, [width, height, isConfigured]);

  const gap = 2;

  return (
    <Card className="glass-panel border-cyan-glow/10 flex-1 flex flex-col min-h-0">
      <CardHeader className="pb-2 shrink-0">
        <CardTitle className="text-sm font-semibold text-cyan-glow flex items-center gap-2">
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
          </svg>
          Ocean Floor Map
          {isConfigured && (
            <span className="text-xs text-muted-foreground font-normal ml-auto">
              {width} × {height} · {cellSize}px
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent ref={containerRef} className="flex-1 min-h-0 flex items-center justify-center overflow-auto scroll-thin grid-bg rounded-b-xl">
        {!isConfigured ? (
          <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
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
          <div className="flex flex-col items-center gap-2">
            {/* Y-axis label + grid */}
            <div className="flex items-start gap-1.5">
              <div
                className="flex flex-col items-center justify-between shrink-0"
                style={{ height: height * (cellSize + gap) - gap }}
              >
                <span className="text-[9px] font-mono text-muted-foreground/60">{height - 1}</span>
                <span className="text-[8px] font-mono text-muted-foreground/40 -rotate-90 whitespace-nowrap tracking-widest">Y</span>
                <span className="text-[9px] font-mono text-muted-foreground/60">0</span>
              </div>

              {/* Grid */}
              <div
                className="grid"
                style={{
                  gridTemplateColumns: `repeat(${width}, ${cellSize}px)`,
                  gridTemplateRows: `repeat(${height}, ${cellSize}px)`,
                  gap: `${gap}px`,
                }}
              >
                {Array.from({ length: height }).map((_, rowIdx) => {
                  const y = height - 1 - rowIdx;
                  return Array.from({ length: width }).map((_, x) => {
                    const key = `${x},${y}`;
                    const isProbe = probePosition?.x === x && probePosition?.y === y;
                    const isObstacle = obstacleSet.has(key);
                    const isVisited = visitedSet.has(key);
                    const order = visitOrder.get(key);

                    return (
                      <div
                        key={key}
                        className={`grid-cell rounded-sm flex items-center justify-center font-mono relative ${
                          isProbe
                            ? "bg-cyan-glow/25 border-[1.5px] border-cyan-glow probe-pulse"
                            : isObstacle
                            ? "bg-amber-warn/15 border border-amber-warn/30"
                            : isVisited
                            ? "bg-teal-glow/8 border border-teal-glow/15"
                            : "bg-ocean-800/25 border border-ocean-700/15"
                        }`}
                        style={{ width: cellSize, height: cellSize }}
                        title={`(${x}, ${y})`}
                      >
                        {isProbe ? (
                          <div
                            className={`text-cyan-glow font-bold ${directionRotation[probeDirection || "N"]} transition-transform duration-300`}
                            style={{ fontSize: Math.max(10, cellSize * 0.45) }}
                          >
                            ▲
                          </div>
                        ) : isObstacle ? (
                          <span className="text-amber-warn" style={{ fontSize: Math.max(8, cellSize * 0.3) }}>◆</span>
                        ) : isVisited && order !== undefined ? (
                          cellSize >= 20 ? (
                            <span className="text-teal-glow/50" style={{ fontSize: Math.max(7, cellSize * 0.22) }}>{order}</span>
                          ) : (
                            <div className="w-1 h-1 rounded-full bg-teal-glow/40" />
                          )
                        ) : null}
                      </div>
                    );
                  });
                })}
              </div>
            </div>

            {/* X-axis label */}
            <div className="flex items-center gap-1.5 pl-5" style={{ width: width * (cellSize + gap) - gap + 20 }}>
              <span className="text-[9px] font-mono text-muted-foreground/60">0</span>
              <span className="text-[8px] font-mono text-muted-foreground/40 flex-1 text-center tracking-widest">X</span>
              <span className="text-[9px] font-mono text-muted-foreground/60">{width - 1}</span>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 text-[10px] text-muted-foreground/60">
              <div className="flex items-center gap-1">
                <div className="w-2.5 h-2.5 rounded-sm bg-cyan-glow/25 border border-cyan-glow" />
                Probe
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2.5 h-2.5 rounded-sm bg-amber-warn/15 border border-amber-warn/30" />
                Obstacle
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2.5 h-2.5 rounded-sm bg-teal-glow/8 border border-teal-glow/15" />
                Visited
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
