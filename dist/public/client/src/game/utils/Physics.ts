import { PlayerState, Platform, Obstacle } from '@/types';

// Constants
const GRAVITY = 20;
const JUMP_FORCE = 10;
const MOVE_SPEED = 5;
const MAX_FALL_SPEED = 20;

// Check if player is colliding with a platform
export const checkPlatformCollision = (player: PlayerState, platform: Platform): boolean => {
  // Player bounding box (simple AABB)
  const playerMin = [
    player.position[0] - 0.5, // x min (half width)
    player.position[1] - 1.0, // y min (full height because position is at center)
    player.position[2] - 0.5  // z min (half depth)
  ];
  const playerMax = [
    player.position[0] + 0.5, // x max
    player.position[1] + 0.0, // y max (position is at center of player)
    player.position[2] + 0.5  // z max
  ];
  
  // Platform bounding box
  const platformMin = [
    platform.position[0] - platform.size[0] / 2,
    platform.position[1] - platform.size[1] / 2,
    platform.position[2] - platform.size[2] / 2
  ];
  const platformMax = [
    platform.position[0] + platform.size[0] / 2,
    platform.position[1] + platform.size[1] / 2,
    platform.position[2] + platform.size[2] / 2
  ];
  
  // Check for intersection in all three axes
  return (
    playerMax[0] > platformMin[0] && playerMin[0] < platformMax[0] &&
    playerMax[1] > platformMin[1] && playerMin[1] < platformMax[1] &&
    playerMax[2] > platformMin[2] && playerMin[2] < platformMax[2]
  );
};

// Check if player is colliding with an obstacle
export const checkObstacleCollision = (player: PlayerState, obstacle: Obstacle): boolean => {
  // For simplicity, use the same collision detection as platforms
  // In a more complex game, this could be different for different obstacle types
  
  // Player bounding box (simple AABB)
  const playerMin = [
    player.position[0] - 0.5, // x min (half width)
    player.position[1] - 1.0, // y min (full height because position is at center)
    player.position[2] - 0.5  // z min (half depth)
  ];
  const playerMax = [
    player.position[0] + 0.5, // x max
    player.position[1] + 0.0, // y max (position is at center of player)
    player.position[2] + 0.5  // z max
  ];
  
  // Obstacle bounding box
  const obstacleMin = [
    obstacle.position[0] - obstacle.size[0] / 2,
    obstacle.position[1] - obstacle.size[1] / 2,
    obstacle.position[2] - obstacle.size[2] / 2
  ];
  const obstacleMax = [
    obstacle.position[0] + obstacle.size[0] / 2,
    obstacle.position[1] + obstacle.size[1] / 2,
    obstacle.position[2] + obstacle.size[2] / 2
  ];
  
  // Check for intersection in all three axes
  return (
    playerMax[0] > obstacleMin[0] && playerMin[0] < obstacleMax[0] &&
    playerMax[1] > obstacleMin[1] && playerMin[1] < obstacleMax[1] &&
    playerMax[2] > obstacleMin[2] && playerMin[2] < obstacleMax[2]
  );
};

// Check if player is standing on a platform
export const checkIfGrounded = (player: PlayerState, platforms: Platform[]): boolean => {
  // Small offset to check slightly below the player
  const groundCheckPosition: PlayerState = {
    ...player,
    position: [
      player.position[0],
      player.position[1] - 0.1, // Check slightly below current position
      player.position[2]
    ]
  };
  
  // Check if any platform is below the player
  return platforms.some(platform => checkPlatformCollision(groundCheckPosition, platform));
};

// Check if player has reached the finish line
export const checkFinish = (player: PlayerState, finishPosition: [number, number, number]): boolean => {
  // Distance to finish position
  const dx = player.position[0] - finishPosition[0];
  const dz = player.position[2] - finishPosition[2];
  const distance = Math.sqrt(dx * dx + dz * dz);
  
  // Check if close enough to finish
  return distance < 2;
};

