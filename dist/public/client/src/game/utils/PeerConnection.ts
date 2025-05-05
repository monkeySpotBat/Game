import Peer, { DataConnection } from 'peerjs';
import { PeerMessage, PlayerState } from '@/types';
import { useLobby } from '../stores/useLobby';
import { usePlayer } from '../stores/usePlayer';
import { useLevel } from '../stores/useLevel';
import { toast } from 'sonner';

class PeerConnectionManager {
  private peer: Peer | null = null;
  private connections: Map<string, DataConnection> = new Map();
  private myId: string = '';
  private isInitialized: boolean = false;
  
  // Initialize PeerJS connection
  public async initialize(): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        // Create new Peer
        this.peer = new Peer();
        
        // Handle successful connection
        this.peer.on('open', (id) => {
          console.log('My peer ID is:', id);
          this.myId = id;
          this.isInitialized = true;
          resolve(id);
        });
        
        // Handle incoming connections
        this.peer.on('connection', (conn) => {
          this.handleConnection(conn);
        });
        
        // Handle errors
        this.peer.on('error', (err) => {
          console.error('Peer connection error:', err);
          toast.error('Connection error: ' + err.message);
          reject(err);
        });
      } catch (err) {
        console.error('Failed to initialize peer:', err);
        toast.error('Failed to initialize connection');
        reject(err);
      }
    });
  }
  
  // Clean up and close connections
  public destroy(): void {
    if (this.peer) {
      // Close all connections
      this.connections.forEach((conn) => {
        conn.close();
      });
      this.connections.clear();
      
      // Close and destroy peer
      this.peer.destroy();
      this.peer = null;
      this.isInitialized = false;
      
      console.log('Peer connection destroyed');
    }
  }
  
  // Connect to another peer
  public async connectToPeer(peerId: string): Promise<boolean> {
    if (!this.peer || !this.isInitialized) {
      await this.initialize();
    }
    
    return new Promise((resolve) => {
      try {
        if (!this.peer) {
          resolve(false);
          return;
        }
        
        // Check if already connected
        if (this.connections.has(peerId)) {
          resolve(true);
          return;
        }
        
        // Connect to the peer
        const conn = this.peer.connect(peerId, {
          reliable: true
        });
        
        // Handle the connection
        this.handleConnection(conn);
        
        // Resolve on successful connection
        conn.on('open', () => {
          toast.success('Connected to peer');
          resolve(true);
        });
        
        // Handle connection error
        conn.on('error', (err) => {
          console.error('Connection error:', err);
          toast.error('Failed to connect to peer');
          resolve(false);
        });
      } catch (err) {
        console.error('Connect to peer error:', err);
        toast.error('Connection failed');
        resolve(false);
      }
    });
  }
  
  // Handle incoming/outgoing connection
  private handleConnection(conn: DataConnection): void {
    // Store connection
    this.connections.set(conn.peer, conn);
    
    console.log('New connection:', conn.peer);
    
    // Handle connection open
    conn.on('open', () => {
      console.log('Connection opened with', conn.peer);
      
      // Send current player info
      this.sendPlayerInfo(conn.peer);
      
      // Update UI to show connected peer
      this.updateLobbyInfo();
    });
    
    // Handle data
    conn.on('data', (data) => {
      this.handleMessage(data as PeerMessage, conn.peer);
    });
    
    // Handle connection close
    conn.on('close', () => {
      console.log('Connection closed with', conn.peer);
      this.connections.delete(conn.peer);
      
      // Remove player from the game
      const playerStore = usePlayer.getState();
      playerStore.removePlayer(conn.peer);
      
      // Update lobby info
      this.updateLobbyInfo();
      
      toast.info('Player disconnected');
    });
    
    // Handle errors
    conn.on('error', (err) => {
      console.error('Connection error with', conn.peer, ':', err);
      this.connections.delete(conn.peer);
      
      // Remove player from the game
      const playerStore = usePlayer.getState();
      playerStore.removePlayer(conn.peer);
      
      // Update lobby info
      this.updateLobbyInfo();
    });
  }
  
  // Handle incoming message
  private handleMessage(message: PeerMessage, senderId: string): void {
    if (!message || !message.type) {
      console.error('Invalid message received');
      return;
    }
    
    // console.log('Received message:', message.type, 'from', senderId);
    
    const lobbyStore = useLobby.getState();
    const playerStore = usePlayer.getState();
    const levelStore = useLevel.getState();
    
    switch (message.type) {
      case 'join':
        // Handle player joining
        const newPlayer = message.data as PlayerState;
        playerStore.addPlayer(newPlayer);
        this.updateLobbyInfo();
        
        // If we're the host, send current level data to the new player
        if (lobbyStore.isHost) {
          this.sendMessage(senderId, {
            type: 'level-data',
            data: {
              currentSection: levelStore.currentSection,
              nextSection: levelStore.nextSection,
              sectionTransition: levelStore.sectionTransition
            },
            sender: this.myId,
            timestamp: Date.now()
          });
        }
        break;
        
      case 'player-update':
        // Update player position and state
        const updatedPlayer = message.data as Partial<PlayerState>;
        playerStore.updatePlayerState(senderId, updatedPlayer);
        break;
        
      case 'level-data':
        // Update level data (received from host)
        if (!lobbyStore.isHost) {
          const levelData = message.data;
          if (levelData.currentSection) {
            levelStore.currentSection = levelData.currentSection;
          }
          if (levelData.nextSection) {
            levelStore.nextSection = levelData.nextSection;
          }
          if (levelData.sectionTransition !== undefined) {
            levelStore.updateTransition(levelData.sectionTransition);
          }
        }
        break;
        
      case 'player-death':
        // Handle player death
        toast.error(`${message.data.username} died!`);
        lobbyStore.playerDied();
        break;
        
      case 'level-complete':
        // Handle level completion
        toast.success(`Level completed!`);
        lobbyStore.levelComplete();
        break;
        
      case 'game-start':
        // Start the game
        levelStore.resetLevel();
        lobbyStore.startGame();
        break;
        
      case 'new-level':
        // Start new level
        levelStore.resetLevel();
        lobbyStore.nextLevel();
        break;
        
      default:
        console.warn('Unknown message type:', message.type);
    }
  }
  
  // Send message to specific peer
  public sendMessage(peerId: string, message: PeerMessage): boolean {
    const conn = this.connections.get(peerId);
    if (conn && conn.open) {
      try {
        conn.send(message);
        return true;
      } catch (err) {
        console.error('Error sending message to', peerId, ':', err);
        return false;
      }
    }
    return false;
  }
  
  // Broadcast message to all connected peers
  public broadcastMessage(message: PeerMessage): void {
    this.connections.forEach((conn) => {
      if (conn.open) {
        try {
          conn.send(message);
        } catch (err) {
          console.error('Error broadcasting message to', conn.peer, ':', err);
        }
      }
    });
  }
  
  // Send current player information
  public sendPlayerInfo(peerId?: string): void {
    const playerState = usePlayer.getState().getPlayerState();
    const message: PeerMessage = {
      type: 'join',
      data: playerState,
      sender: this.myId,
      timestamp: Date.now()
    };
    
    if (peerId) {
      this.sendMessage(peerId, message);
    } else {
      this.broadcastMessage(message);
    }
  }
  
  // Send player state update
  public sendPlayerUpdate(): void {
    const playerState = usePlayer.getState().getPlayerState();
    
    // Only send position, velocity, and important states
    const updateData = {
      position: playerState.position,
      velocity: playerState.velocity,
      isJumping: playerState.isJumping,
      isGrounded: playerState.isGrounded,
      score: playerState.score
    };
    
    const message: PeerMessage = {
      type: 'player-update',
      data: updateData,
      sender: this.myId,
      timestamp: Date.now()
    };
    
    this.broadcastMessage(message);
  }
  
  // Update lobby information based on connected peers
  private updateLobbyInfo(): void {
    const lobbyStore = useLobby.getState();
    const playerStore = usePlayer.getState();
    
    if (!lobbyStore.lobbyId) return;
    
    // Get connected player information
    const players = Array.from(this.connections.keys()).map(peerId => {
      const player = playerStore.otherPlayers.get(peerId);
      return {
        id: peerId,
        username: player?.username || 'Unknown Player',
        color: player?.color || '#FFFFFF'
      };
    });
    
    // Add ourselves
    players.push({
      id: this.myId,
      username: playerStore.username,
      color: playerStore.color
    });
    
    // Update lobby info
    lobbyStore.setLobbyInfo({
      lobbyId: lobbyStore.lobbyId,
      host: lobbyStore.isHost ? this.myId : Array.from(this.connections.keys())[0] || this.myId,
      players
    });
  }
  
  // Get ID of this peer
  public getMyId(): string {
    return this.myId;
  }
  
  // Check if connected to lobby
  public isConnected(): boolean {
    return this.isInitialized;
  }
  
  // Get number of connected peers
  public getConnectionCount(): number {
    return this.connections.size;
  }
}

// Singleton instance
export const peerConnection = new PeerConnectionManager();
