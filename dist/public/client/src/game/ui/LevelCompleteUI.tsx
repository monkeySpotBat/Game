import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useLobby } from '../stores/useLobby';
import { useLevel } from '../stores/useLevel';
import { usePlayer } from '../stores/usePlayer';
import { Button } from '@/components/ui/button';
import { peerConnection } from '../utils/PeerConnection';

const LevelCompleteUI = () => {
  // Get states from stores
  const { isHost, nextLevel } = useLobby();
  const { completedSections, resetLevel } = useLevel();
  const { score, addScore, resetPosition } = usePlayer();
  
  // Countdown for automatic next level
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
      handleNextLevel();
    }
    
    return () => clearInterval(timer);
  }, [countdown]);
  
  // Add score when level is completed
  useEffect(() => {
    // Add 100 points for completing a level
    addScore(100);
  }, []);
  
  // Handle next level button click
  const handleNextLevel = () => {
    // Reset player position
    resetPosition();
    
    // If we're the host, tell everyone to start next level
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
      
      // Start next level
      nextLevel();
    }
  };
  
  return createPortal(
    <div className="w-full h-full flex items-center justify-center pointer-events-none">
      <div className="bg-black/80 p-6 rounded-lg text-white max-w-md pointer-events-auto">
        <h2 className="text-2xl font-bold text-green-500 mb-4">Level Complete!</h2>
        <p className="mb-4">
          Congratulations! You've completed level {completedSections + 1}.
        </p>
        
        <div className="mb-4 bg-gray-800 p-3 rounded">
          <p className="text-center">
            <span className="text-xl text-yellow-400">+100 points</span>
          </p>
          <p className="text-center text-lg">
            Total Score: {score}
          </p>
        </div>
        
        <div className="mb-4 text-center">
          <span className="text-xl">Next level in {countdown} seconds...</span>
        </div>
        
        {isHost && (
          <Button
            className="w-full bg-green-600 hover:bg-green-700"
            onClick={handleNextLevel}
          >
            Continue Now
          </Button>
        )}
        
        {!isHost && (
          <p className="text-center text-sm italic">
            Waiting for host to start the next level...
          </p>
        )}
      </div>
    </div>,
    container
  );
};

export default LevelCompleteUI;
