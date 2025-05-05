import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// Step 1: Patch index.html for correct path
console.log('Patching index.html for Vercel build...');
const indexPath = path.resolve('./client/index.html');
if (fs.existsSync(indexPath)) {
  let indexContent = fs.readFileSync(indexPath, 'utf8');
  
  // Replace the problematic path
  indexContent = indexContent.replace(
    '<script type="module" src="src/main.tsx"></script>',
    '<script type="module" src="/src/main.tsx"></script>'
  );
  
  fs.writeFileSync(indexPath, indexContent);
  console.log('index.html patched for Vercel deployment');
}

// Step 2: Run Vite build with specific base path
console.log('Running Vite build with correct base path...');
try {
  execSync('vite build --base=./ --outDir=dist/public', { 
    stdio: 'inherit'
  });
} catch (error) {
  console.error('Vite build failed:', error);
  process.exit(1);
}

// Step 3: Build server code
console.log('Building server-side code...');
try {
  execSync('esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist', {
    stdio: 'inherit'
  });
} catch (error) {
  console.error('Server build failed:', error);
  process.exit(1);
}

// Step 4: Copy static assets
const publicDir = path.resolve('./client/public');
const distPublicDir = path.resolve('./dist/public');

if (fs.existsSync(publicDir)) {
  console.log('Copying static assets...');
  
  if (!fs.existsSync(distPublicDir)) {
    fs.mkdirSync(distPublicDir, { recursive: true });
  }
  
  // Copy files recursively
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

console.log('Vercel build process completed successfully!');
