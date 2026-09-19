import ConceptMastery from '../../models/ConceptMastery.js';
import { refreshContextFromMastery } from '../context/contextService.js';

/**
 * Evidence-weighted mastery update. Deliberately NOT a step function
 * (correct -> +fixed, wrong -> -fixed): the adjustment size depends on how
 * confident the evidence is (mcq is binary; open-ended carries a graded
 * score) and on a consecutive-mistake counter that widens the negative
 * adjustment — this is what powers repeated-mistake detection downstream.
 */
const LEARNING_RATE = 0.18;

export async function updateMastery({ projectId, userId, conceptId, conceptName, evidenceScore, reason }) {
  let mastery = await ConceptMastery.findOne({ projectId, conceptId, userId });
  if (!mastery) {
    mastery = await ConceptMastery.create({ projectId, userId, conceptId, conceptName, score: 0.3, evidenceCount: 0 });
  }

  const isMistake = evidenceScore < 0.5;
  const consecutiveMistakes = isMistake ? mastery.consecutiveMistakes + 1 : 0;

  // Wider swing when there's a run of mistakes on the same concept — the
  // system should react more decisively to a real pattern than to noise.
  const mistakePenaltyBoost = isMistake ? 1 + Math.min(consecutiveMistakes - 1, 3) * 0.15 : 1;
  const delta = LEARNING_RATE * (evidenceScore - mastery.score) * mistakePenaltyBoost;
  const newScore = Math.max(0, Math.min(1, mastery.score + delta));

  mastery.history.push({ score: newScore, delta, reason, at: new Date() });
  if (mastery.history.length > 30) mastery.history = mastery.history.slice(-30);
  mastery.score = newScore;
  mastery.evidenceCount += 1;
  mastery.consecutiveMistakes = consecutiveMistakes;
  mastery.lastUpdated = new Date();
  await mastery.save();

  await refreshContextFromMastery(projectId);

  return { mastery, repeatedMistake: consecutiveMistakes >= 2 };
}

export async function getProjectMastery(projectId, userId) {
  return ConceptMastery.find({ projectId, userId }).sort({ score: 1 }).lean();
}

/**
 * Growth = mastery trend derived from real history entries (never
 * fabricated). Buckets each concept into improving / stable / attention
 * based on the delta between its earliest and most recent recent-window
 * scores.
 */
export async function getGrowth(projectId, userId) {
  const masteries = await ConceptMastery.find({ projectId, userId }).lean();
  return masteries.map((m) => {
    const recentHistory = m.history.slice(-6);
    const first = recentHistory[0]?.score ?? m.score;
    const last = recentHistory[recentHistory.length - 1]?.score ?? m.score;
    const change = last - first;
    let trend = 'stable';
    if (recentHistory.length < 2) trend = 'stable';
    else if (change > 0.05) trend = 'improving';
    else if (change < -0.03 || m.consecutiveMistakes >= 2) trend = 'requires_attention';

    return {
      conceptId: m.conceptId,
      conceptName: m.conceptName,
      currentScore: m.score,
      startScore: first,
      change,
      trend,
      history: m.history
    };
  });
}
