import LearningEvent from '../models/LearningEvent.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getProjectActivity = asyncHandler(async (req, res) => {
  const events = await LearningEvent.find({ projectId: req.project._id }).sort({ createdAt: -1 }).limit(50).lean();
  res.json({ events });
});

export const getSpaceActivity = asyncHandler(async (req, res) => {
  const events = await LearningEvent.find({ spaceId: req.space._id }).sort({ createdAt: -1 }).limit(50).lean();
  res.json({ events });
});
