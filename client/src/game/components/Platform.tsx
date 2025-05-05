import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { useLobby } from '../stores/useLobby';

interface PlatformProps {
  position: [number, number, number];
  size: [number, number, number];
  type: 'normal' | 'moving' | 'disappearing';
  movingDirection?: [number, number, number];
  movingSpeed?: number;
  movingDistance?: number;
  initialPosition?: [number, number, number];
}

const Platform = ({
  position,
  size,
  type,
  movingDirection = [0, 1, 0],
  movingSpeed = 1,
  movingDistance = 2,
  initialPosition
}: PlatformProps) => {
  // Refs
  const ref = useRef<THREE.Mesh>(null);
  const timeRef = useRef(Math.random() * 10); // Random start time for variation
  const opacityRef = useRef(1);
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);
  
  // Get game state
  const { gameState } = useLobby();
  
  // Load texture
  const texture = useTexture("/textures/wood.jpg");
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 2);
  
  // Platform animation logic
  useFrame((_, delta) => {
    if (!ref.current || gameState !== 'playing') return;
    
    timeRef.current += delta;
    
    if (type === 'moving' && initialPosition) {
      // Calculate movement using sin for back-and-forth motion
      const offset = Math.sin(timeRef.current * movingSpeed) * movingDistance;
      
      // Apply offset in the specified direction
      ref.current.position.set(
        initialPosition[0] + movingDirection[0] * offset,
        initialPosition[1] + movingDirection[1] * offset,
        initialPosition[2] + movingDirection[2] * offset
      );
    }
    
    if (type === 'disappearing') {
      // Fade in and out based on time
      const cycleTime = 4; // seconds for a full cycle
      const normalizedTime = (timeRef.current % cycleTime) / cycleTime;
      
      // Disappear for part of the cycle
      const opacity = normalizedTime < 0.7 ? 1 : 1 - (normalizedTime - 0.7) / 0.3;
      opacityRef.current = opacity;
      
      if (materialRef.current) {
        materialRef.current.opacity = opacity;
        materialRef.current.transparent = opacity < 1;
        // Only enable collisions when visible enough
        ref.current.visible = opacity > 0.2;
      }
    }
  });
  
  // Determine color based on platform type
  let color;
  switch (type) {
    case 'moving':
      color = '#7FB3D5'; // Light blue
      break;
    case 'disappearing':
      color = '#F5B041'; // Orange
      break;
    default:
      color = '#82E0AA'; // Light green
  }
  
  return (
    <mesh 
      ref={ref}
      position={position}
      receiveShadow
      castShadow
    >
      <boxGeometry args={size} />
      <meshStandardMaterial 
        ref={materialRef}
        map={texture}
        color={color}
        transparent={type === 'disappearing'}
        metalness={0.2}
        roughness={0.8}
      />
    </mesh>
  );
};

export default Platform;
