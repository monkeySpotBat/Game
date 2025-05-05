import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

interface FinishProps {
  position: [number, number, number];
}

const Finish = ({ position }: FinishProps) => {
  // Refs
  const flagRef = useRef<THREE.Group>(null);
  const particlesRef = useRef<THREE.Points>(null);
  const particlePositions = useRef<Float32Array>();
  const particleSpeeds = useRef<Float32Array>();
  
  // Create particles for finish line effect
  useFrame((_, delta) => {
    // Animate flag
    if (flagRef.current) {
      flagRef.current.rotation.y += delta * 1.5;
    }
    
    // Animate particles
    if (particlesRef.current && particlePositions.current && particleSpeeds.current) {
      const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
      
      for (let i = 0; i < positions.length; i += 3) {
        // Move particle up
        positions[i + 1] += particleSpeeds.current[i / 3] * delta;
        
        // Reset particle if it goes too high
        if (positions[i + 1] > 5) {
          positions[i] = position[0] + (Math.random() - 0.5) * 3;
          positions[i + 1] = position[1];
          positions[i + 2] = position[2] + (Math.random() - 0.5) * 3;
        }
      }
      
      particlesRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });
  
  // Create finish flag particles
  const particleCount = 50;
  if (!particlePositions.current) {
    particlePositions.current = new Float32Array(particleCount * 3);
    particleSpeeds.current = new Float32Array(particleCount);
    
    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePositions.current[i] = position[0] + (Math.random() - 0.5) * 3;
      particlePositions.current[i + 1] = position[1] + Math.random() * 2;
      particlePositions.current[i + 2] = position[2] + (Math.random() - 0.5) * 3;
      
      if (particleSpeeds.current) {
        particleSpeeds.current[i / 3] = 0.5 + Math.random() * 1.5;
      }
    }
  }
  
  // Particle material with a simple custom shader
  const particleMaterial = new THREE.PointsMaterial({
    color: 0xFFFFFF,
    size: 0.4,
    transparent: true,
    opacity: 0.8
  });
  
  return (
    <group position={position}>
      {/* Finish platform */}
      <mesh position={[0, -0.25, 0]} receiveShadow>
        <boxGeometry args={[5, 0.5, 5]} />
        <meshStandardMaterial color="#E74C3C" metalness={0.4} roughness={0.6} />
      </mesh>
      
      {/* Flag pole */}
      <mesh position={[0, 2, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.1, 4, 8]} />
        <meshStandardMaterial color="#7F8C8D" metalness={0.7} roughness={0.3} />
      </mesh>
      
      {/* Flag */}
      <group ref={flagRef} position={[0, 3, 0]}>
        <mesh position={[0.75, 0, 0]} castShadow>
          <boxGeometry args={[1.5, 1, 0.05]} />
          <meshStandardMaterial color="#F1C40F" side={THREE.DoubleSide} />
        </mesh>
      </group>
      
      {/* Finish text */}
      <Text
        position={[0, 5, 0]}
        fontSize={1}
        color="white"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.1}
        outlineColor="#000000"
      >
        FINISH
      </Text>
      
      {/* Particles */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute 
            attach="attributes-position" 
            count={particleCount} 
            array={particlePositions.current} 
            itemSize={3} 
          />
        </bufferGeometry>
        <pointsMaterial 
          attach="material" 
          color="#FFFF00" 
          size={0.3} 
          transparent 
          opacity={0.8} 
        />
      </points>
    </group>
  );
};

export default Finish;
