import { createSlice } from '@reduxjs/toolkit';

const uiSlice = createSlice({
  name: 'ui',
  initialState: { toasts: [] },
  reducers: {
    pushToast: (state, action) => { state.toasts.push({ id: Date.now() + Math.random(), ...action.payload }); },
    dismissToast: (state, action) => { state.toasts = state.toasts.filter((t) => t.id !== action.payload); }
  }
});

export const { pushToast, dismissToast } = uiSlice.actions;
export default uiSlice.reducer;
