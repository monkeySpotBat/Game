import { Canvas } from "@react-three/fiber";
import { Suspense, useEffect, useState } from "react";
import { KeyboardControls } from "@react-three/drei";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "sonner";
import { useAudio } from "./lib/stores/useAudio";
import Game from "./game/scenes/Game";
import LobbyUI from "./game/ui/LobbyUI";
import UsernameUI from "./game/ui/UsernameUI";
import { useLobby } from "./game/stores/useLobby";
import { usePlayer } from "./game/stores/usePlayer";
import { Controls } from "./types";
import "@fontsource/inter";

// Define control keys for the game
const controls = [
  { name: Controls.forward, keys: ["KeyW", "ArrowUp"] },
  { name: Controls.backward, keys: ["KeyS", "ArrowDown"] },
  { name: Controls.leftward, keys: ["KeyA", "ArrowLeft"] },
  { name: Controls.rightward, keys: ["KeyD", "ArrowRight"] },
  { name: Controls.jump, keys: ["Space"] },
];

// Preload game sounds
const preloadSounds = () => {
  const backgroundMusic = new Audio("/sounds/background.mp3");
  backgroundMusic.loop = true;
  backgroundMusic.volume = 0.5;
  
  const hitSound = new Audio("/sounds/hit.mp3");
  hitSound.volume = 0.7;

  const successSound = new Audio("/sounds/success.mp3");
  successSound.volume = 0.7;

  // Add to audio store for later use
  const audioStore = useAudio.getState();
  audioStore.setBackgroundMusic(backgroundMusic);
  audioStore.setHitSound(hitSound);
  audioStore.setSuccessSound(successSound);
};

// Main App component
function App() {
  const { gameState } = useLobby();
  const { username } = usePlayer();
  const [showCanvas, setShowCanvas] = useState(false);

  // Preload sounds once on component mount
  useEffect(() => {
    preloadSounds();
  }, []);

  // Show the canvas once everything is loaded
  useEffect(() => {
    setShowCanvas(true);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      {!username && <UsernameUI />}
      
      {username && gameState === 'lobby' && <LobbyUI />}
      
      {username && gameState !== 'lobby' && showCanvas && (
        <KeyboardControls map={controls}>
          <Canvas
            shadows
            camera={{
              position: [0, 5, 10],
              fov: 75,
              near: 0.1,
              far: 1000
            }}
            gl={{
              antialias: true,
              powerPreference: "default"
            }}
          >
            <color attach="background" args={["#87CEEB"]} />
            
            {/* Game components */}
            <Suspense fallback={null}>
              <Game />
            </Suspense>
          </Canvas>
        </KeyboardControls>
      )}
      
      <Toaster position="top-center" richColors />
    </QueryClientProvider>
  );
}

export default App;
