import type { Express } from "express";
import path from "path";
import fs from "fs";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { log } from "./vite";

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
  
  // Special redirect for development testing
  app.get('/api/redirect', (req, res) => {
    // In development, when the server code is shown instead of the app
    log('Redirecting development request from /api/redirect', 'express');
    res.redirect('/');
  });
  
  // Fallback route that helps with development mode
  app.get('/server/index.ts', (req, res) => {
    log('Serving redirect page instead of server code', 'express');
    const clientPublicPath = path.resolve(__dirname, "..", "client", "public", "redirect-vite.html");
    
    // Check if the redirect file exists
    if (fs.existsSync(clientPublicPath)) {
      res.sendFile(clientPublicPath);
    } else {
      res.redirect('/');
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
