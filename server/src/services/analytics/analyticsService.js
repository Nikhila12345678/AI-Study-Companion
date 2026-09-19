import mongoose from 'mongoose';
import LearningEvent from '../../models/LearningEvent.js';
import Assessment from '../../models/Assessment.js';
import ConceptMastery from '../../models/ConceptMastery.js';
import AIUsage from '../../models/AIUsage.js';
import Project from '../../models/Project.js';

const oid = (id) => new mongoose.Types.ObjectId(String(id));

/**
 * All analytics use MongoDB aggregation pipelines rather than loading raw
 * collections into Node — required for reasonable performance as event
 * volume grows, and it's what real "learning analytics" should look like.
 */
export async function getProjectAnalytics(projectId) {
  const [activityByDay, quizPerformance, masterySummary, aiActivity] = await Promise.all([
    LearningEvent.aggregate([
      { $match: { projectId: oid(projectId) } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]),
    Assessment.aggregate([
      { $match: { projectId: oid(projectId) } },
      { $sort: { createdAt: 1 } },
      { $project: { overallScore: 1, createdAt: 1 } }
    ]),
    ConceptMastery.aggregate([
      { $match: { projectId: oid(projectId) } },
      { $project: { conceptName: 1, score: 1, evidenceCount: 1 } },
      { $sort: { score: 1 } }
    ]),
    AIUsage.aggregate([
      { $match: { projectId: oid(projectId) } },
      { $group: { _id: '$feature', count: { $sum: 1 }, avgLatencyMs: { $avg: '$latencyMs' }, totalCostUsd: { $sum: '$estimatedCostUsd' }, failures: { $sum: { $cond: ['$success', 0, 1] } } } }
    ])
  ]);

  return { activityByDay, quizPerformance, masterySummary, aiActivity };
}

export async function getGlobalAnalytics(userId) {
  const projectIds = (await Project.find({ userId }).distinct('_id'));

  const [byProject, activityByDay, overallMastery] = await Promise.all([
    Assessment.aggregate([
      { $match: { userId: oid(userId) } },
      { $group: { _id: '$projectId', avgScore: { $avg: '$overallScore' }, attempts: { $sum: 1 } } }
    ]),
    LearningEvent.aggregate([
      { $match: { userId: oid(userId) } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]),
    ConceptMastery.aggregate([
      { $match: { userId: oid(userId) } },
      { $group: { _id: null, avgScore: { $avg: '$score' }, conceptCount: { $sum: 1 } } }
    ])
  ]);

  return { projectCount: projectIds.length, byProject, activityByDay, overallMastery: overallMastery[0] || { avgScore: 0, conceptCount: 0 } };
}

export async function getAdminOverview() {
  const [userCount, eventVolume, aiUsageSummary, jobFailures] = await Promise.all([
    mongoose.model('User').countDocuments(),
    LearningEvent.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]),
    AIUsage.aggregate([
      { $group: { _id: '$feature', count: { $sum: 1 }, avgLatencyMs: { $avg: '$latencyMs' }, totalCostUsd: { $sum: '$estimatedCostUsd' }, successRate: { $avg: { $cond: ['$success', 1, 0] } } } }
    ]),
    mongoose.model('BackgroundJob').aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ])
  ]);
  return { userCount, eventVolume, aiUsageSummary, jobFailures };
}
