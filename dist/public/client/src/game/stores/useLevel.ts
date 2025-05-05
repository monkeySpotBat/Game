import { create } from 'zustand';
import { LevelSection, Platform, Obstacle } from '@/types';
import { generateLevel } from '../utils/LevelGenerator';

interface LevelState {
  // Current level data
  currentSection: LevelSection | null;
  nextSection: LevelSection | null;
  sectionTransition: number; // 0-1 value for transitioning between sections
  totalDistance: number;
  currentDifficulty: number;
  
  // Completed sections
  completedSections: number;
  
  // Actions
  generateInitialLevel: () => void;
  generateNextSection: () => void;
  updateTransition: (value: number) => void;
  advanceToNextSection: () => void;
  resetLevel: () => void;
  
  // Level data getter functions
  getAllPlatforms: () => Platform[];
  getAllObstacles: () => Obstacle[];
  getFinishPosition: () => [number, number, number] | null;
}

export const useLevel = create<LevelState>((set, get) => ({
  currentSection: null,
  nextSection: null,
  sectionTransition: 0,
  totalDistance: 0,
  currentDifficulty: 1,
  completedSections: 0,
  
  generateInitialLevel: () => {
    const initialSection = generateLevel(1, 0);
    const nextSection = generateLevel(1, initialSection.length);
    
    set({
      currentSection: initialSection,
      nextSection: nextSection,
      sectionTransition: 0,
      totalDistance: 0,
      currentDifficulty: 1,
      completedSections: 0
    });
    
    console.log('Initial level generated');
  },
  
  generateNextSection: () => {
    const { completedSections, nextSection } = get();
    
    // Calculate new difficulty (increases every 2 sections)
    const newDifficulty = Math.min(10, Math.floor(completedSections / 2) + 1);
    
    // Generate new section starting from the end of current next section
    const startPosition = nextSection ? nextSection.length : 0;
    const newNextSection = generateLevel(newDifficulty, startPosition);
    
    set({ 
      nextSection: newNextSection,
      currentDifficulty: newDifficulty
    });
    
    console.log(`Generated new section with difficulty ${newDifficulty}`);
  },
  
  updateTransition: (value: number) => {
    set({ sectionTransition: value });
  },
  
  advanceToNextSection: () => {
    const { nextSection, completedSections, totalDistance } = get();
    
    // Move next section to current
    set({
      currentSection: nextSection,
      sectionTransition: 0,
      completedSections: completedSections + 1,
      totalDistance: totalDistance + (nextSection?.length || 0)
    });
    
    // Generate new next section
    get().generateNextSection();
    
    console.log(`Advanced to section ${completedSections + 1}`);
  },
  
  resetLevel: () => {
    get().generateInitialLevel();
    console.log('Level reset');
  },
  
  getAllPlatforms: () => {
    const { currentSection, nextSection, sectionTransition } = get();
    
    if (!currentSection) return [];
    
    // Get platforms from current section
    const platforms = [...currentSection.platforms];
    
    // Add platforms from next section if it exists
    if (nextSection && sectionTransition > 0) {
      // Calculate offset for next section platforms
      const offsetZ = currentSection.length - sectionTransition * 5;
      
      const offsetPlatforms = nextSection.platforms.map(platform => {
        const newPlatform = { ...platform };
        // Adjust position based on transition
        newPlatform.position = [
          platform.position[0],
          platform.position[1],
          platform.position[2] + offsetZ
        ];
        return newPlatform;
      });
      
      platforms.push(...offsetPlatforms);
    }
    
    return platforms;
  },
  
  getAllObstacles: () => {
    const { currentSection, nextSection, sectionTransition } = get();
    
    if (!currentSection) return [];
    
    // Get obstacles from current section
    const obstacles = [...currentSection.obstacles];
    
    // Add obstacles from next section if it exists
    if (nextSection && sectionTransition > 0) {
      // Calculate offset for next section obstacles
      const offsetZ = currentSection.length - sectionTransition * 5;
      
      const offsetObstacles = nextSection.obstacles.map(obstacle => {
        const newObstacle = { ...obstacle };
        // Adjust position based on transition
        newObstacle.position = [
          obstacle.position[0],
          obstacle.position[1],
          obstacle.position[2] + offsetZ
        ];
        return newObstacle;
      });
      
      obstacles.push(...offsetObstacles);
    }
    
    return obstacles;
  },
  
  getFinishPosition: () => {
    const { currentSection, nextSection, sectionTransition } = get();
    
    if (!currentSection) return null;
    
    // If we're transitioning to next section, return null (no finish line visible)
    if (nextSection && sectionTransition > 0) {
      return null;
    }
    
    // Otherwise return the finish position for current section
    return currentSection.finishPosition;
  }
}));
