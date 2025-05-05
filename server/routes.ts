import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  // API endpoint to check server status
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

  const httpServer = createServer(app);

  return httpServer;
}
