import Project from '../../models/Project.js';
import User from '../../models/User.js';
import { generateRecommendation } from '../../services/recommendation/recommendationService.js';
import { emitEvent } from '../../events/eventBus.js';

/**
 * Reacts to a completed quiz: mastery was already updated per-answer (so the
 * user sees immediate feedback), so this workflow's job is the slower
 * downstream step — regenerating the project's "next best action" from the
 * now-current mastery/growth state, and surfacing a repeated-mistake insight
 * as its own event for analytics/admin visibility.
 */
export async function handleLearningWorkflow(job) {
  const { projectId, userId, repeatedMistakeConceptName } = job.payload;
  const project = await Project.findById(projectId);
  const user = await User.findById(userId);
  if (!project || !user) return;

  if (repeatedMistakeConceptName) {
    await emitEvent({
      type: 'REPEATED_MISTAKE_DETECTED', userId, projectId,
      payload: { conceptName: repeatedMistakeConceptName }
    });
  }

  const recommendation = await generateRecommendation({ project, user });
  await emitEvent({ type: 'RECOMMENDATION_GENERATED', userId, projectId, payload: { recommendationId: recommendation._id } });
}
