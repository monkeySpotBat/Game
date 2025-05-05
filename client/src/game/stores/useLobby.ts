import { create } from 'zustand';
import { nanoid } from 'nanoid';
import { GameState, LobbyInfo } from '@/types';

interface LobbyState {
  // Lobby state
  lobbyId: string | null;
  isHost: boolean;
  connected: boolean;
  gameState: GameState;
  lobbyInfo: LobbyInfo | null;
  currentLevel: number;
  
  // Actions
  createLobby: () => void;
  joinLobby: (lobbyId: string) => void;
  leaveLobby: () => void;
  setLobbyInfo: (info: LobbyInfo) => void;
  setGameState: (state: GameState) => void;
  startGame: () => void;
  playerDied: () => void;
  levelComplete: () => void;
  nextLevel: () => void;
}

// Generate a random 6-character lobby code
const generateLobbyId = () => {
  return nanoid(6).toUpperCase();
};

export const useLobby = create<LobbyState>((set, get) => ({
  lobbyId: null,
  isHost: false,
  connected: false,
  gameState: 'lobby',
  lobbyInfo: null,
  currentLevel: 0,
  
  createLobby: () => {
    const newLobbyId = generateLobbyId();
    set({ 
      lobbyId: newLobbyId,
      isHost: true,
      connected: true,
    });
    console.log(`Created lobby with ID: ${newLobbyId}`);
    return newLobbyId;
  },
  
  joinLobby: (lobbyId: string) => {
    set({ 
      lobbyId,
      isHost: false,
      connected: true,
    });
    console.log(`Joined lobby with ID: ${lobbyId}`);
  },
  
  leaveLobby: () => {
    set({ 
      lobbyId: null,
      isHost: false,
      connected: false,
      gameState: 'lobby',
      lobbyInfo: null,
      currentLevel: 0,
    });
    console.log('Left lobby');
  },
  
  setLobbyInfo: (info: LobbyInfo) => {
    set({ lobbyInfo: info });
  },
  
  setGameState: (state: GameState) => {
    set({ gameState: state });
  },
  
  startGame: () => {
    set({ 
      gameState: 'playing',
      currentLevel: 0,
    });
    console.log('Game started');
  },
  
  playerDied: () => {
    set({ gameState: 'dead' });
    console.log('Player died');
  },
  
  levelComplete: () => {
    set({ gameState: 'complete' });
    console.log('Level completed');
  },
  
  nextLevel: () => {
    const nextLevel = get().currentLevel + 1;
    set({ 
      gameState: 'playing',
      currentLevel: nextLevel,
    });
    console.log(`Starting level ${nextLevel}`);
  },
}));
