export enum Direction {
  North = 'N',
  East = 'E',
  South = 'S',
  West = 'W',
}

export type Coordinate = { x: number; y: number };

export interface CommandResult {
  command: string;
  success: boolean;
  message: string;
  position: Coordinate;
  direction: Direction;
}

export interface ProbeState {
  position: Coordinate;
  direction: Direction;
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
  finalDirection: Direction;
  commandHistory: CommandResult[];
}

const LEFT_TURN: Record<Direction, Direction> = {
  [Direction.North]: Direction.West,
  [Direction.West]: Direction.South,
  [Direction.South]: Direction.East,
  [Direction.East]: Direction.North,
};

const RIGHT_TURN: Record<Direction, Direction> = {
  [Direction.North]: Direction.East,
  [Direction.East]: Direction.South,
  [Direction.South]: Direction.West,
  [Direction.West]: Direction.North,
};

const DIRECTION_VECTORS: Record<Direction, Coordinate> = {
  [Direction.North]: { x: 0, y: 1 },
  [Direction.East]: { x: 1, y: 0 },
  [Direction.South]: { x: 0, y: -1 },
  [Direction.West]: { x: -1, y: 0 },
};

export class Probe {
  private position: Coordinate;
  private direction: Direction;
  private visitedCoordinates: Coordinate[] = [];
  private commandHistory: CommandResult[] = [];
  private invalidMoveCount = 0;
  private totalSteps = 0;
  private status: 'idle' | 'running' | 'completed' = 'idle';

  private gridWidth: number;
  private gridHeight: number;
  private obstacles: Set<string>;

  constructor(
    startX: number,
    startY: number,
    direction: Direction,
    gridWidth: number,
    gridHeight: number,
    obstacles: Coordinate[] = []
  ) {
    this.position = { x: startX, y: startY };
    this.direction = direction;
    this.gridWidth = gridWidth;
    this.gridHeight = gridHeight;
    this.obstacles = new Set(obstacles.map((o) => `${o.x},${o.y}`));
    this.visitedCoordinates.push({ ...this.position });
  }

  private coordKey(x: number, y: number): string {
    return `${x},${y}`;
  }

  private isInBounds(x: number, y: number): boolean {
    return x >= 0 && x < this.gridWidth && y >= 0 && y < this.gridHeight;
  }

  private hasObstacle(x: number, y: number): boolean {
    return this.obstacles.has(this.coordKey(x, y));
  }

  turnLeft(): CommandResult {
    this.direction = LEFT_TURN[this.direction];
    this.totalSteps++;
    const result: CommandResult = {
      command: 'L',
      success: true,
      message: `Turned left. Now facing ${this.directionName()}`,
      position: { ...this.position },
      direction: this.direction,
    };
    this.commandHistory.push(result);
    return result;
  }

  turnRight(): CommandResult {
    this.direction = RIGHT_TURN[this.direction];
    this.totalSteps++;
    const result: CommandResult = {
      command: 'R',
      success: true,
      message: `Turned right. Now facing ${this.directionName()}`,
      position: { ...this.position },
      direction: this.direction,
    };
    this.commandHistory.push(result);
    return result;
  }

  moveForward(): CommandResult {
    return this.move('F', DIRECTION_VECTORS[this.direction]);
  }

  moveBackward(): CommandResult {
    const vec = DIRECTION_VECTORS[this.direction];
    return this.move('B', { x: -vec.x, y: -vec.y });
  }

  private move(command: string, vector: Coordinate): CommandResult {
    const newX = this.position.x + vector.x;
    const newY = this.position.y + vector.y;

    if (!this.isInBounds(newX, newY)) {
      this.invalidMoveCount++;
      this.totalSteps++;
      const result: CommandResult = {
        command,
        success: false,
        message: `Blocked: position (${newX}, ${newY}) is outside grid boundaries`,
        position: { ...this.position },
        direction: this.direction,
      };
      this.commandHistory.push(result);
      return result;
    }

    if (this.hasObstacle(newX, newY)) {
      this.invalidMoveCount++;
      this.totalSteps++;
      const result: CommandResult = {
        command,
        success: false,
        message: `Blocked: obstacle detected at (${newX}, ${newY})`,
        position: { ...this.position },
        direction: this.direction,
      };
      this.commandHistory.push(result);
      return result;
    }

    this.position = { x: newX, y: newY };
    this.visitedCoordinates.push({ ...this.position });
    this.totalSteps++;
    const result: CommandResult = {
      command,
      success: true,
      message: `Moved ${command === 'F' ? 'forward' : 'backward'} to (${newX}, ${newY})`,
      position: { ...this.position },
      direction: this.direction,
    };
    this.commandHistory.push(result);
    return result;
  }

  executeCommand(command: string): CommandResult {
    const cmd = command.toUpperCase().trim();
    switch (cmd) {
      case 'F': return this.moveForward();
      case 'B': return this.moveBackward();
      case 'L': return this.turnLeft();
      case 'R': return this.turnRight();
      default:
        this.invalidMoveCount++;
        this.totalSteps++;
        const result: CommandResult = {
          command: cmd,
          success: false,
          message: `Invalid command: "${cmd}". Use F (forward), B (backward), L (left), R (right)`,
          position: { ...this.position },
          direction: this.direction,
        };
        this.commandHistory.push(result);
        return result;
    }
  }

  executeBatch(commands: string[]): CommandResult[] {
    this.status = 'running';
    const results = commands.map((cmd) => this.executeCommand(cmd));
    this.status = 'completed';
    return results;
  }

  getState(): ProbeState {
    return {
      position: { ...this.position },
      direction: this.direction,
      visitedCoordinates: [...this.visitedCoordinates],
      commandHistory: [...this.commandHistory],
      invalidMoveCount: this.invalidMoveCount,
      totalSteps: this.totalSteps,
      status: this.status,
    };
  }

  getSummary(): ProbeSummary {
    return {
      visitedCoordinates: [...this.visitedCoordinates],
      totalSteps: this.totalSteps,
      invalidMoveCount: this.invalidMoveCount,
      finalPosition: { ...this.position },
      finalDirection: this.direction,
      commandHistory: [...this.commandHistory],
    };
  }

  private directionName(): string {
    const names: Record<Direction, string> = {
      [Direction.North]: 'North',
      [Direction.East]: 'East',
      [Direction.South]: 'South',
      [Direction.West]: 'West',
    };
    return names[this.direction];
  }
}
