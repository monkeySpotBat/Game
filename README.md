# Infinite Platformer Co-op Game

Ein kooperatives, unendliches Plattformspiel mit Lobby-Codes und prozedural generierten Levels.

## Über das Projekt

Dieses Spiel ist ein Browser-basiertes Plattformspiel, das mit React Three Fiber und PeerJS entwickelt wurde. Spieler können Lobbys erstellen, denen andere Spieler mit einem Lobby-Code beitreten können. Die Level werden prozedural generiert und bieten eine unendliche Spielerfahrung.

## Technologie-Stack

- React + Vite für das Frontend
- React Three Fiber für 3D-Rendering
- PeerJS für Peer-to-Peer-Multiplayer
- Zustand für Zustandsmanagement
- Vercel für Hosting

## Entwicklung

Um das Projekt lokal zu entwickeln:

```bash
# Abhängigkeiten installieren
npm install

# Entwicklungsserver starten
npm run dev
```

## Vercel-Deployment

Das Projekt ist für das Hosting auf Vercel optimiert. Um es auf Vercel zu deployen:

1. Forke oder klone dieses Repository auf GitHub
2. Verbinde dein Vercel-Konto mit GitHub
3. Importiere das Repository in Vercel
4. Setze die folgenden Umgebungsvariablen in Vercel:
   - `NODE_ENV`: `production`

Vercel erkennt automatisch das Projekt und verwendet die Konfigurationen aus `vercel.json`.

## API-Endpunkte

Die API-Endpunkte sind als serverless Funktionen implementiert:

- `GET /api/status` - Status des Servers prüfen
- `GET /api/scores` - Highscores abrufen (zukünftige Implementierung)

## Spielanleitung

1. Gib einen Benutzernamen ein
2. Erstelle eine Lobby oder trete mit einem Code bei
3. Vervollständige die Plattformen gemeinsam mit deinen Freunden
4. Wenn ein Spieler stirbt, starten alle Spieler neu
5. Steuerung: WASD oder Pfeiltasten zum Bewegen, Leertaste zum Springen