import { useState, useEffect } from 'react';
import { usePlayer } from '../stores/usePlayer';
import { useLobby } from '../stores/useLobby';
import { peerConnection } from '../utils/PeerConnection';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

const LobbyUI = () => {
  // Local state
  const [joinLobbyId, setJoinLobbyId] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  
  // Get player and lobby stores
  const { username } = usePlayer();
  const { lobbyId, lobbyInfo, isHost, createLobby, joinLobby, leaveLobby, startGame } = useLobby();
  
  // Initialize peer connection
  useEffect(() => {
    const initializePeer = async () => {
      try {
        await peerConnection.initialize();
        console.log('Peer connection initialized');
      } catch (err) {
        console.error('Failed to initialize peer connection:', err);
        toast.error('Failed to initialize connection');
      }
    };
    
    // Initialize if not already connected
    if (!peerConnection.isConnected()) {
      initializePeer();
    }
    
    // Clean up on unmount
    return () => {
      if (!lobbyId) {
        peerConnection.destroy();
      }
    };
  }, [lobbyId]);
  
  // Handle creating a new lobby
  const handleCreateLobby = async () => {
    if (!peerConnection.isConnected()) {
      await peerConnection.initialize();
    }
    
    const newLobbyId = createLobby();
    toast.success(`Lobby created: ${newLobbyId}`);
  };
  
  // Handle joining an existing lobby
  const handleJoinLobby = async () => {
    if (!joinLobbyId) {
      toast.error('Please enter a lobby ID');
      return;
    }
    
    setIsConnecting(true);
    
    try {
      if (!peerConnection.isConnected()) {
        await peerConnection.initialize();
      }
      
      const connected = await peerConnection.connectToPeer(joinLobbyId);
      
      if (connected) {
        joinLobby(joinLobbyId);
        toast.success(`Joined lobby: ${joinLobbyId}`);
      } else {
        toast.error('Failed to connect to lobby');
      }
    } catch (err) {
      console.error('Join lobby error:', err);
      toast.error('Failed to join lobby');
    } finally {
      setIsConnecting(false);
    }
  };
  
  // Handle leaving the lobby
  const handleLeaveLobby = () => {
    peerConnection.destroy();
    leaveLobby();
    toast.info('Left lobby');
  };
  
  // Handle starting the game
  const handleStartGame = () => {
    if (!isHost) {
      toast.error('Only the host can start the game');
      return;
    }
    
    // Tell all peers to start the game
    peerConnection.broadcastMessage({
      type: 'game-start',
      data: null,
      sender: peerConnection.getMyId(),
      timestamp: Date.now()
    });
    
    // Start our own game
    startGame();
    toast.success('Game started!');
  };
  
  // If we're in a lobby, show the lobby screen
  if (lobbyId) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gray-900 p-4">
        <Card className="w-full max-w-md bg-gray-800 text-white border-gray-700">
          <CardHeader>
            <CardTitle className="text-2xl">Game Lobby</CardTitle>
            <CardDescription className="text-gray-400">
              Invite your friends using the lobby code
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="bg-gray-700 p-3 rounded text-center">
              <p className="text-sm text-gray-400">Lobby Code</p>
              <p className="text-xl font-bold tracking-wider">{lobbyId}</p>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Players</h3>
              <ul className="space-y-2">
                {lobbyInfo?.players.map(player => (
                  <li key={player.id} className="flex items-center gap-2 bg-gray-700 p-2 rounded">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: player.color }}
                    />
                    <span>
                      {player.username} {lobbyInfo.host === player.id ? ' (Host)' : ''}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
          
          <CardFooter className="flex gap-2 justify-between">
            <Button 
              variant="destructive" 
              className="w-1/2"
              onClick={handleLeaveLobby}
            >
              Leave Lobby
            </Button>
            
            <Button 
              className="w-1/2 bg-green-600 hover:bg-green-700"
              onClick={handleStartGame}
              disabled={!isHost || (lobbyInfo?.players.length || 0) < 1}
            >
              {isHost ? 'Start Game' : 'Waiting for host...'}
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  // Otherwise, show the create/join lobby screen
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-900 p-4">
      <Card className="w-full max-w-md bg-gray-800 text-white border-gray-700">
        <CardHeader>
          <CardTitle className="text-2xl">Infinite Platformer</CardTitle>
          <CardDescription className="text-gray-400">
            Welcome, {username}! Create a new game or join an existing one.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Create a new lobby */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Create New Game</h3>
            <Button 
              className="w-full bg-blue-600 hover:bg-blue-700"
              onClick={handleCreateLobby}
            >
              Create Lobby
            </Button>
          </div>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-gray-800 px-2 text-gray-400">Or</span>
            </div>
          </div>
          
          {/* Join an existing lobby */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Join Existing Game</h3>
            <div className="flex gap-2">
              <Input
                className="bg-gray-700 border-gray-600 text-white"
                placeholder="Enter Lobby Code"
                value={joinLobbyId}
                onChange={(e) => setJoinLobbyId(e.target.value.toUpperCase())}
              />
              <Button 
                className="bg-green-600 hover:bg-green-700"
                onClick={handleJoinLobby}
                disabled={isConnecting || !joinLobbyId}
              >
                {isConnecting ? 'Joining...' : 'Join'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LobbyUI;
