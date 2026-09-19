import { getProjectAnalytics, getGlobalAnalytics } from '../services/analytics/analyticsService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const projectAnalytics = asyncHandler(async (req, res) => {
  const analytics = await getProjectAnalytics(req.project._id);
  res.json({ analytics });
});

export const globalAnalytics = asyncHandler(async (req, res) => {
  const analytics = await getGlobalAnalytics(req.user._id);
  res.json({ analytics });
});
