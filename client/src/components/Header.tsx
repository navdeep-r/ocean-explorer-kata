"use client";

import { Badge } from "@/components/ui/badge";

interface HeaderProps {
  systemStatus: "offline" | "ready" | "running" | "completed";
}

const statusConfig = {
  offline: { label: "Offline", className: "bg-red-alert/20 text-red-alert border-red-alert/30" },
  ready: { label: "Ready", className: "bg-emerald-ok/20 text-emerald-ok border-emerald-ok/30" },
  running: { label: "Running", className: "bg-cyan-glow/20 text-cyan-glow border-cyan-glow/30" },
  completed: { label: "Completed", className: "bg-emerald-ok/20 text-emerald-ok border-emerald-ok/30" },
};

export default function Header({ systemStatus }: HeaderProps) {
  const status = statusConfig[systemStatus];

  return (
    <header className="glass-panel px-6 py-4 flex items-center justify-between rounded-xl glow-cyan">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-cyan-glow/10 border border-cyan-glow/20 flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-6 h-6 text-cyan-glow" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 3C8.5 3 6 5.5 6 8c0 1.5.5 2.5 1 3.5L5 21h14l-2-9.5c.5-1 1-2 1-3.5 0-2.5-2.5-5-6-5z" />
              <circle cx="12" cy="8" r="2" />
              <path d="M9 21v-4h6v4" />
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-foreground glow-text-cyan">
              Ocean Explorer
            </h1>
            <p className="text-xs text-muted-foreground">
              Submersible Probe Control System
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-xs text-muted-foreground">System Status</span>
        <Badge variant="outline" className={`text-xs font-medium ${status.className}`}>
          <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
            systemStatus === "running" ? "animate-pulse bg-cyan-glow" :
            systemStatus === "ready" || systemStatus === "completed" ? "bg-emerald-ok" : "bg-red-alert"
          }`} />
          {status.label}
        </Badge>
      </div>
    </header>
  );
}
