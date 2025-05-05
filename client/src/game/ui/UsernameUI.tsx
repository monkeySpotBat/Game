import { useState } from 'react';
import { usePlayer } from '../stores/usePlayer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

const UsernameUI = () => {
  const [username, setUsername] = useState('');
  const setPlayerUsername = usePlayer(state => state.setUsername);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim()) {
      toast.error('Please enter a username');
      return;
    }
    
    if (username.length > 15) {
      toast.error('Username must be 15 characters or less');
      return;
    }
    
    setPlayerUsername(username.trim());
    toast.success(`Welcome, ${username}!`);
  };
  
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-900 p-4">
      <Card className="w-full max-w-md bg-gray-800 text-white border-gray-700">
        <CardHeader>
          <CardTitle className="text-3xl">Infinite Platformer</CardTitle>
          <CardDescription className="text-gray-400">
            A cooperative infinite platformer game
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium text-gray-300">
                Choose a username
              </label>
              <Input
                id="username"
                className="bg-gray-700 border-gray-600 text-white"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                maxLength={15}
                autoFocus
              />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">How to Play</h3>
              <ul className="text-sm text-gray-300 space-y-1 list-disc pl-5">
                <li>Create a lobby or join with a code</li>
                <li>Complete platforms together with your friends</li>
                <li>If any player dies, all players restart</li>
                <li>Controls: WASD or Arrow Keys to move, Space to jump</li>
              </ul>
            </div>
          </CardContent>
          
          <CardFooter>
            <Button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              Start Playing
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default UsernameUI;
