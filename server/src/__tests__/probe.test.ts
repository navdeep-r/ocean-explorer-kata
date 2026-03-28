import { Probe, Direction } from '../engine/probe';
import { validateGridSetup, validateCommands } from '../engine/grid';

describe('Probe Engine', () => {
  let probe: Probe;

  beforeEach(() => {
    probe = new Probe(2, 2, Direction.North, 5, 5);
  });

  describe('Turning', () => {
    test('turn left from North → West', () => {
      const r = probe.turnLeft();
      expect(r.direction).toBe(Direction.West);
      expect(r.success).toBe(true);
    });

    test('turn left from West → South', () => {
      probe.turnLeft(); // W
      const r = probe.turnLeft();
      expect(r.direction).toBe(Direction.South);
    });

    test('turn left from South → East', () => {
      probe.turnLeft(); // W
      probe.turnLeft(); // S
      const r = probe.turnLeft();
      expect(r.direction).toBe(Direction.East);
    });

    test('turn left from East → North', () => {
      probe.turnLeft(); // W
      probe.turnLeft(); // S
      probe.turnLeft(); // E
      const r = probe.turnLeft();
      expect(r.direction).toBe(Direction.North);
    });

    test('turn right from North → East', () => {
      const r = probe.turnRight();
      expect(r.direction).toBe(Direction.East);
      expect(r.success).toBe(true);
    });

    test('turn right from East → South', () => {
      probe.turnRight(); // E
      const r = probe.turnRight();
      expect(r.direction).toBe(Direction.South);
    });

    test('turn right from South → West', () => {
      probe.turnRight(); // E
      probe.turnRight(); // S
      const r = probe.turnRight();
      expect(r.direction).toBe(Direction.West);
    });

    test('turn right from West → North', () => {
      probe.turnRight(); // E
      probe.turnRight(); // S
      probe.turnRight(); // W
      const r = probe.turnRight();
      expect(r.direction).toBe(Direction.North);
    });

    test('turning does not change position', () => {
      probe.turnLeft();
      probe.turnRight();
      const state = probe.getState();
      expect(state.position).toEqual({ x: 2, y: 2 });
    });
  });

  describe('Forward Movement', () => {
    test('move forward facing North increases y', () => {
      const r = probe.moveForward();
      expect(r.position).toEqual({ x: 2, y: 3 });
      expect(r.success).toBe(true);
    });

    test('move forward facing East increases x', () => {
      probe.turnRight(); // E
      const r = probe.moveForward();
      expect(r.position).toEqual({ x: 3, y: 2 });
    });

    test('move forward facing South decreases y', () => {
      probe.turnRight(); // E
      probe.turnRight(); // S
      const r = probe.moveForward();
      expect(r.position).toEqual({ x: 2, y: 1 });
    });

    test('move forward facing West decreases x', () => {
      probe.turnLeft(); // W
      const r = probe.moveForward();
      expect(r.position).toEqual({ x: 1, y: 2 });
    });
  });

  describe('Backward Movement', () => {
    test('move backward facing North decreases y', () => {
      const r = probe.moveBackward();
      expect(r.position).toEqual({ x: 2, y: 1 });
      expect(r.success).toBe(true);
    });

    test('move backward facing East decreases x', () => {
      probe.turnRight(); // E
      const r = probe.moveBackward();
      expect(r.position).toEqual({ x: 1, y: 2 });
    });
  });

  describe('Boundary Blocking', () => {
    test('blocks movement beyond north boundary', () => {
      const edgeProbe = new Probe(2, 4, Direction.North, 5, 5);
      const r = edgeProbe.moveForward();
      expect(r.success).toBe(false);
      expect(r.position).toEqual({ x: 2, y: 4 });
      expect(r.message).toContain('outside grid boundaries');
    });

    test('blocks movement beyond south boundary', () => {
      const edgeProbe = new Probe(2, 0, Direction.South, 5, 5);
      const r = edgeProbe.moveForward();
      expect(r.success).toBe(false);
      expect(r.position).toEqual({ x: 2, y: 0 });
    });

    test('blocks movement beyond east boundary', () => {
      const edgeProbe = new Probe(4, 2, Direction.East, 5, 5);
      const r = edgeProbe.moveForward();
      expect(r.success).toBe(false);
      expect(r.position).toEqual({ x: 4, y: 2 });
    });

    test('blocks movement beyond west boundary', () => {
      const edgeProbe = new Probe(0, 2, Direction.West, 5, 5);
      const r = edgeProbe.moveForward();
      expect(r.success).toBe(false);
      expect(r.position).toEqual({ x: 0, y: 2 });
    });

    test('blocks backward movement beyond boundary', () => {
      const edgeProbe = new Probe(2, 4, Direction.South, 5, 5);
      const r = edgeProbe.moveBackward();
      expect(r.success).toBe(false);
      expect(r.position).toEqual({ x: 2, y: 4 });
    });
  });

  describe('Obstacle Blocking', () => {
    test('blocks forward movement into obstacle', () => {
      const p = new Probe(2, 2, Direction.North, 5, 5, [{ x: 2, y: 3 }]);
      const r = p.moveForward();
      expect(r.success).toBe(false);
      expect(r.position).toEqual({ x: 2, y: 2 });
      expect(r.message).toContain('obstacle detected');
    });

    test('blocks backward movement into obstacle', () => {
      const p = new Probe(2, 2, Direction.North, 5, 5, [{ x: 2, y: 1 }]);
      const r = p.moveBackward();
      expect(r.success).toBe(false);
      expect(r.position).toEqual({ x: 2, y: 2 });
    });
  });

  describe('Visited Coordinate Tracking', () => {
    test('starting position is tracked', () => {
      const state = probe.getState();
      expect(state.visitedCoordinates).toEqual([{ x: 2, y: 2 }]);
    });

    test('tracks all visited positions', () => {
      probe.moveForward(); // (2,3)
      probe.moveForward(); // (2,4)
      probe.turnRight();
      probe.moveForward(); // (3,4)
      const state = probe.getState();
      expect(state.visitedCoordinates).toEqual([
        { x: 2, y: 2 },
        { x: 2, y: 3 },
        { x: 2, y: 4 },
        { x: 3, y: 4 },
      ]);
    });

    test('failed moves do not add to visited', () => {
      const p = new Probe(0, 0, Direction.South, 5, 5);
      p.moveForward(); // blocked
      const state = p.getState();
      expect(state.visitedCoordinates).toEqual([{ x: 0, y: 0 }]);
    });
  });

  describe('Summary Generation', () => {
    test('generates correct summary', () => {
      probe.moveForward();
      probe.moveForward();
      const edgeProbe2 = new Probe(2, 4, Direction.North, 5, 5);
      edgeProbe2.moveForward(); // blocked
      const summary = edgeProbe2.getSummary();
      expect(summary.invalidMoveCount).toBe(1);
      expect(summary.totalSteps).toBe(1);
      expect(summary.finalPosition).toEqual({ x: 2, y: 4 });
      expect(summary.finalDirection).toBe(Direction.North);
    });

    test('batch execution updates status', () => {
      probe.executeBatch(['F', 'F', 'R', 'F']);
      const state = probe.getState();
      expect(state.status).toBe('completed');
      expect(state.totalSteps).toBe(4);
    });
  });

  describe('Invalid Commands', () => {
    test('rejects unknown commands', () => {
      const r = probe.executeCommand('X');
      expect(r.success).toBe(false);
      expect(r.message).toContain('Invalid command');
    });

    test('counts invalid commands', () => {
      probe.executeCommand('X');
      probe.executeCommand('Z');
      const state = probe.getState();
      expect(state.invalidMoveCount).toBe(2);
    });
  });

  describe('State Reset', () => {
    test('new probe starts fresh', () => {
      probe.moveForward();
      probe.turnRight();
      const freshProbe = new Probe(0, 0, Direction.North, 5, 5);
      const state = freshProbe.getState();
      expect(state.position).toEqual({ x: 0, y: 0 });
      expect(state.direction).toBe(Direction.North);
      expect(state.visitedCoordinates).toEqual([{ x: 0, y: 0 }]);
      expect(state.commandHistory).toEqual([]);
      expect(state.invalidMoveCount).toBe(0);
      expect(state.totalSteps).toBe(0);
    });
  });
});

