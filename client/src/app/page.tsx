"use client";

import { useState, useCallback, useEffect } from "react";
import Header from "@/components/Header";
import SetupPanel from "@/components/SetupPanel";
import OceanGrid from "@/components/OceanGrid";
import CommandPanel from "@/components/CommandPanel";
import SummaryPanel from "@/components/SummaryPanel";
import { api, type ProbeState, type Coordinate, type CommandResult, type GridSetupPayload } from "@/lib/api";

export default function Home() {
  const [isConfigured, setIsConfigured] = useState(false);
  const [gridWidth, setGridWidth] = useState(8);
  const [gridHeight, setGridHeight] = useState(8);
  const [obstacles, setObstacles] = useState<Coordinate[]>([]);
  const [probePosition, setProbePosition] = useState<Coordinate | null>(null);
  const [probeDirection, setProbeDirection] = useState<string | null>(null);
  const [visitedCoordinates, setVisitedCoordinates] = useState<Coordinate[]>([]);
  const [commandHistory, setCommandHistory] = useState<CommandResult[]>([]);
  const [invalidMoveCount, setInvalidMoveCount] = useState(0);
  const [totalSteps, setTotalSteps] = useState(0);
  const [status, setStatus] = useState<string>("idle");
  const [systemStatus, setSystemStatus] = useState<"offline" | "ready" | "running" | "completed">("offline");
  const [apiError, setApiError] = useState<string | null>(null);

  // Check API health on mount
  useEffect(() => {
    fetch((process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api") + "/health")
      .then((res) => res.json())
      .then(() => setSystemStatus("ready"))
      .catch(() => setSystemStatus("offline"));
  }, []);

  const updateFromState = useCallback((state: ProbeState) => {
    setProbePosition(state.position);
    setProbeDirection(state.direction);
    setVisitedCoordinates(state.visitedCoordinates);
    setCommandHistory(state.commandHistory);
    setInvalidMoveCount(state.invalidMoveCount);
    setTotalSteps(state.totalSteps);
    setStatus(state.status);
    if (state.status === "completed") {
      setSystemStatus("completed");
    } else {
      setSystemStatus("running");
    }
  }, []);

  const handleSetup = useCallback(async (payload: GridSetupPayload) => {
    setApiError(null);
    try {
      const res = await api.setupGrid(payload);
      if (!res.success) {
        setApiError(res.errors?.join(", ") || "Setup failed");
        return;
      }
      setIsConfigured(true);
      setGridWidth(payload.width);
      setGridHeight(payload.height);
      setObstacles(payload.obstacles);
      if (res.state) updateFromState(res.state);
      setSystemStatus("running");
    } catch {
      setApiError("Failed to connect to API server");
      setSystemStatus("offline");
    }
  }, [updateFromState]);

  const handleStep = useCallback(async (command: string) => {
    setApiError(null);
    try {
      const res = await api.sendStep(command);
      if (!res.success) {
        setApiError(res.errors?.join(", ") || "Step failed");
        return;
      }
      if (res.state) updateFromState(res.state);
    } catch {
      setApiError("Failed to connect to API server");
    }
  }, [updateFromState]);

  const handleBatchExecute = useCallback(async (commands: string[]) => {
    setApiError(null);
    try {
      const res = await api.sendCommands(commands);
      if (!res.success) {
        setApiError(res.errors?.join(", ") || "Batch execution failed");
        return;
      }
      if (res.state) updateFromState(res.state);
    } catch {
      setApiError("Failed to connect to API server");
    }
  }, [updateFromState]);

  const handleReset = useCallback(async () => {
    setApiError(null);
    try {
      await api.reset();
      setIsConfigured(false);
      setProbePosition(null);
      setProbeDirection(null);
      setVisitedCoordinates([]);
      setCommandHistory([]);
      setInvalidMoveCount(0);
      setTotalSteps(0);
      setStatus("idle");
      setObstacles([]);
      setSystemStatus("ready");
    } catch {
      setApiError("Failed to connect to API server");
    }
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    if (!isConfigured) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      switch (e.key.toLowerCase()) {
        case "w":
        case "arrowup":
          e.preventDefault();
          handleStep("F");
          break;
        case "s":
        case "arrowdown":
          e.preventDefault();
          handleStep("B");
          break;
        case "a":
        case "arrowleft":
          e.preventDefault();
          handleStep("L");
          break;
        case "d":
        case "arrowright":
          e.preventDefault();
          handleStep("R");
          break;
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isConfigured, handleStep]);

  return (
    <div className="h-screen flex flex-col gap-3 p-3 max-w-[1600px] mx-auto">
      {/* Header — fixed height */}
      <Header systemStatus={systemStatus} />

      {/* API Error Banner */}
      {apiError && (
        <div className="shrink-0 fade-in px-4 py-2 rounded-lg bg-red-alert/10 border border-red-alert/20 text-red-alert text-xs flex items-center gap-2">
          <span>⚠</span>
          <span className="flex-1">{apiError}</span>
          <button className="text-red-alert/60 hover:text-red-alert" onClick={() => setApiError(null)}>✕</button>
        </div>
      )}

      {/* Main 3-Column Layout — fills remaining height */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-[280px_1fr_300px] gap-3">
        {/* Left Panel — scrollable config */}
        <div className="flex flex-col gap-3 min-h-0 overflow-y-auto scroll-thin">
          <SetupPanel
            onSetup={handleSetup}
            onReset={handleReset}
            isConfigured={isConfigured}
            gridWidth={gridWidth}
            gridHeight={gridHeight}
          />
        </div>

        {/* Center Panel — grid fills available space */}
        <OceanGrid
          width={gridWidth}
          height={gridHeight}
          probePosition={probePosition}
          probeDirection={probeDirection}
          obstacles={obstacles}
          visitedCoordinates={visitedCoordinates}
          isConfigured={isConfigured}
        />

        {/* Right Panel — controls with internal scroll */}
        <CommandPanel
          onBatchExecute={handleBatchExecute}
          onStep={handleStep}
          isConfigured={isConfigured}
          probePosition={probePosition}
          probeDirection={probeDirection}
          commandHistory={commandHistory}
          invalidMoveCount={invalidMoveCount}
          totalSteps={totalSteps}
          status={status}
        />
      </div>

      {/* Bottom Summary — collapsible bar */}
      <SummaryPanel
        visitedCoordinates={visitedCoordinates}
        totalSteps={totalSteps}
        invalidMoveCount={invalidMoveCount}
        finalPosition={probePosition}
        finalDirection={probeDirection}
        commandHistory={commandHistory}
        isConfigured={isConfigured}
      />
    </div>
  );
}
