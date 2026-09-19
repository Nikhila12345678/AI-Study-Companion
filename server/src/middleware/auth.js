import { verifyToken } from '../utils/jwt.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import User from '../models/User.js';
import { env } from '../config/env.js';

// Reads the JWT from the httpOnly cookie (never localStorage), verifies it,
// and attaches the authenticated user to req.user. Never trusts a userId
// supplied in the request body/query for authorization decisions.
export const requireAuth = asyncHandler(async (req, res, next) => {
  const token = req.cookies?.[env.cookieName];
  if (!token) throw ApiError.unauthorized('You need to be logged in to do that.');

  let decoded;
  try {
    decoded = verifyToken(token);
  } catch {
    throw ApiError.unauthorized('Your session has expired. Please log in again.');
  }

  const user = await User.findById(decoded.sub);
  if (!user) throw ApiError.unauthorized('Your session is no longer valid.');

  req.user = user;
  next();
});

export const requireAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    throw ApiError.forbidden('This area is restricted to administrators.');
  }
  next();
};
