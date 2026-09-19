import Space from '../models/Space.js';
import Project from '../models/Project.js';
import LearningEvent from '../models/LearningEvent.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';

export const createSpace = asyncHandler(async (req, res) => {
  const space = await Space.create({ ...req.body, userId: req.user._id });
  res.status(201).json({ space });
});

export const listSpaces = asyncHandler(async (req, res) => {
  const spaces = await Space.find({ userId: req.user._id }).sort({ createdAt: -1 }).lean();
  const spaceIds = spaces.map((s) => s._id);
  const projectCounts = await Project.aggregate([
    { $match: { spaceId: { $in: spaceIds } } },
    { $group: { _id: '$spaceId', count: { $sum: 1 } } }
  ]);
  const countMap = Object.fromEntries(projectCounts.map((p) => [String(p._id), p.count]));
  res.json({ spaces: spaces.map((s) => ({ ...s, projectCount: countMap[String(s._id)] || 0 })) });
});

export const getSpace = asyncHandler(async (req, res) => {
  res.json({ space: req.space });
});

export const updateSpace = asyncHandler(async (req, res) => {
  Object.assign(req.space, req.body);
  await req.space.save();
  res.json({ space: req.space });
});

export const deleteSpace = asyncHandler(async (req, res) => {
  const projectCount = await Project.countDocuments({ spaceId: req.space._id });
  if (projectCount > 0) throw ApiError.badRequest('Delete or move projects out of this space first.');
  await req.space.deleteOne();
  res.json({ ok: true });
});

export const getSpaceDashboard = asyncHandler(async (req, res) => {
  const projects = await Project.find({ spaceId: req.space._id }).sort({ updatedAt: -1 }).lean();
  const recentActivity = await LearningEvent.find({ spaceId: req.space._id }).sort({ createdAt: -1 }).limit(10).lean();
  res.json({ space: req.space, projects, recentActivity });
});
