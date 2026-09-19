import Recommendation from '../../models/Recommendation.js';
import ConceptMastery from '../../models/ConceptMastery.js';
import { getGrowth } from '../mastery/masteryService.js';
import { generateText } from '../ai/provider.js';

/**
 * Produces one prioritized "next best action" grounded in real mastery/
 * growth/mistake state — never fabricated. Rule-based selection of WHAT to
 * recommend (deterministic, testable), then a short AI-written HOW/WHY
 * (natural phrasing) layered on top.
 */
export async function generateRecommendation({ project, user }) {
  const masteries = await ConceptMastery.find({ projectId: project._id, userId: user._id }).sort({ score: 1 }).lean();
  if (masteries.length === 0) {
    return Recommendation.create({
      projectId: project._id, userId: user._id,
      title: 'Upload your first material',
      reason: 'Add a PDF so the Tutor and quizzes have something to ground answers in.',
      priority: 'high', actionType: 'review_material'
    });
  }

  const growth = await getGrowth(project._id, user._id);

const attention = growth
  .filter((g) => g.trend === 'requires_attention')
  .sort((a, b) => a.currentScore - b.currentScore);

// Look at recently recommended concepts so we don't keep
// recommending the same concept again and again.
const recentRecommendations = await Recommendation.find({
  projectId: project._id,
  userId: user._id
})
  .sort({ _id: -1 })
  .limit(3)
  .lean();

const recentlyRecommendedIds = new Set(
  recentRecommendations
    .filter((r) => r.conceptId)
    .map((r) => String(r.conceptId))
);

// Repeated mistakes should override the recent-recommendation rule.
const repeatedMistake = masteries.find(
  (m) => m.consecutiveMistakes >= 2
);

const availableMasteries = masteries.filter(
  (m) => !recentlyRecommendedIds.has(String(m.conceptId))
);

const availableAttention = attention.filter(
  (g) => !recentlyRecommendedIds.has(String(g.conceptId))
);

const weakest =
  availableMasteries[0] || masteries[0];

  console.log(
  '[recommendation debug]',
  masteries.map((m) => ({
    concept: m.conceptName,
    score: m.score,
    mistakes: m.consecutiveMistakes,
    evidence: m.evidenceCount
  }))
);

console.log(
  '[recent recommendations]',
  recentRecommendations.map((r) => ({
    concept: r.conceptName,
    conceptId: String(r.conceptId)
  }))
);

const target =
  repeatedMistake ||
  availableAttention[0] ||
  weakest;
  let priority = repeatedMistake ? 'high' : attention.length ? 'high' : 'medium';
  let actionType = 'take_quiz';
  let reasonFacts = repeatedMistake
    ? `Repeated mistakes on ${target.conceptName}`
    : attention.length
      ? `${target.conceptName} is trending down`
      : `${target.conceptName} is your lowest-mastery concept (${Math.round(target.score * 100)}%)`;

  let title = `Review ${target.conceptName} and take a short quiz`;
  let reason = `${reasonFacts}. A focused quiz will give clearer evidence of where the gap is.`;

  try {
    const written = await generateText({
      system: 'Write one short, specific, encouraging sentence recommending a learner\'s next study action. Do not invent facts beyond what is given.',
      prompt: `Concept: ${target.conceptName}. Current mastery: ${Math.round(target.score * 100)}%. Situation: ${reasonFacts}. Write the recommendation sentence only.`,
      userId: user._id, projectId: project._id, feature: 'recommendation'
    });
    if (written?.trim()) reason = written.trim();
  } catch {
    // Fall back to the deterministic reason text above if AI phrasing fails.
  }

  await Recommendation.updateMany({ projectId: project._id, userId: user._id, status: 'active' }, { status: 'dismissed' });

  return Recommendation.create({
    projectId: project._id, userId: user._id, title, reason,
    conceptId: target.conceptId, conceptName: target.conceptName,
    priority, actionType
  });
}
