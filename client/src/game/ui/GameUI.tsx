import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { usePlayer } from '../stores/usePlayer';
import { useLobby } from '../stores/useLobby';
import { useAudio } from '@/lib/stores/useAudio';
import { Button } from '@/components/ui/button';
import { Volume2, VolumeX } from 'lucide-react';

const GameUI = () => {
  const { score, username } = usePlayer();
  const { lobbyId, lobbyInfo } = useLobby();
  const { isMuted, toggleMute } = useAudio();
  
  // For showing player list toggle
  const [showPlayers, setShowPlayers] = useState(false);
  
  // Create portal to render outside of Canvas
  const [container] = useState(() => {
    const div = document.createElement('div');
    div.style.position = 'absolute';
    div.style.top = '0';
    div.style.left = '0';
    div.style.width = '100%';
    div.style.height = '100%';
    div.style.pointerEvents = 'none';
    div.style.zIndex = '100';
    return div;
  });
  
  // Add container to body
  useEffect(() => {
    document.body.appendChild(container);
    return () => {
      document.body.removeChild(container);
    };
  }, [container]);
  
  return createPortal(
    <div className="w-full h-full flex flex-col justify-between pointer-events-none p-4">
      {/* Top HUD - Score, Lobby ID */}
      <div className="flex justify-between items-start">
        <div className="bg-black/70 p-3 rounded-lg text-white">
          <div className="text-lg font-bold">Score: {score}</div>
          <div className="text-sm">Username: {username}</div>
          <div className="text-sm">Lobby: {lobbyId}</div>
        </div>
        
        <div className="flex flex-col gap-2">
          {/* Sound toggle button */}
          <Button 
            variant="outline" 
            size="icon" 
            className="bg-black/70 text-white hover:bg-black/60 pointer-events-auto"
            onClick={toggleMute}
          >
            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </Button>
          
          {/* Player list toggle button */}
          <Button 
            variant="outline" 
            size="sm" 
            className="bg-black/70 text-white hover:bg-black/60 pointer-events-auto"
            onClick={() => setShowPlayers(!showPlayers)}
          >
            Players {showPlayers ? '▼' : '►'}
          </Button>
        </div>
      </div>
      
      {/* Player list */}
      {showPlayers && lobbyInfo && (
        <div className="absolute top-20 right-4 bg-black/80 p-4 rounded-lg text-white min-w-56 pointer-events-auto">
          <h3 className="text-lg font-bold mb-2">Players</h3>
          <ul className="space-y-2">
            {lobbyInfo.players.map(player => (
              <li key={player.id} className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: player.color }}
                />
                <span>
                  {player.username} {lobbyInfo.host === player.id ? ' (Host)' : ''}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Controls help */}
      <div className="self-start bg-black/70 p-3 rounded-lg text-white max-w-xs">
        <h3 className="text-sm font-bold">Controls</h3>
        <ul className="text-xs space-y-1">
          <li>Move: WASD or Arrow Keys</li>
          <li>Jump: Space</li>
          <li>Camera: Mouse</li>
        </ul>
      </div>
    </div>,
    container
  );
};

export default GameUI;
