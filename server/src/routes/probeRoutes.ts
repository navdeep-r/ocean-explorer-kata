import { Router, Request, Response } from 'express';
import { getProbe, resetState } from './gridRoutes';
import { validateCommands } from '../engine/grid';

const router = Router();

// POST /api/probe/commands — batch execute
router.post('/commands', (req: Request, res: Response) => {
  const probe = getProbe();
  if (!probe) {
    return res.status(400).json({
      success: false,
      errors: ['Grid not initialized. Call POST /api/grid/setup first.'],
    });
  }

  const validation = validateCommands(req.body.commands);
  if (!validation.valid) {
    return res.status(400).json({
      success: false,
      errors: validation.errors,
    });
  }

  const results = probe.executeBatch(req.body.commands);
  return res.json({
    success: true,
    results,
    state: probe.getState(),
  });
});

// POST /api/probe/step — execute single command
router.post('/step', (req: Request, res: Response) => {
  const probe = getProbe();
  if (!probe) {
    return res.status(400).json({
      success: false,
      errors: ['Grid not initialized. Call POST /api/grid/setup first.'],
    });
  }

  const { command } = req.body;
  if (!command || typeof command !== 'string') {
    return res.status(400).json({
      success: false,
      errors: ['Command must be a non-empty string (F, B, L, or R)'],
    });
  }

  const result = probe.executeCommand(command);
  return res.json({
    success: true,
    result,
    state: probe.getState(),
  });
});

// GET /api/probe/state
router.get('/state', (_req: Request, res: Response) => {
  const probe = getProbe();
  if (!probe) {
    return res.status(400).json({
      success: false,
      errors: ['Grid not initialized. Call POST /api/grid/setup first.'],
    });
  }

  return res.json({
    success: true,
    state: probe.getState(),
  });
});

// GET /api/probe/summary
router.get('/summary', (_req: Request, res: Response) => {
  const probe = getProbe();
  if (!probe) {
    return res.status(400).json({
      success: false,
      errors: ['Grid not initialized. Call POST /api/grid/setup first.'],
    });
  }

  return res.json({
    success: true,
    summary: probe.getSummary(),
  });
});

// POST /api/probe/reset
router.post('/reset', (_req: Request, res: Response) => {
  resetState();
  return res.json({
    success: true,
    message: 'Probe and grid state have been reset',
  });
});

export default router;
