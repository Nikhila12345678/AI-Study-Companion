import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { loadProject } from '../middleware/projectAccess.js';
import { validate } from '../middleware/validate.js';
import { updateProjectSchema } from '../validators/projectValidators.js';
import * as projects from '../controllers/projectsController.js';
import * as materials from '../controllers/materialsController.js';
import * as knowledge from '../controllers/knowledgeController.js';
import * as tutor from '../controllers/tutorController.js';
import * as quiz from '../controllers/quizController.js';
import * as mastery from '../controllers/masteryController.js';
import * as recommendations from '../controllers/recommendationController.js';
import * as learningContext from '../controllers/learningContextController.js';
import * as activity from '../controllers/activityController.js';
import * as analytics from '../controllers/analyticsController.js';
import { upload } from '../config/upload.js';
import { sendMessageSchema } from '../validators/tutorValidators.js';
import { submitAnswerSchema } from '../validators/quizValidators.js';

const router = Router();
router.use(requireAuth);

// Project CRUD + dashboard
router.get('/:projectId', loadProject, projects.getProject);
router.patch('/:projectId', loadProject, validate(updateProjectSchema), projects.updateProject);
router.delete('/:projectId', loadProject, projects.deleteProject);
router.get('/:projectId/dashboard', loadProject, projects.getProjectDashboard);
router.get('/:projectId/activity', loadProject, activity.getProjectActivity);

// Materials
router.post('/:projectId/materials', loadProject, upload.single('file'), materials.uploadMaterial);
router.get('/:projectId/materials', loadProject, materials.listMaterials);

// Knowledge & Concepts
router.get('/:projectId/knowledge', loadProject, knowledge.getProjectKnowledge);
router.get('/:projectId/knowledge/search', loadProject, knowledge.searchProjectKnowledge);
router.get('/:projectId/concepts', loadProject, knowledge.listConcepts);
router.get('/:projectId/concepts/:conceptId', loadProject, knowledge.getConcept);

// Tutor
router.post('/:projectId/conversations', loadProject, tutor.createConversation);
router.get('/:projectId/conversations', loadProject, tutor.listConversations);

// Quiz
router.post('/:projectId/quizzes', loadProject, quiz.createQuiz);
router.get('/:projectId/quizzes', loadProject, quiz.listQuizzes);

// Mastery / Growth
router.get('/:projectId/mastery', loadProject, mastery.getMastery);
router.get('/:projectId/mastery/:conceptId', loadProject, mastery.getConceptMastery);
router.get('/:projectId/growth', loadProject, mastery.getProjectGrowth);
router.get('/:projectId/growth/:conceptId', loadProject, mastery.getConceptGrowth);

// Recommendations
router.get('/:projectId/recommendations', loadProject, recommendations.listRecommendations);
router.get('/:projectId/recommendations/latest', loadProject, recommendations.getLatestRecommendation);

// Learning context
router.get('/:projectId/learning-context', loadProject, learningContext.getLearningContext);

// Analytics
router.get('/:projectId/analytics', loadProject, analytics.projectAnalytics);

export default router;
