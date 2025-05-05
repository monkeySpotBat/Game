import express, { type Request, Response } from "express";
import cors from "cors";
import { storage } from "../server/storage";

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// API endpoints
app.get('/api/status', (req, res) => {
  res.json({ status: 'ok', message: 'Infinite Platformer server running' });
});

// API endpoint for high scores (future implementation)
app.get('/api/scores', async (req, res) => {
  res.json({ 
    message: 'High scores will be implemented in a future update',
    scores: []
  });
});

// Error handler
app.use((err: any, _req: Request, res: Response, _next: any) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(status).json({ message });
});

// For Vercel serverless functions
export default app;