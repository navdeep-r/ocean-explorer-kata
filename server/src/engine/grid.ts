import { Direction, Coordinate } from './probe';

export interface GridConfig {
  width: number;
  height: number;
  obstacles: Coordinate[];
}

export interface SetupValidation {
  valid: boolean;
  errors: string[];
}

export function validateGridSetup(
  width: number,
  height: number,
  startX: number,
  startY: number,
  direction: string,
  obstacles: Coordinate[]
): SetupValidation {
  const errors: string[] = [];

  if (!Number.isInteger(width) || width < 1 || width > 50) {
    errors.push('Grid width must be an integer between 1 and 50');
  }
  if (!Number.isInteger(height) || height < 1 || height > 50) {
    errors.push('Grid height must be an integer between 1 and 50');
  }

  const validDirections = ['N', 'E', 'S', 'W'];
  if (!validDirections.includes(direction?.toUpperCase())) {
    errors.push('Direction must be one of: N, E, S, W');
  }

  if (width >= 1 && height >= 1) {
    if (!Number.isInteger(startX) || startX < 0 || startX >= width) {
      errors.push(`Start X must be an integer between 0 and ${width - 1}`);
    }
    if (!Number.isInteger(startY) || startY < 0 || startY >= height) {
      errors.push(`Start Y must be an integer between 0 and ${height - 1}`);
    }

    const obstacleSet = new Set<string>();
    for (const obs of obstacles) {
      if (!Number.isInteger(obs.x) || !Number.isInteger(obs.y)) {
        errors.push(`Obstacle coordinates must be integers: (${obs.x}, ${obs.y})`);
        continue;
      }
      if (obs.x < 0 || obs.x >= width || obs.y < 0 || obs.y >= height) {
        errors.push(`Obstacle (${obs.x}, ${obs.y}) is outside the grid`);
        continue;
      }
      const key = `${obs.x},${obs.y}`;
      if (obstacleSet.has(key)) {
        errors.push(`Duplicate obstacle at (${obs.x}, ${obs.y})`);
      }
      obstacleSet.add(key);
    }

    if (
      Number.isInteger(startX) && Number.isInteger(startY) &&
      startX >= 0 && startX < width && startY >= 0 && startY < height
    ) {
      const startKey = `${startX},${startY}`;
      if (obstacleSet.has(startKey)) {
        errors.push(`Start position (${startX}, ${startY}) conflicts with an obstacle`);
      }
    }
  }

  return { valid: errors.length === 0, errors };
}

export function validateCommands(commands: unknown): SetupValidation {
  const errors: string[] = [];

  if (!Array.isArray(commands)) {
    errors.push('Commands must be an array of strings');
    return { valid: false, errors };
  }

  if (commands.length === 0) {
    errors.push('Commands array must not be empty');
    return { valid: false, errors };
  }

  const validCmds = ['F', 'B', 'L', 'R'];
  commands.forEach((cmd, i) => {
    if (typeof cmd !== 'string') {
      errors.push(`Command at index ${i} must be a string`);
    } else if (!validCmds.includes(cmd.toUpperCase().trim())) {
      errors.push(`Invalid command "${cmd}" at index ${i}. Use F, B, L, or R`);
    }
  });

  return { valid: errors.length === 0, errors };
}