// Update player position based on inputs and physics
export const updatePlayerPhysics = (
  player: PlayerState,
  deltaTime: number,
  platforms: Platform[],
  controls: {
    forward: boolean,
    backward: boolean,
    leftward: boolean,
    rightward: boolean,
    jump: boolean
  }
): PlayerState => {
  // Copy player state
  const updatedPlayer = { ...player };
  
  // Check if grounded
  const isGrounded = checkIfGrounded(player, platforms);
  updatedPlayer.isGrounded = isGrounded;
  
  // Apply gravity if not grounded
  if (!isGrounded) {
    updatedPlayer.velocity[1] -= GRAVITY * deltaTime;
    
    // Limit fall speed
    if (updatedPlayer.velocity[1] < -MAX_FALL_SPEED) {
      updatedPlayer.velocity[1] = -MAX_FALL_SPEED;
    }
  } else {
    // Reset vertical velocity when grounded
    updatedPlayer.velocity[1] = 0;
    
    // Allow jumping when grounded
    if (controls.jump && !player.isJumping) {
      updatedPlayer.velocity[1] = JUMP_FORCE;
      updatedPlayer.isJumping = true;
    }
  }
  
  // Reset jumping state when player lands
  if (isGrounded && player.isJumping) {
    updatedPlayer.isJumping = false;
  }
  
  // Apply horizontal movement
  const moveX = (controls.rightward ? 1 : 0) - (controls.leftward ? 1 : 0);
  const moveZ = (controls.backward ? 1 : 0) - (controls.forward ? 1 : 0);
  
  // Set horizontal velocity
  updatedPlayer.velocity[0] = moveX * MOVE_SPEED;
  updatedPlayer.velocity[2] = moveZ * MOVE_SPEED;
  
  // Apply velocity to position
  updatedPlayer.position[0] += updatedPlayer.velocity[0] * deltaTime;
  updatedPlayer.position[1] += updatedPlayer.velocity[1] * deltaTime;
  updatedPlayer.position[2] += updatedPlayer.velocity[2] * deltaTime;
  
  // Prevent falling below a certain point (death height)
  if (updatedPlayer.position[1] < -10) {
    // This player has fallen off the map
    return updatedPlayer;
  }
  
  // Platform collision response
  for (const platform of platforms) {
    if (checkPlatformCollision(updatedPlayer, platform)) {
      // Simple collision resolution
      // Find the closest edge and push the player out
      
      // First, find the center of the player and platform
      const playerCenter = updatedPlayer.position;
      const platformCenter = platform.position;
      
      // Calculate the distance between centers on each axis
      const dx = playerCenter[0] - platformCenter[0];
      const dy = playerCenter[1] - platformCenter[1];
      const dz = playerCenter[2] - platformCenter[2];
      
      // Calculate the minimum distance needed to move along each axis
      const minX = platform.size[0] / 2 + 0.5;  // Half platform width + half player width
      const minY = platform.size[1] / 2 + 0.5;  // Half platform height + half player height
      const minZ = platform.size[2] / 2 + 0.5;  // Half platform depth + half player depth
      
      // Calculate the overlap in each direction
      const overlapX = minX - Math.abs(dx);
      const overlapY = minY - Math.abs(dy);
      const overlapZ = minZ - Math.abs(dz);
      
      // Find the axis with the smallest overlap
      if (overlapX < overlapY && overlapX < overlapZ) {
        // X-axis has the smallest overlap
        updatedPlayer.position[0] += overlapX * (dx > 0 ? 1 : -1);
      } else if (overlapY < overlapX && overlapY < overlapZ) {
        // Y-axis has the smallest overlap
        updatedPlayer.position[1] += overlapY * (dy > 0 ? 1 : -1);
        
        // If we hit from below, stop upward velocity
        if (dy < 0) {
          updatedPlayer.velocity[1] = Math.min(0, updatedPlayer.velocity[1]);
        }
        // If we hit from above, we're grounded
        else {
          updatedPlayer.velocity[1] = 0;
          updatedPlayer.isGrounded = true;
        }
      } else {
        // Z-axis has the smallest overlap
        updatedPlayer.position[2] += overlapZ * (dz > 0 ? 1 : -1);
      }
    }
  }
  
  return updatedPlayer;
};
