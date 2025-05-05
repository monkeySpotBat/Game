// Development loader to resolve Vercel vs local development issues
console.log("Development mode active - redirecting to Vite dev server");

// This is a fallback for when the static file is shown instead of the app
function checkAndReloadIfNeeded() {
  // If we see the code instead of the app UI
  if (document.body.innerText.includes('import express') || 
      document.body.innerText.includes('server/index.ts')) {
    console.log("Detected server code instead of UI, attempting to reload...");
    window.location.reload();
  }
}

// Add a small delay to ensure DOM is loaded
setTimeout(checkAndReloadIfNeeded, 500);