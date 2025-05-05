import { VercelRequest, VercelResponse } from '@vercel/node';

// Diese Route leitet zum Hauptspiel um, wenn sie aufgerufen wird
export default function handler(req: VercelRequest, res: VercelResponse) {
  // Sendet eine Umleitung zur Hauptseite
  // In der Produktionsumgebung wird dies durch vercel.json umgeleitet
  // In der Entwicklungsumgebung hilft dies bei der Anzeige des richtigen Inhalts
  res.status(200).send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Redirecting to Game</title>
      <script>
        window.location.href = "/";
      </script>
      <style>
        body {
          font-family: 'Inter', sans-serif;
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          margin: 0;
          background-color: #1a1a1a;
          color: #ffffff;
        }
        .container {
          text-align: center;
          max-width: 600px;
          padding: 20px;
        }
        h1 {
          color: #4f46e5;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Redirecting to Game</h1>
        <p>If you are not redirected automatically, please click <a href="/" style="color: #4f46e5;">here</a>.</p>
      </div>
    </body>
    </html>
  `);
}