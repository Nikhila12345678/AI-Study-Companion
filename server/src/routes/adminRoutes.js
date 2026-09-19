import { Router } from 'express';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import * as admin from '../controllers/adminController.js';

const router = Router();
router.use(requireAuth, requireAdmin);

router.get('/users', admin.listUsers);
router.get('/users/:userId', admin.getUserJourney);
router.get('/spaces', admin.listSpacesAdmin);
router.get('/projects', admin.listProjectsAdmin);
router.get('/activity', admin.listActivityAdmin);
router.get('/analytics', admin.adminAnalytics);
router.get('/ai-usage', admin.adminAiUsage);
router.get('/ai-evaluations', admin.adminAiEvaluations);
router.get('/background-jobs', admin.adminBackgroundJobs);
router.get('/system-health', admin.adminSystemHealth);

export default router;
