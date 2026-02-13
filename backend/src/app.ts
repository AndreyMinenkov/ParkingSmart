import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { Pool } from 'pg';

import authRoutes from './routes/authRoutes';
import parkingRoutes from './routes/parkingRoutes';
import blockerRoutes from './routes/blockerRoutes';
import callRoutes from './routes/callRoutes';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Database connection
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/parkings', parkingRoutes);
app.use('/api/blockers', blockerRoutes);
app.use('/api/calls', callRoutes);

app.listen(port, () => {
  console.log(`⚡️ Server is running on port ${port}`);
});
