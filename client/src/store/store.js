import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import activeProjectReducer from './activeProjectSlice';
import uiReducer from './uiSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    activeProject: activeProjectReducer,
    ui: uiReducer
  }
});
