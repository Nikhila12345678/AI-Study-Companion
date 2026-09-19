import { createSlice } from '@reduxjs/toolkit';

const activeProjectSlice = createSlice({
  name: 'activeProject',
  initialState: { project: null, space: null },
  reducers: {
    setActiveProject: (state, action) => { state.project = action.payload.project; state.space = action.payload.space; },
    clearActiveProject: (state) => { state.project = null; state.space = null; }
  }
});

export const { setActiveProject, clearActiveProject } = activeProjectSlice.actions;
export default activeProjectSlice.reducer;
