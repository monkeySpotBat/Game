import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useKeyboardControls } from '@react-three/drei';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { useLobby } from '../stores/useLobby';
import { usePlayer } from '../stores/usePlayer';
import { useLevel } from '../stores/useLevel';
import { updatePlayerPhysics, checkObstacleCollision, checkFinish } from '../utils/Physics';
import { Controls, PlayerState } from '@/types';
import { peerConnection } from '../utils/PeerConnection';
import { useAudio } from '@/lib/stores/useAudio';

interface CharacterProps {
  isLocal?: boolean;
  playerState?: PlayerState;
}

const Character = ({ isLocal = false, playerState }: CharacterProps) => {
  // Local state
  const ref = useRef<THREE.Mesh>(null);
  const lastUpdateRef = useRef<number>(0);
  const timeAccumulatorRef = useRef<number>(0);
  
  // Store states
  const { gameState, playerDied, levelComplete } = useLobby();
  const player = usePlayer();
  const { getAllPlatforms, getAllObstacles, getFinishPosition } = useLevel();
  const { playHit, playSuccess } = useAudio();
  
  // Controls for local player
  const [subscribeKeys, getKeys] = useKeyboardControls<Controls>();
  
  // Sync mesh position with player state
  useEffect(() => {
    if (!isLocal && playerState && ref.current) {
      ref.current.position.set(
        playerState.position[0],
        playerState.position[1],
        playerState.position[2]
      );
    }
  }, [isLocal, playerState]);
  
  // Game loop for the local player
  useFrame((state, delta) => {
    if (!isLocal || gameState !== 'playing' || !ref.current) return;
    
    // Fixed timestep for physics (60 fps)
    const fixedDelta = 1 / 60;
    timeAccumulatorRef.current += delta;
    
    // Process physics in fixed steps
    while (timeAccumulatorRef.current >= fixedDelta) {
      // Get current keyboard state
      const { forward, backward, leftward, rightward, jump } = getKeys();
      
      // Get current platforms and obstacles
      const platforms = getAllPlatforms();
      const obstacles = getAllObstacles();
      const finishPosition = getFinishPosition();
      
      // Update physics
      const updatedPlayer = updatePlayerPhysics(
        player.getPlayerState(),
        fixedDelta,
        platforms,
        { forward, backward, leftward, rightward, jump }
      );
      
      // Check for obstacle collisions
      const hitObstacle = obstacles.some(obstacle => 
        checkObstacleCollision(updatedPlayer, obstacle)
      );
      
      if (hitObstacle) {
        // Player hit an obstacle
        console.log('Player hit an obstacle!');
        playHit();
        
        // Broadcast death message to all peers
        peerConnection.broadcastMessage({
          type: 'player-death',
          data: { username: player.username },
          sender: peerConnection.getMyId(),
          timestamp: Date.now()
        });
        
        // Update game state
        playerDied();
        
        // No need to continue physics updates
        timeAccumulatorRef.current = 0;
        return;
      }
      
      // Check if player fell off the level
      if (updatedPlayer.position[1] < -10) {
        console.log('Player fell off the level!');
        playHit();
        
        // Broadcast death message to all peers
        peerConnection.broadcastMessage({
          type: 'player-death',
          data: { username: player.username },
          sender: peerConnection.getMyId(),
          timestamp: Date.now()
        });
        
        // Update game state
        playerDied();
        
        // No need to continue physics updates
        timeAccumulatorRef.current = 0;
        return;
      }
      
      // Check if player reached finish
      if (finishPosition && checkFinish(updatedPlayer, finishPosition)) {
        console.log('Player reached finish!');
        playSuccess();
        
        // Broadcast level complete message to all peers
        peerConnection.broadcastMessage({
          type: 'level-complete',
          data: { username: player.username },
          sender: peerConnection.getMyId(),
          timestamp: Date.now()
        });
        
        // Update game state
        levelComplete();
        
        // No need to continue physics updates
        timeAccumulatorRef.current = 0;
        return;
      }
      
      // Update player state
      player.updatePosition(updatedPlayer.position);
      player.updateVelocity(updatedPlayer.velocity);
      player.setJumping(updatedPlayer.isJumping);
      player.setGrounded(updatedPlayer.isGrounded);
      
      // Update mesh position
      ref.current.position.set(
        updatedPlayer.position[0],
        updatedPlayer.position[1],
        updatedPlayer.position[2]
      );
      
      // Decrement accumulator
      timeAccumulatorRef.current -= fixedDelta;
    }
    
    // Send position updates to peers (but not too often)
    const now = Date.now();
    if (now - lastUpdateRef.current > 50) { // Send updates 20 times per second
      peerConnection.sendPlayerUpdate();
      lastUpdateRef.current = now;
    }
  });
  
  // Get character color and name
  const color = isLocal ? player.color : (playerState?.color || '#FFFFFF');
  const username = isLocal ? player.username : (playerState?.username || 'Player');
  
  return (
    <group>
      {/* Character mesh */}
      <mesh
        ref={ref}
        position={isLocal ? player.position : (playerState?.position || [0, 0, 0])}
      >
        {/* Character body */}
        <boxGeometry args={[1, 2, 1]} />
        <meshStandardMaterial color={color} />
        
        {/* Player username floating above */}
        <Text
          position={[0, 2.2, 0]}
          fontSize={0.5}
          color="white"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.05}
          outlineColor="#000000"
        >
          {username}
        </Text>
      </mesh>
    </group>
  );
};

export default Character;
