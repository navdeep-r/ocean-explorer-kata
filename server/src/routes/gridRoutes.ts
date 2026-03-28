import { Router, Request, Response } from 'express';
import { Probe, Direction } from '../engine/probe';
import { validateGridSetup } from '../engine/grid';

const router = Router();

// In-memory state
let probe: Probe | null = null;
let gridConfig: { width: number; height: number; obstacles: { x: number; y: number }[] } | null = null;

export function resetState() {
  probe = null;
  gridConfig = null;
}

export function getProbe(): Probe | null {
  return probe;
}

export function getGridConfig() {
  return gridConfig;
}

// POST /api/grid/setup
router.post('/setup', (req: Request, res: Response) => {
  const { width, height, startX, startY, direction, obstacles = [] } = req.body;

  const validation = validateGridSetup(width, height, startX, startY, direction, obstacles);
  if (!validation.valid) {
    return res.status(400).json({
      success: false,
      errors: validation.errors,
    });
  }

  const dir = direction.toUpperCase() as Direction;
  gridConfig = { width, height, obstacles };
  probe = new Probe(startX, startY, dir, width, height, obstacles);

  return res.json({
    success: true,
    message: 'Grid initialized successfully',
    state: probe.getState(),
    grid: { width, height, obstacles },
  });
});

export default router;
