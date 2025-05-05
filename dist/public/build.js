import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// Kompiliere den Server-Code für Vercel-Deployment
console.log('Erstelle Server-Build für Vercel...');
execSync('esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist', { 
  stdio: 'inherit' 
});

// Stelle sicher, dass das Verzeichnis für API-Funktionen existiert
const apiDir = path.resolve('./api');
if (!fs.existsSync(apiDir)) {
  console.log('API-Verzeichnis nicht gefunden, erstelle es...');
  fs.mkdirSync(apiDir, { recursive: true });
}

// Kopiere statische Assets in das dist-Verzeichnis, falls nötig
const publicDir = path.resolve('./client/public');
const distPublicDir = path.resolve('./dist/public');

if (fs.existsSync(publicDir)) {
  console.log('Kopiere statische Assets...');
  
  if (!fs.existsSync(distPublicDir)) {
    fs.mkdirSync(distPublicDir, { recursive: true });
  }
  
  // Kopiere Dateien rekursiv
  function copyRecursiveSync(src, dest) {
    const exists = fs.existsSync(src);
    const stats = exists && fs.statSync(src);
    const isDirectory = exists && stats.isDirectory();
    
    if (isDirectory) {
      if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
      }
      fs.readdirSync(src).forEach(function(childItemName) {
        copyRecursiveSync(
          path.join(src, childItemName),
          path.join(dest, childItemName)
        );
      });
    } else {
      fs.copyFileSync(src, dest);
    }
  }
  
  copyRecursiveSync(publicDir, distPublicDir);
}

console.log('Build abgeschlossen. Bereit für Vercel-Deployment!');