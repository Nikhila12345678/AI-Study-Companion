import Recommendation from '../models/Recommendation.js';
import { generateRecommendation } from '../services/recommendation/recommendationService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const listRecommendations = asyncHandler(async (req, res) => {
  const recommendations = await Recommendation.find({ projectId: req.project._id, userId: req.user._id }).sort({ createdAt: -1 }).limit(20).lean();
  res.json({ recommendations });
});

export const getLatestRecommendation = asyncHandler(async (req, res) => {
  let recommendation = await Recommendation.findOne({ projectId: req.project._id, userId: req.user._id, status: 'active' }).sort({ createdAt: -1 }).lean();
  if (!recommendation) {
    recommendation = await generateRecommendation({ project: req.project, user: req.user });
  }
  res.json({ recommendation });
});
