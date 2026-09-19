import { Router } from 'express';
import authRoutes from './authRoutes.js';
import spaceRoutes from './spaceRoutes.js';
import projectRoutes from './projectRoutes.js';
import materialRoutes from './materialRoutes.js';
import conversationRoutes from './conversationRoutes.js';
import quizStandaloneRoutes from './quizStandaloneRoutes.js';
import analyticsRoutes from './analyticsRoutes.js';
import userRoutes from './userRoutes.js';
import adminRoutes from './adminRoutes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/spaces', spaceRoutes);
router.use('/projects', projectRoutes);
router.use('/materials', materialRoutes);
router.use('/conversations', conversationRoutes);
router.use('/quizzes', quizStandaloneRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/users', userRoutes);
router.use('/admin', adminRoutes);

router.get('/health', (req, res) => res.json({ ok: true, service: 'ai-study-companion-api' }));

export default router;
