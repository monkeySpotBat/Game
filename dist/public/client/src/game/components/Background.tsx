import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';

const Background = () => {
  // Refs
  const cloudsRef = useRef<THREE.Group>(null);
  
  // Load textures
  const skyTexture = useTexture('/textures/sky.png');
  const grassTexture = useTexture('/textures/grass.png');
  
  // Repeat grass texture
  grassTexture.wrapS = grassTexture.wrapT = THREE.RepeatWrapping;
  grassTexture.repeat.set(100, 100);
  
  // Animate clouds
  useFrame((_, delta) => {
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y += delta * 0.02;
    }
  });
  
  return (
    <>
      {/* Sky dome */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[500, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshBasicMaterial map={skyTexture} side={THREE.BackSide} fog={false} />
      </mesh>
      
      {/* Distant mountains */}
      <group position={[0, -10, 0]}>
        {[-150, -75, 0, 75, 150].map((x, i) => (
          <mesh key={i} position={[x, 0, -200]} castShadow>
            <coneGeometry args={[30 + Math.random() * 20, 40 + Math.random() * 30, 4]} />
            <meshStandardMaterial color="#6D7B8D" />
          </mesh>
        ))}
      </group>
      
      {/* Clouds */}
      <group ref={cloudsRef} position={[0, 50, 0]}>
        {Array.from({ length: 20 }).map((_, i) => {
          const x = (Math.random() - 0.5) * 300;
          const y = Math.random() * 30;
          const z = (Math.random() - 0.5) * 300;
          const scale = 5 + Math.random() * 15;
          
          return (
            <mesh key={i} position={[x, y, z]}>
              <sphereGeometry args={[scale, 8, 8]} />
              <meshStandardMaterial color="white" transparent opacity={0.8} />
            </mesh>
          );
        })}
      </group>
      
      {/* Ground plane far below */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -50, 0]} receiveShadow>
        <planeGeometry args={[1000, 1000]} />
        <meshStandardMaterial map={grassTexture} color="#8fbc8f" />
      </mesh>
      
      {/* Ambient and directional light */}
      <ambientLight intensity={0.5} />
      <directionalLight 
        position={[50, 100, 50]} 
        intensity={0.8} 
        castShadow 
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={500}
        shadow-camera-left={-100}
        shadow-camera-right={100}
        shadow-camera-top={100}
        shadow-camera-bottom={-100}
      />
    </>
  );
};

export default Background;
