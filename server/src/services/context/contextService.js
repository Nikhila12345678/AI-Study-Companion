import LearningContext from '../../models/LearningContext.js';
import ConceptMastery from '../../models/ConceptMastery.js';

/**
 * Returns (creating if needed) the condensed learning-context record for a
 * project. This is deliberately small: strengths/weaknesses/repeated-mistake
 * concepts, not a transcript. Callers compose only what's relevant to the
 * current task instead of replaying full history into every AI prompt.
 */
export async function getComposedContext(projectId) {
  let ctx = await LearningContext.findOne({ projectId });
  if (!ctx) {
    ctx = await LearningContext.create({ projectId, userId: null });
  }
  return ctx;
}

export async function ensureContextForProject(projectId, userId, goal) {
  let ctx = await LearningContext.findOne({ projectId });
  if (!ctx) {
    ctx = await LearningContext.create({ projectId, userId, goal: goal || '' });
  }
  return ctx;
}

/**
 * Recomputes strengths/weaknesses from current mastery scores. Called after
 * mastery updates rather than on every read, keeping this cheap and current.
 */
export async function refreshContextFromMastery(projectId) {
  const masteries = await ConceptMastery.find({ projectId }).sort({ score: -1 }).lean();
  const strengths = masteries.filter((m) => m.score >= 0.75).map((m) => m.conceptName).slice(0, 5);
  const weaknesses = masteries.filter((m) => m.score < 0.5).map((m) => m.conceptName).slice(0, 5);
  const repeatedMistakeConcepts = masteries.filter((m) => m.consecutiveMistakes >= 2).map((m) => m.conceptName);

  await LearningContext.findOneAndUpdate(
    { projectId },
    { strengths, weaknesses, repeatedMistakeConcepts },
    { upsert: true, setDefaultsOnInsert: true }
  );
}
