import { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import Platform from './Platform';
import Obstacle from './Obstacle';
import Finish from './Finish';
import Background from './Background';
import { useLevel } from '../stores/useLevel';
import { useLobby } from '../stores/useLobby';

const Level = () => {
  // Get level data from store
  const { getAllPlatforms, getAllObstacles, getFinishPosition, updateTransition, sectionTransition } = useLevel();
  const { gameState } = useLobby();
  
  // Refs for level scrolling
  const scrollSpeedRef = useRef(0.5);
  
  // Set up initial level
  useEffect(() => {
    const levelStore = useLevel.getState();
    levelStore.generateInitialLevel();
  }, []);
  
  // Handle level scrolling
  useFrame((_, delta) => {
    if (gameState !== 'playing') return;
    
    // Gradually increase section transition to reveal more of the level
    const levelStore = useLevel.getState();
    if (levelStore.sectionTransition < 1) {
      updateTransition(Math.min(levelStore.sectionTransition + delta * scrollSpeedRef.current, 1));
    } else {
      // If transition is complete, advance to next section
      levelStore.advanceToNextSection();
    }
  });
  
  // Get platforms, obstacles, and finish position
  const platforms = getAllPlatforms();
  const obstacles = getAllObstacles();
  const finishPosition = getFinishPosition();
  
  return (
    <>
      {/* Background elements */}
      <Background />
      
      {/* Render all platforms */}
      {platforms.map((platform) => (
        <Platform 
          key={platform.id}
          position={platform.position}
          size={platform.size}
          type={platform.type}
          movingDirection={platform.movingDirection}
          movingSpeed={platform.movingSpeed}
          movingDistance={platform.movingDistance}
          initialPosition={platform.initialPosition}
        />
      ))}
      
      {/* Render all obstacles */}
      {obstacles.map((obstacle) => (
        <Obstacle
          key={obstacle.id}
          position={obstacle.position}
          size={obstacle.size}
          type={obstacle.type}
          rotationSpeed={obstacle.rotationSpeed}
          fallingSpeed={obstacle.fallingSpeed}
        />
      ))}
      
      {/* Render finish line if visible */}
      {finishPosition && (
        <Finish position={finishPosition} />
      )}
      
      {/* Ground plane to catch falling players */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -15, 0]} receiveShadow>
        <planeGeometry args={[1000, 1000]} />
        <meshStandardMaterial color="#2a1a1f" transparent opacity={0.5} />
      </mesh>
    </>
  );
};

export default Level;
