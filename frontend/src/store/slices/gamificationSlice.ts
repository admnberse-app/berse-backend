import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Achievement {
  id: string;
  name: string;
  description: string;
  earned: boolean;
  earnedAt?: string;
}

interface GamificationState {
  points: number;
  achievements: Achievement[];
  level: number;
  experiencePoints: number;
  nextLevelXP: number;
}

const initialState: GamificationState = {
  points: 1250,
  achievements: [
    { id: '1', name: 'First Connection', description: 'Made your first connection', earned: true, earnedAt: '2024-01-15' },
    { id: '2', name: 'Network Builder', description: 'Connect with 10 people', earned: false },
    { id: '3', name: 'Squad Leader', description: 'Create your first squad', earned: false },
  ],
  level: 3,
  experiencePoints: 750,
  nextLevelXP: 1000,
};

const gamificationSlice = createSlice({
  name: 'gamification',
  initialState,
  reducers: {
    awardPoints: (state, action: PayloadAction<number>) => {
      state.points += action.payload;
      state.experiencePoints += action.payload;
      
      // Check for level up
      while (state.experiencePoints >= state.nextLevelXP) {
        state.level += 1;
        state.experiencePoints -= state.nextLevelXP;
        state.nextLevelXP = Math.floor(state.nextLevelXP * 1.2);
      }
    },
    updateAchievements: (state, action: PayloadAction<Achievement[]>) => {
      state.achievements = action.payload;
    },
    earnAchievement: (state, action: PayloadAction<string>) => {
      const achievement = state.achievements.find(a => a.id === action.payload);
      if (achievement && !achievement.earned) {
        achievement.earned = true;
        achievement.earnedAt = new Date().toISOString();
      }
    },
    setPoints: (state, action: PayloadAction<number>) => {
      state.points = action.payload;
    },
  },
});

export const { awardPoints, updateAchievements, earnAchievement, setPoints } = gamificationSlice.actions;
export default gamificationSlice.reducer;