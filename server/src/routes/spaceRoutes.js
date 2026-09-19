import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { loadSpace } from '../middleware/projectAccess.js';
import { validate } from '../middleware/validate.js';
import { createSpaceSchema, updateSpaceSchema } from '../validators/spaceValidators.js';
import * as spaces from '../controllers/spacesController.js';
import * as projects from '../controllers/projectsController.js';
import * as activity from '../controllers/activityController.js';
import { createProjectSchema } from '../validators/projectValidators.js';

const router = Router();
router.use(requireAuth);

router.post('/', validate(createSpaceSchema), spaces.createSpace);
router.get('/', spaces.listSpaces);
router.get('/:spaceId', loadSpace, spaces.getSpace);
router.patch('/:spaceId', loadSpace, validate(updateSpaceSchema), spaces.updateSpace);
router.delete('/:spaceId', loadSpace, spaces.deleteSpace);
router.get('/:spaceId/dashboard', loadSpace, spaces.getSpaceDashboard);
router.get('/:spaceId/activity', loadSpace, activity.getSpaceActivity);

router.post('/:spaceId/projects', loadSpace, validate(createProjectSchema), projects.createProject);
router.get('/:spaceId/projects', loadSpace, projects.listProjectsInSpace);

export default router;
