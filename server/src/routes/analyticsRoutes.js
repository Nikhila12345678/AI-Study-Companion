import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import * as analytics from '../controllers/analyticsController.js';

const router = Router();
router.use(requireAuth);
router.get('/global', analytics.globalAnalytics);

export default router;
