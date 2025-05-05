import { useEffect, useState } from 'react';
import { useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import Character from '../components/Character';
import Level from '../components/Level';
import GameUI from '../ui/GameUI';
import DeathScreen from '../ui/DeathScreen';
import LevelCompleteUI from '../ui/LevelCompleteUI';
import { useLobby } from '../stores/useLobby';
import { usePlayer } from '../stores/usePlayer';
import { useAudio } from '@/lib/stores/useAudio';

const Game = () => {
  // Get store states
  const { gameState } = useLobby();
  const { otherPlayers } = usePlayer();
  const { backgroundMusic, isMuted, toggleMute } = useAudio();
  
  // Camera setup
  const { camera } = useThree();
  const [cameraTarget] = useState([0, 2, 0]);
  
  // Play background music when game starts
  useEffect(() => {
    if (backgroundMusic && gameState === 'playing' && !isMuted) {
      backgroundMusic.currentTime = 0;
      backgroundMusic.play().catch(err => {
        console.log('Audio playback prevented:', err);
      });
    }
    
    return () => {
      if (backgroundMusic) {
        backgroundMusic.pause();
      }
    };
  }, [gameState, backgroundMusic, isMuted]);
  
  // Update camera target to follow the player
  useEffect(() => {
    const handlePlayerUpdate = () => {
      const playerStore = usePlayer.getState();
      const playerPos = playerStore.position;
      camera.lookAt(playerPos[0], playerPos[1] + 1, playerPos[2]);
    };
    
    const unsubscribe = usePlayer.subscribe(
      state => state.position,
      handlePlayerUpdate
    );
    
    return unsubscribe;
  }, [camera]);
  
  return (
    <>
      {/* Main camera */}
      <PerspectiveCamera makeDefault position={[0, 5, 10]} />
      
      {/* Camera controls (limited) */}
      <OrbitControls
        target={cameraTarget}
        maxPolarAngle={Math.PI / 2 - 0.1}
        minPolarAngle={Math.PI / 6}
        maxDistance={20}
        minDistance={4}
        enablePan={false}
      />
      
      {/* Game world */}
      <Level />
      
      {/* Local player character */}
      <Character isLocal />
      
      {/* Other players */}
      {Array.from(otherPlayers.entries()).map(([id, playerState]) => (
        <Character key={id} playerState={playerState} />
      ))}
      
      {/* UI Overlays - rendered outside Canvas */}
      <GameUI />
      
      {/* Death screen */}
      {gameState === 'dead' && <DeathScreen />}
      
      {/* Level complete screen */}
      {gameState === 'complete' && <LevelCompleteUI />}
    </>
  );
};

export default Game;
