import User from '../models/User.js';
import Space from '../models/Space.js';
import Project from '../models/Project.js';
import LearningEvent from '../models/LearningEvent.js';
import Assessment from '../models/Assessment.js';
import AIUsage from '../models/AIUsage.js';
import AIEvaluation from '../models/AIEvaluation.js';
import BackgroundJob from '../models/BackgroundJob.js';
import ConceptMastery from '../models/ConceptMastery.js';
import { getAdminOverview } from '../services/analytics/analyticsService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';

export const listUsers = asyncHandler(async (req, res) => {
  const users = await User.find().sort({ createdAt: -1 }).select('-passwordHash').lean();
  res.json({ users });
});

export const getUserJourney = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.userId).select('-passwordHash').lean();
  if (!user) throw ApiError.notFound('User not found.');
  const [projects, activity, assessments, aiUsage] = await Promise.all([
    Project.find({ userId: user._id }).lean(),
    LearningEvent.find({ userId: user._id }).sort({ createdAt: -1 }).limit(30).lean(),
    Assessment.find({ userId: user._id }).sort({ createdAt: -1 }).limit(20).lean(),
    AIUsage.find({ userId: user._id }).sort({ createdAt: -1 }).limit(30).lean()
  ]);
  const masterySummary = await ConceptMastery.aggregate([
    { $match: { userId: user._id } },
    { $group: { _id: null, avgScore: { $avg: '$score' }, conceptCount: { $sum: 1 } } }
  ]);
  res.json({ user, projects, activity, assessments, aiUsage, masterySummary: masterySummary[0] || { avgScore: 0, conceptCount: 0 } });
});

export const listSpacesAdmin = asyncHandler(async (req, res) => {
  const spaces = await Space.find().sort({ createdAt: -1 }).limit(200).lean();
  res.json({ spaces });
});

export const listProjectsAdmin = asyncHandler(async (req, res) => {
  const projects = await Project.find().sort({ createdAt: -1 }).limit(200).lean();
  res.json({ projects });
});

export const listActivityAdmin = asyncHandler(async (req, res) => {
  const { userId, spaceId, projectId, type, from, to } = req.query;
  const filter = {};
  if (userId) filter.userId = userId;
  if (spaceId) filter.spaceId = spaceId;
  if (projectId) filter.projectId = projectId;
  if (type) filter.type = type;
  if (from || to) filter.createdAt = { ...(from && { $gte: new Date(from) }), ...(to && { $lte: new Date(to) }) };
  const events = await LearningEvent.find(filter).sort({ createdAt: -1 }).limit(200).lean();
  res.json({ events });
});

export const adminAnalytics = asyncHandler(async (req, res) => {
  const overview = await getAdminOverview();
  res.json({ overview });
});

export const adminAiUsage = asyncHandler(async (req, res) => {
  const recent = await AIUsage.find().sort({ createdAt: -1 }).limit(100).lean();
  res.json({ recent });
});

export const adminAiEvaluations = asyncHandler(async (req, res) => {
  const evaluations = await AIEvaluation.find().sort({ runAt: -1 }).limit(100).lean();
  res.json({ evaluations });
});

export const adminBackgroundJobs = asyncHandler(async (req, res) => {
  const jobs = await BackgroundJob.find().sort({ createdAt: -1 }).limit(100).lean();
  res.json({ jobs });
});

export const adminSystemHealth = asyncHandler(async (req, res) => {
  const [queuedJobs, failedJobs, aiFailureRate, dbOk] = await Promise.all([
    BackgroundJob.countDocuments({ status: 'queued' }),
    BackgroundJob.countDocuments({ status: 'failed' }),
    AIUsage.aggregate([
      { $sort: { createdAt: -1 } }, { $limit: 200 },
      { $group: { _id: null, failureRate: { $avg: { $cond: ['$success', 0, 1] } } } }
    ]),
    User.findOne().select('_id').lean().then(() => true).catch(() => false)
  ]);
  res.json({
    dbOk,
    backgroundJobs: { queued: queuedJobs, failed: failedJobs },
    aiFailureRate: aiFailureRate[0]?.failureRate || 0,
    checkedAt: new Date()
  });
});