describe('Grid Validation', () => {
  test('valid setup passes', () => {
    const r = validateGridSetup(5, 5, 0, 0, 'N', []);
    expect(r.valid).toBe(true);
    expect(r.errors).toEqual([]);
  });

  test('rejects invalid dimensions', () => {
    const r = validateGridSetup(0, -1, 0, 0, 'N', []);
    expect(r.valid).toBe(false);
    expect(r.errors.length).toBeGreaterThan(0);
  });

  test('rejects out-of-bounds start', () => {
    const r = validateGridSetup(5, 5, 10, 10, 'N', []);
    expect(r.valid).toBe(false);
  });

  test('rejects start on obstacle', () => {
    const r = validateGridSetup(5, 5, 2, 2, 'N', [{ x: 2, y: 2 }]);
    expect(r.valid).toBe(false);
    expect(r.errors.some((e) => e.includes('conflicts'))).toBe(true);
  });

  test('rejects invalid direction', () => {
    const r = validateGridSetup(5, 5, 0, 0, 'X', []);
    expect(r.valid).toBe(false);
  });

  test('rejects obstacle outside grid', () => {
    const r = validateGridSetup(5, 5, 0, 0, 'N', [{ x: 10, y: 10 }]);
    expect(r.valid).toBe(false);
  });

  test('rejects duplicate obstacles', () => {
    const r = validateGridSetup(5, 5, 0, 0, 'N', [
      { x: 1, y: 1 },
      { x: 1, y: 1 },
    ]);
    expect(r.valid).toBe(false);
    expect(r.errors.some((e) => e.includes('Duplicate'))).toBe(true);
  });
});

describe('Command Validation', () => {
  test('valid commands pass', () => {
    const r = validateCommands(['F', 'B', 'L', 'R']);
    expect(r.valid).toBe(true);
  });

  test('rejects non-array', () => {
    const r = validateCommands('F');
    expect(r.valid).toBe(false);
  });

  test('rejects empty array', () => {
    const r = validateCommands([]);
    expect(r.valid).toBe(false);
  });

  test('rejects invalid commands', () => {
    const r = validateCommands(['F', 'X', 'L']);
    expect(r.valid).toBe(false);
    expect(r.errors.some((e) => e.includes('Invalid command'))).toBe(true);
  });
});
