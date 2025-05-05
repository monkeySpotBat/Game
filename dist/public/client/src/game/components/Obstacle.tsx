import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useLobby } from '../stores/useLobby';

interface ObstacleProps {
  position: [number, number, number];
  size: [number, number, number];
  type: 'spike' | 'rotatingBeam' | 'fallingRock';
  rotationSpeed?: number;
  fallingSpeed?: number;
}

const Obstacle = ({
  position,
  size,
  type,
  rotationSpeed = 1,
  fallingSpeed = 0.5
}: ObstacleProps) => {
  // Refs
  const ref = useRef<THREE.Mesh | THREE.Group>(null);
  const timeRef = useRef(Math.random() * 10); // Random start time
  const originalPositionRef = useRef<[number, number, number]>([...position]);
  
  // Get game state
  const { gameState } = useLobby();
  
  // Obstacle animation logic
  useFrame((_, delta) => {
    if (!ref.current || gameState !== 'playing') return;
    
    timeRef.current += delta;
    
    switch (type) {
      case 'rotatingBeam':
        // Rotate the beam
        ref.current.rotation.y += rotationSpeed * delta;
        break;
        
      case 'fallingRock':
        // Calculate cycle time based on position
        const cycleTime = 3; // seconds for a full cycle
        const normalizedTime = (timeRef.current % cycleTime) / cycleTime;
        
        if (normalizedTime < 0.5) {
          // Reset to starting position during first half of cycle
          ref.current.position.y = originalPositionRef.current[1];
        } else {
          // Fall during second half of cycle
          ref.current.position.y -= fallingSpeed * 9.8 * delta; // Apply gravity-like fall
          
          // Reset if fallen too far
          if (ref.current.position.y < -10) {
            ref.current.position.y = originalPositionRef.current[1];
          }
        }
        break;
        
      default:
        // No animation for other types
        break;
    }
  });
  
  // Render different obstacles based on type
  if (type === 'spike') {
    return (
      <mesh ref={ref as React.RefObject<THREE.Mesh>} position={position} castShadow>
        <coneGeometry args={[size[0] / 2, size[1], 4]} />
        <meshStandardMaterial color="#FF5555" metalness={0.8} roughness={0.2} />
      </mesh>
    );
  }
  
  if (type === 'rotatingBeam') {
    return (
      <group ref={ref as React.RefObject<THREE.Group>} position={position}>
        <mesh castShadow rotation={[0, 0, 0]}>
          <boxGeometry args={size} />
          <meshStandardMaterial color="#B03A2E" metalness={0.5} roughness={0.5} />
        </mesh>
      </group>
    );
  }
  
  if (type === 'fallingRock') {
    return (
      <mesh ref={ref as React.RefObject<THREE.Mesh>} position={position} castShadow>
        <boxGeometry args={size} />
        <meshStandardMaterial color="#808B96" metalness={0.3} roughness={0.7} />
      </mesh>
    );
  }
  
  // Default obstacle (shouldn't reach here)
  return (
    <mesh ref={ref as React.RefObject<THREE.Mesh>} position={position} castShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial color="#FF0000" />
    </mesh>
  );
};

export default Obstacle;
