// Dieses Skript erkennt, wenn der Server-Code fälschlicherweise angezeigt wird
// und leitet den Benutzer zur korrekten Anwendung um

(function() {
  console.log("Checking for improper content display...");
  
  // Prüfe, ob der Servercode angezeigt wird
  function checkForServerCode() {
    const bodyContent = document.body ? document.body.innerText : '';
    const htmlContent = document.documentElement ? document.documentElement.outerHTML : '';
    
    // Prüfe auf verschiedene Anzeichen für Server-Code
    const isServerCodeVisible = 
      bodyContent.includes('import express') || 
      bodyContent.includes('server/index.ts') ||
      htmlContent.includes('server/index.ts') ||
      (document.title === '' && bodyContent.includes('app.use(')) ||
      (document.querySelector('pre') && !document.querySelector('#root'));
    
    if (isServerCodeVisible) {
      console.log("Server-Code erkannt, leite um...");
      
      // Versuche erst die spezielle Umleitungsroute
      window.location.href = '/api/redirect';
      
      // Falls das nicht funktioniert, erzwinge Neuladen nach einer kurzen Verzögerung
      setTimeout(() => {
        window.location.href = '/?t=' + Date.now();
      }, 500);
    } else {
      console.log("Content display OK");
    }
  }
  
  // Führe Prüfung aus, sobald die Seite geladen ist
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', checkForServerCode);
  } else {
    checkForServerCode();
  }
})();