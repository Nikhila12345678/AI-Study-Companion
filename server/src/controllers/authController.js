import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { signToken } from '../utils/jwt.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { env } from '../config/env.js';

function setAuthCookie(res, userId) {
  const token = signToken({ sub: String(userId) });
  res.cookie(env.cookieName, token, {
    httpOnly: true,
    secure: env.nodeEnv === 'production',
    sameSite: env.nodeEnv === 'production' ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000
  });
}

export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  const existing = await User.findOne({ email });
  if (existing) throw ApiError.conflict('An account with this email already exists.');

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, passwordHash });
  setAuthCookie(res, user._id);
  res.status(201).json({ user: user.toSafeJSON() });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !(await user.comparePassword(password))) {
    throw ApiError.unauthorized('Incorrect email or password.');
  }
  setAuthCookie(res, user._id);
  res.json({ user: user.toSafeJSON() });
});

export const logout = asyncHandler(async (req, res) => {
  res.clearCookie(env.cookieName);
  res.json({ ok: true });
});

export const me = asyncHandler(async (req, res) => {
  res.json({ user: req.user.toSafeJSON() });
});
