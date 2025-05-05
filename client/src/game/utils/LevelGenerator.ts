import { nanoid } from 'nanoid';
import { LevelSection, Platform, Obstacle } from '@/types';

// Random value generators
const randomBetween = (min: number, max: number): number => {
  return Math.random() * (max - min) + min;
};

const randomIntBetween = (min: number, max: number): number => {
  return Math.floor(randomBetween(min, max));
};

// Platform generators
const generateBasicPlatform = (x: number, y: number, z: number, width: number = 5, height: number = 0.5, depth: number = 5): Platform => {
  return {
    id: nanoid(),
    position: [x, y, z],
    size: [width, height, depth],
    type: 'normal'
  };
};

const generateMovingPlatform = (x: number, y: number, z: number, difficulty: number): Platform => {
  // Direction is either horizontal (x) or vertical (y)
  const isHorizontal = Math.random() > 0.5;
  const direction: [number, number, number] = isHorizontal
    ? [1, 0, 0] // x-axis
    : [0, 1, 0]; // y-axis
  
  // Calculate speed and distance based on difficulty
  const speed = randomBetween(0.5, 0.5 + difficulty * 0.1);
  const distance = randomBetween(2, 2 + difficulty);
  
  return {
    id: nanoid(),
    position: [x, y, z],
    size: [3, 0.5, 3],
    type: 'moving',
    movingDirection: direction,
    movingSpeed: speed,
    movingDistance: distance,
    initialPosition: [x, y, z]
  };
};

const generateDisappearingPlatform = (x: number, y: number, z: number): Platform => {
  return {
    id: nanoid(),
    position: [x, y, z],
    size: [3, 0.5, 3],
    type: 'disappearing'
  };
};

// Obstacle generators
const generateSpike = (x: number, y: number, z: number): Obstacle => {
  return {
    id: nanoid(),
    position: [x, y, z],
    size: [1, 1, 1],
    type: 'spike'
  };
};

const generateRotatingBeam = (x: number, y: number, z: number, difficulty: number): Obstacle => {
  const speed = randomBetween(0.5, 0.5 + difficulty * 0.2);
  return {
    id: nanoid(),
    position: [x, y, z],
    size: [6, 0.5, 0.5],
    type: 'rotatingBeam',
    rotationSpeed: speed
  };
};

const generateFallingRock = (x: number, y: number, z: number, difficulty: number): Obstacle => {
  const speed = randomBetween(0.1, 0.1 + difficulty * 0.05);
  return {
    id: nanoid(),
    position: [x, y + 5, z], // Start above the level
    size: [2, 2, 2],
    type: 'fallingRock',
    fallingSpeed: speed
  };
};

// Main level generation function
export const generateLevel = (difficulty: number, startZ: number = 0): LevelSection => {
  // Calculate level length based on difficulty
  const baseLength = 40;
  const length = baseLength + (difficulty * 10);
  
  // Number of platforms scales with difficulty and length
  const platformCount = Math.floor(length / 4) + difficulty;
  
  // Number of obstacles scales with difficulty
  const obstacleCount = Math.floor(difficulty * 1.5);
  
  const platforms: Platform[] = [];
  const obstacles: Obstacle[] = [];
  
  // Create an initial platform at the start
  platforms.push(generateBasicPlatform(0, 0, startZ, 10, 0.5, 10));
  
  // Generate main path platforms
  let currentZ = startZ + 10; // Start after the initial platform
  
  for (let i = 0; i < platformCount; i++) {
    const platformZ = currentZ + randomBetween(3, 6); // Space between platforms
    const platformX = randomBetween(-8, 8); // Random X position
    const platformY = randomBetween(-1, 1) * difficulty * 0.2; // Slight Y variation based on difficulty
    
    // Decide platform type based on difficulty
    const platformType = Math.random();
    
    if (platformType < 0.1 * difficulty && difficulty > 2) {
      // Disappearing platforms more likely in higher difficulties
      platforms.push(generateDisappearingPlatform(platformX, platformY, platformZ));
    } else if (platformType < 0.3 * difficulty && difficulty > 1) {
      // Moving platforms more likely in higher difficulties
      platforms.push(generateMovingPlatform(platformX, platformY, platformZ, difficulty));
    } else {
      // Basic platforms - size varies
      const width = randomBetween(2, 5);
      const depth = randomBetween(2, 5);
      platforms.push(generateBasicPlatform(platformX, platformY, platformZ, width, 0.5, depth));
    }
    
    currentZ = platformZ;
  }
  
  // Add obstacles based on difficulty
  for (let i = 0; i < obstacleCount; i++) {
    // Pick a random platform to place obstacle near
    const randomPlatformIdx = randomIntBetween(1, platforms.length - 1); // Skip the first platform
    const platform = platforms[randomPlatformIdx];
    
    // Position slightly above the platform
    const obstacleX = platform.position[0] + randomBetween(-1, 1);
    const obstacleY = platform.position[1] + 1;
    const obstacleZ = platform.position[2] + randomBetween(-1, 1);
    
    // Choose obstacle type based on difficulty
    const obstacleType = Math.random();
    
    if (obstacleType < 0.4) {
      obstacles.push(generateSpike(obstacleX, obstacleY, obstacleZ));
    } else if (obstacleType < 0.7) {
      obstacles.push(generateRotatingBeam(obstacleX, obstacleY + 1, obstacleZ, difficulty));
    } else {
      obstacles.push(generateFallingRock(obstacleX, obstacleY, obstacleZ, difficulty));
    }
  }
  
  // Add a finish platform at the end
  const finishZ = currentZ + 10;
  platforms.push(generateBasicPlatform(0, 0, finishZ, 10, 0.5, 5));
  
  // Create level section
  return {
    id: nanoid(),
    platforms,
    obstacles,
    finishPosition: [0, 1, finishZ],
    difficulty,
    length: finishZ + 5
  };
};
