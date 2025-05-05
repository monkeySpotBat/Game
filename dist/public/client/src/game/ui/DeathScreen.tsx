import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useLobby } from '../stores/useLobby';
import { useLevel } from '../stores/useLevel';
import { usePlayer } from '../stores/usePlayer';
import { Button } from '@/components/ui/button';
import { peerConnection } from '../utils/PeerConnection';

const DeathScreen = () => {
  // Get states from stores
  const { isHost, nextLevel } = useLobby();
  const resetLevel = useLevel(state => state.resetLevel);
  const resetPosition = usePlayer(state => state.resetPosition);
  
  // Countdown for automatic respawn
  const [countdown, setCountdown] = useState(5);
  
  // Create portal to render outside of Canvas
  const [container] = useState(() => {
    const div = document.createElement('div');
    div.style.position = 'absolute';
    div.style.top = '0';
    div.style.left = '0';
    div.style.width = '100%';
    div.style.height = '100%';
    div.style.pointerEvents = 'none';
    div.style.zIndex = '200';
    return div;
  });
  
  // Add container to body
  useEffect(() => {
    document.body.appendChild(container);
    return () => {
      document.body.removeChild(container);
    };
  }, [container]);
  
  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => prev - 1);
    }, 1000);
    
    if (countdown <= 0) {
      clearInterval(timer);
      handleRetry();
    }
    
    return () => clearInterval(timer);
  }, [countdown]);
  
  // Handle retry button click
  const handleRetry = () => {
    // Reset player position
    resetPosition();
    
    // If we're the host, tell everyone to restart
    if (isHost) {
      // Reset the level
      resetLevel();
      
      // Tell all peers to start a new level
      peerConnection.broadcastMessage({
        type: 'new-level',
        data: null,
        sender: peerConnection.getMyId(),
        timestamp: Date.now()
      });
      
      // Restart game
      nextLevel();
    }
  };
  
  return createPortal(
    <div className="w-full h-full flex items-center justify-center pointer-events-none">
      <div className="bg-black/80 p-6 rounded-lg text-white max-w-md pointer-events-auto">
        <h2 className="text-2xl font-bold text-red-500 mb-4">You Died!</h2>
        <p className="mb-4">
          Oh no! Someone fell off the platforms or hit an obstacle.
        </p>
        
        <div className="mb-4 text-center">
          <span className="text-xl">Restarting in {countdown} seconds...</span>
        </div>
        
        {isHost && (
          <Button
            className="w-full bg-red-600 hover:bg-red-700"
            onClick={handleRetry}
          >
            Restart Now
          </Button>
        )}
        
        {!isHost && (
          <p className="text-center text-sm italic">
            Waiting for host to restart the game...
          </p>
        )}
      </div>
    </div>,
    container
  );
};

export default DeathScreen;
