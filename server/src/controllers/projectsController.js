import Project from '../models/Project.js';
import Material from '../models/Material.js';
import Concept from '../models/Concept.js';
import LearningEvent from '../models/LearningEvent.js';
import Recommendation from '../models/Recommendation.js';
import { getProjectMastery } from '../services/mastery/masteryService.js';
import { ensureContextForProject } from '../services/context/contextService.js';
import { emitEvent } from '../events/eventBus.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const createProject = asyncHandler(async (req, res) => {
  const project = await Project.create({ ...req.body, spaceId: req.space._id, userId: req.user._id });
  await ensureContextForProject(project._id, req.user._id, project.learningGoal);
  await emitEvent({ type: 'PROJECT_CREATED', userId: req.user._id, spaceId: req.space._id, projectId: project._id, payload: { name: project.name } });
  res.status(201).json({ project });
});

export const listProjectsInSpace = asyncHandler(async (req, res) => {
  const projects = await Project.find({ spaceId: req.space._id }).sort({ updatedAt: -1 }).lean();
  res.json({ projects });
});

export const getProject = asyncHandler(async (req, res) => {
  res.json({ project: req.project });
});

export const updateProject = asyncHandler(async (req, res) => {
  Object.assign(req.project, req.body);
  await req.project.save();
  res.json({ project: req.project });
});

export const deleteProject = asyncHandler(async (req, res) => {
  await req.project.deleteOne();
  res.json({ ok: true });
});

export const getProjectDashboard = asyncHandler(async (req, res) => {
  const projectId = req.project._id;
  const [materials, concepts, mastery, recentActivity, recommendation] = await Promise.all([
    Material.find({ projectId }).sort({ createdAt: -1 }).limit(5).lean(),
    Concept.countDocuments({ projectId }),
    getProjectMastery(projectId, req.user._id),
    LearningEvent.find({ projectId }).sort({ createdAt: -1 }).limit(10).lean(),
    Recommendation.findOne({ projectId, userId: req.user._id, status: 'active' }).sort({ createdAt: -1 }).lean()
  ]);

  const overallProgress = mastery.length ? mastery.reduce((s, m) => s + m.score, 0) / mastery.length : 0;
  const importantConcepts = [...mastery].sort((a, b) => a.score - b.score).slice(0, 5);

  res.json({
    project: req.project,
    overallProgress,
    materials,
    conceptCount: concepts,
    importantConcepts,
    recentActivity,
    recommendation
  });
});

export const listUserActivity = asyncHandler(async (req, res) => {
  const events = await LearningEvent.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(50).lean();
  res.json({ events });
});
