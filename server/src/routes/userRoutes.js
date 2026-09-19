import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import * as projects from '../controllers/projectsController.js';

const router = Router();
router.use(requireAuth);
router.get('/me/activity', projects.listUserActivity);

export default router;
