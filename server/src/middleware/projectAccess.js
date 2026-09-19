import mongoose from 'mongoose';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import Space from '../models/Space.js';
import Project from '../models/Project.js';

// CRITICAL isolation boundary: never trust a projectId/spaceId from the
// frontend. Every project-scoped route re-verifies ownership server-side
// here, once, so controllers/services don't each need to re-implement it.
export const loadProject = asyncHandler(async (req, res, next) => {
  const { projectId } = req.params;
  if (!mongoose.isValidObjectId(projectId)) throw ApiError.badRequest('Invalid project id.');

  const project = await Project.findById(projectId);
  if (!project) throw ApiError.notFound('Project not found.');
  if (String(project.userId) !== String(req.user._id)) {
    throw ApiError.forbidden('You do not have access to this project.');
  }

  req.project = project;
  next();
});

export const loadSpace = asyncHandler(async (req, res, next) => {
  const { spaceId } = req.params;
  if (!mongoose.isValidObjectId(spaceId)) throw ApiError.badRequest('Invalid space id.');

  const space = await Space.findById(spaceId);
  if (!space) throw ApiError.notFound('Space not found.');
  if (String(space.userId) !== String(req.user._id)) {
    throw ApiError.forbidden('You do not have access to this space.');
  }

  req.space = space;
  next();
});
