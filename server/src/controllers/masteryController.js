import { getProjectMastery, getGrowth } from '../services/mastery/masteryService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';

export const getMastery = asyncHandler(async (req, res) => {
  const mastery = await getProjectMastery(req.project._id, req.user._id);
  res.json({ mastery });
});

export const getConceptMastery = asyncHandler(async (req, res) => {
  const mastery = await getProjectMastery(req.project._id, req.user._id);
  const found = mastery.find((m) => String(m.conceptId) === req.params.conceptId);
  if (!found) throw ApiError.notFound('No mastery record for this concept yet.');
  res.json({ mastery: found });
});

export const getProjectGrowth = asyncHandler(async (req, res) => {
  const growth = await getGrowth(req.project._id, req.user._id);
  res.json({ growth });
});

export const getConceptGrowth = asyncHandler(async (req, res) => {
  const growth = await getGrowth(req.project._id, req.user._id);
  const found = growth.find((g) => String(g.conceptId) === req.params.conceptId);
  if (!found) throw ApiError.notFound('No growth record for this concept yet.');
  res.json({ growth: found });
});
