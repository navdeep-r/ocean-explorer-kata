const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export interface Coordinate {
  x: number;
  y: number;
}

export interface CommandResult {
  command: string;
  success: boolean;
  message: string;
  position: Coordinate;
  direction: string;
}

export interface ProbeState {
  position: Coordinate;
  direction: string;
  visitedCoordinates: Coordinate[];
  commandHistory: CommandResult[];
  invalidMoveCount: number;
  totalSteps: number;
  status: 'idle' | 'running' | 'completed';
}

export interface ProbeSummary {
  visitedCoordinates: Coordinate[];
  totalSteps: number;
  invalidMoveCount: number;
  finalPosition: Coordinate;
  finalDirection: string;
  commandHistory: CommandResult[];
}

export interface GridSetupPayload {
  width: number;
  height: number;
  startX: number;
  startY: number;
  direction: string;
  obstacles: Coordinate[];
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  errors?: string[];
  message?: string;
  state?: ProbeState;
  grid?: { width: number; height: number; obstacles: Coordinate[] };
  results?: CommandResult[];
  result?: CommandResult;
  summary?: ProbeSummary;
  data?: T;
}

async function request<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  return res.json();
}

export const api = {
  setupGrid: (payload: GridSetupPayload) =>
    request('/grid/setup', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  sendCommands: (commands: string[]) =>
    request('/probe/commands', {
      method: 'POST',
      body: JSON.stringify({ commands }),
    }),

  sendStep: (command: string) =>
    request('/probe/step', {
      method: 'POST',
      body: JSON.stringify({ command }),
    }),

  getState: () => request('/probe/state'),

  getSummary: () => request('/probe/summary'),

  reset: () =>
    request('/probe/reset', {
      method: 'POST',
    }),
};
