// Game control keys
export enum Controls {
  forward = 'forward',
  backward = 'backward',
  leftward = 'leftward',
  rightward = 'rightward',
  jump = 'jump'
}

// Player states
export interface PlayerState {
  id: string;
  username: string;
  position: [number, number, number];
  velocity: [number, number, number];
  isJumping: boolean;
  isGrounded: boolean;
  score: number;
  color: string;
}

// Platform & Obstacle types
export interface Platform {
  id: string;
  position: [number, number, number];
  size: [number, number, number];
  type: 'normal' | 'moving' | 'disappearing';
  movingDirection?: [number, number, number];
  movingSpeed?: number;
  movingDistance?: number;
  initialPosition?: [number, number, number];
}

export interface Obstacle {
  id: string;
  position: [number, number, number];
  size: [number, number, number];
  type: 'spike' | 'rotatingBeam' | 'fallingRock';
  rotationSpeed?: number;
  fallingSpeed?: number;
}

// Level data structure
export interface LevelSection {
  id: string;
  platforms: Platform[];
  obstacles: Obstacle[];
  finishPosition: [number, number, number];
  difficulty: number;
  length: number;
}

// Message types for P2P communication
export type MessageType = 
  | 'join'
  | 'player-update'
  | 'level-data'
  | 'player-death'
  | 'level-complete'
  | 'player-disconnect'
  | 'game-start'
  | 'new-level';

export interface PeerMessage {
  type: MessageType;
  data: any;
  sender: string;
  timestamp: number;
}

// Game states
export type GameState = 'lobby' | 'playing' | 'dead' | 'complete';

// Lobby information
export interface LobbyInfo {
  lobbyId: string;
  host: string;
  players: {
    id: string;
    username: string;
    color: string;
  }[];
}
