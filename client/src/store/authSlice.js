import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../services/api';

export const fetchMe = createAsyncThunk('auth/fetchMe', async () => {
  const res = await api.get('/auth/me');
  return res.data.user;
});

export const login = createAsyncThunk('auth/login', async ({ email, password }) => {
  const res = await api.post('/auth/login', { email, password });
  return res.data.user;
});

export const register = createAsyncThunk('auth/register', async ({ name, email, password }) => {
  const res = await api.post('/auth/register', { name, email, password });
  return res.data.user;
});

export const logout = createAsyncThunk('auth/logout', async () => {
  await api.post('/auth/logout');
});

const authSlice = createSlice({
  name: 'auth',
  initialState: { user: null, status: 'idle', error: null }, // status: idle|loading|authenticated|unauthenticated
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMe.pending, (state) => { state.status = 'loading'; })
      .addCase(fetchMe.fulfilled, (state, action) => { state.status = 'authenticated'; state.user = action.payload; })
      .addCase(fetchMe.rejected, (state) => { state.status = 'unauthenticated'; state.user = null; })
      .addCase(login.fulfilled, (state, action) => { state.status = 'authenticated'; state.user = action.payload; state.error = null; })
      .addCase(login.rejected, (state, action) => { state.error = action.error.message; })
      .addCase(register.fulfilled, (state, action) => { state.status = 'authenticated'; state.user = action.payload; state.error = null; })
      .addCase(register.rejected, (state, action) => { state.error = action.error.message; })
      .addCase(logout.fulfilled, (state) => { state.status = 'unauthenticated'; state.user = null; });
  }
});

export default authSlice.reducer;
