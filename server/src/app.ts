import express from 'express';
import cors from 'cors';
import gridRoutes from './routes/gridRoutes';
import probeRoutes from './routes/probeRoutes';

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/grid', gridRoutes);
app.use('/api/probe', probeRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'Ocean Explorer API' });
});

export default app;
