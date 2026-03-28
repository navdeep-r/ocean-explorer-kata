"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import type { Coordinate, GridSetupPayload } from "@/lib/api";

interface SetupPanelProps {
  onSetup: (payload: GridSetupPayload) => void;
  onReset: () => void;
  isConfigured: boolean;
  gridWidth: number;
  gridHeight: number;
}

const DIRECTIONS = [
  { value: "N", label: "North", icon: "↑" },
  { value: "E", label: "East", icon: "→" },
  { value: "S", label: "South", icon: "↓" },
  { value: "W", label: "West", icon: "←" },
];

export default function SetupPanel({ onSetup, onReset, isConfigured, gridWidth: initialW, gridHeight: initialH }: SetupPanelProps) {
  const [width, setWidth] = useState(initialW || 8);
  const [height, setHeight] = useState(initialH || 8);
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const [direction, setDirection] = useState("N");
  const [obstacles, setObstacles] = useState<Coordinate[]>([]);
  const [obsX, setObsX] = useState("");
  const [obsY, setObsY] = useState("");
  const [errors, setErrors] = useState<string[]>([]);

  const addObstacle = () => {
    const x = parseInt(obsX);
    const y = parseInt(obsY);
    if (isNaN(x) || isNaN(y)) {
      setErrors(["Obstacle coordinates must be valid numbers"]);
      return;
    }
    if (x < 0 || x >= width || y < 0 || y >= height) {
      setErrors([`Obstacle must be within grid (0-${width - 1}, 0-${height - 1})`]);
      return;
    }
    if (x === startX && y === startY) {
      setErrors(["Obstacle cannot be at start position"]);
      return;
    }
    if (obstacles.some((o) => o.x === x && o.y === y)) {
      setErrors(["Obstacle already exists at this position"]);
      return;
    }
    setObstacles([...obstacles, { x, y }]);
    setObsX("");
    setObsY("");
    setErrors([]);
  };

  const removeObstacle = (index: number) => {
    setObstacles(obstacles.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    const errs: string[] = [];
    if (width < 1 || width > 50) errs.push("Width must be 1-50");
    if (height < 1 || height > 50) errs.push("Height must be 1-50");
    if (startX < 0 || startX >= width) errs.push(`Start X must be 0-${width - 1}`);
    if (startY < 0 || startY >= height) errs.push(`Start Y must be 0-${height - 1}`);
    if (errs.length > 0) {
      setErrors(errs);
      return;
    }
    setErrors([]);
    onSetup({ width, height, startX, startY, direction, obstacles });
  };

  const handleReset = () => {
    setObstacles([]);
    setErrors([]);
    onReset();
  };

  return (
    <Card className="glass-panel border-cyan-glow/10">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold text-cyan-glow flex items-center gap-2">
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="7" height="7" />
            <rect x="14" y="3" width="7" height="7" />
            <rect x="3" y="14" width="7" height="7" />
            <rect x="14" y="14" width="7" height="7" />
          </svg>
          Grid Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Grid Dimensions */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Width</Label>
            <Input
              id="grid-width"
              type="number"
              min={1}
              max={50}
              value={width}
              onChange={(e) => setWidth(parseInt(e.target.value) || 1)}
              className="h-8 text-sm bg-background/50 border-cyan-glow/15 focus:border-cyan-glow/40"
              disabled={isConfigured}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Height</Label>
            <Input
              id="grid-height"
              type="number"
              min={1}
              max={50}
              value={height}
              onChange={(e) => setHeight(parseInt(e.target.value) || 1)}
              className="h-8 text-sm bg-background/50 border-cyan-glow/15 focus:border-cyan-glow/40"
              disabled={isConfigured}
            />
          </div>
        </div>

        {/* Start Position */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Start X</Label>
            <Input
              id="start-x"
              type="number"
              min={0}
              max={width - 1}
              value={startX}
              onChange={(e) => setStartX(parseInt(e.target.value) || 0)}
              className="h-8 text-sm bg-background/50 border-cyan-glow/15 focus:border-cyan-glow/40"
              disabled={isConfigured}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Start Y</Label>
            <Input
              id="start-y"
              type="number"
              min={0}
              max={height - 1}
              value={startY}
              onChange={(e) => setStartY(parseInt(e.target.value) || 0)}
              className="h-8 text-sm bg-background/50 border-cyan-glow/15 focus:border-cyan-glow/40"
              disabled={isConfigured}
            />
          </div>
        </div>

        {/* Direction */}
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Facing Direction</Label>
          <div className="grid grid-cols-4 gap-1.5">
            {DIRECTIONS.map((d) => (
              <button
                key={d.value}
                onClick={() => !isConfigured && setDirection(d.value)}
                disabled={isConfigured}
                className={`h-8 rounded-md text-xs font-medium transition-all ${
                  direction === d.value
                    ? "bg-cyan-glow/20 text-cyan-glow border border-cyan-glow/40"
                    : "bg-background/50 text-muted-foreground border border-transparent hover:border-cyan-glow/20"
                } disabled:opacity-50`}
              >
                <span className="mr-1">{d.icon}</span>
                {d.value}
              </button>
            ))}
          </div>
        </div>

        {/* Obstacles */}
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Obstacles</Label>
          {!isConfigured && (
            <div className="flex gap-2">
              <Input
                id="obs-x"
                type="number"
                placeholder="X"
                value={obsX}
                onChange={(e) => setObsX(e.target.value)}
                className="h-8 text-sm bg-background/50 border-cyan-glow/15 focus:border-cyan-glow/40 w-16"
              />
              <Input
                id="obs-y"
                type="number"
                placeholder="Y"
                value={obsY}
                onChange={(e) => setObsY(e.target.value)}
                className="h-8 text-sm bg-background/50 border-cyan-glow/15 focus:border-cyan-glow/40 w-16"
              />
              <Button
                size="sm"
                variant="outline"
                onClick={addObstacle}
                className="h-8 text-xs border-cyan-glow/20 hover:bg-cyan-glow/10 text-cyan-glow"
              >
                Add
              </Button>
            </div>
          )}
          {obstacles.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {obstacles.map((obs, i) => (
                <Badge
                  key={i}
                  variant="outline"
                  className="text-xs bg-amber-warn/10 text-amber-warn border-amber-warn/30 cursor-pointer hover:bg-amber-warn/20"
                  onClick={() => !isConfigured && removeObstacle(i)}
                >
                  ({obs.x}, {obs.y}) {!isConfigured && "×"}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Errors */}
        {errors.length > 0 && (
          <div className="space-y-1 fade-in">
            {errors.map((err, i) => (
              <p key={i} className="text-xs text-red-alert">• {err}</p>
            ))}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-1">
          {!isConfigured ? (
            <Button
              onClick={handleSubmit}
              className="flex-1 h-8 text-xs font-medium bg-cyan-glow/20 hover:bg-cyan-glow/30 text-cyan-glow border border-cyan-glow/30"
              variant="outline"
            >
              Initialize Grid
            </Button>
          ) : (
            <Button
              onClick={handleReset}
              variant="outline"
              className="flex-1 h-8 text-xs font-medium border-red-alert/30 hover:bg-red-alert/10 text-red-alert"
            >
              Reset All
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
