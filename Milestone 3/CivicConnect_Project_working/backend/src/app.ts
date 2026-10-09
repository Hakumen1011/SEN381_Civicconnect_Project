import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import type { Env } from './config/env.js';


export function createApp(env: Env) {
  const app = express();

  app.use(helmet());                            
  app.use(cors({ origin: env.CORS_ORIGINS }));  
  app.use(express.json({ limit: '100kb' }));    

  // Our first route: GET /api/health
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  return { app };
}