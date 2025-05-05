import { create } from 'zustand';
import { PlayerState } from '@/types';
import { nanoid } from 'nanoid';

interface PlayerStore {
  // Player data
  id: string;
  username: string;
  position: [number, number, number];
  velocity: [number, number, number];
  isJumping: boolean;
  isGrounded: boolean;
  score: number;
  color: string;
  
  // Other players in the game
  otherPlayers: Map<string, PlayerState>;
  
  // Actions
  setUsername: (username: string) => void;
  updatePosition: (position: [number, number, number]) => void;
  updateVelocity: (velocity: [number, number, number]) => void;
  setJumping: (jumping: boolean) => void;
  setGrounded: (grounded: boolean) => void;
  addScore: (points: number) => void;
  resetScore: () => void;
  resetPosition: () => void;
  
  // Other player management
  updatePlayerState: (playerId: string, state: Partial<PlayerState>) => void;
  addPlayer: (player: PlayerState) => void;
  removePlayer: (playerId: string) => void;
  
  // Get full player state
  getPlayerState: () => PlayerState;
  clearOtherPlayers: () => void;
}

// Generate a random color for the player
const getRandomColor = (): string => {
  const colors = ['#FF5733', '#33FF57', '#3357FF', '#F033FF', '#FF33F9', '#33FFF5'];
  return colors[Math.floor(Math.random() * colors.length)];
};

export const usePlayer = create<PlayerStore>((set, get) => ({
  id: nanoid(),
  username: '',
  position: [0, 1, 0],
  velocity: [0, 0, 0],
  isJumping: false,
  isGrounded: false,
  score: 0,
  color: getRandomColor(),
  otherPlayers: new Map(),
  
  setUsername: (username: string) => {
    set({ username });
    console.log(`Username set to: ${username}`);
  },
  
  updatePosition: (position: [number, number, number]) => {
    set({ position });
  },
  
  updateVelocity: (velocity: [number, number, number]) => {
    set({ velocity });
  },
  
  setJumping: (jumping: boolean) => {
    set({ isJumping: jumping });
  },
  
  setGrounded: (grounded: boolean) => {
    set({ isGrounded: grounded });
  },
  
  addScore: (points: number) => {
    set((state) => ({ 
      score: state.score + points 
    }));
  },
  
  resetScore: () => {
    set({ score: 0 });
  },
  
  resetPosition: () => {
    set({ 
      position: [0, 1, 0],
      velocity: [0, 0, 0],
      isJumping: false,
      isGrounded: false
    });
  },
  
  updatePlayerState: (playerId: string, state: Partial<PlayerState>) => {
    set((store) => {
      const newOtherPlayers = new Map(store.otherPlayers);
      const existingPlayer = newOtherPlayers.get(playerId);
      
      if (existingPlayer) {
        newOtherPlayers.set(playerId, { 
          ...existingPlayer, 
          ...state 
        });
      }
      
      return { otherPlayers: newOtherPlayers };
    });
  },
  
  addPlayer: (player: PlayerState) => {
    set((store) => {
      const newOtherPlayers = new Map(store.otherPlayers);
      newOtherPlayers.set(player.id, player);
      return { otherPlayers: newOtherPlayers };
    });
    console.log(`Player added: ${player.username}`);
  },
  
  removePlayer: (playerId: string) => {
    set((store) => {
      const newOtherPlayers = new Map(store.otherPlayers);
      newOtherPlayers.delete(playerId);
      return { otherPlayers: newOtherPlayers };
    });
    console.log(`Player removed: ${playerId}`);
  },
  
  getPlayerState: () => {
    const { id, username, position, velocity, isJumping, isGrounded, score, color } = get();
    return {
      id,
      username,
      position,
      velocity,
      isJumping,
      isGrounded,
      score,
      color
    };
  },
  
  clearOtherPlayers: () => {
    set({ otherPlayers: new Map() });
  }
}));
