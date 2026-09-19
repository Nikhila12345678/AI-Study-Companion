import { getComposedContext } from '../services/context/contextService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getLearningContext = asyncHandler(async (req, res) => {
  const context = await getComposedContext(req.project._id);
  res.json({ context });
});
