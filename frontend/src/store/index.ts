import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import gamificationSlice from './slices/gamificationSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    gamification: gamificationSlice,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;