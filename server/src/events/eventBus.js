import LearningEvent from '../models/LearningEvent.js';
import BackgroundJob from '../models/BackgroundJob.js';

/**
 * Records a learning event (idempotent on idempotencyKey when provided) and
 * optionally enqueues a background job in reaction to it. This is the single
 * place activity/analytics/admin-visibility data originates from, and the
 * trigger point for downstream learning workflows (see jobs/handlers).
 */
export async function emitEvent({ type, userId, spaceId, projectId, payload = {}, idempotencyKey = null }) {
  try {
    const event = await LearningEvent.create({ type, userId, spaceId, projectId, payload, idempotencyKey });
    return event;
  } catch (err) {
    if (err.code === 11000) return null; // duplicate idempotencyKey — already recorded, safe no-op
    throw err;
  }
}

export async function enqueueJob({ type, payload, idempotencyKey, userId, projectId }) {
  try {
    return await BackgroundJob.create({ type, payload, idempotencyKey, userId, projectId });
  } catch (err) {
    if (err.code === 11000) {
      // Same job already queued/ran — return the existing record instead of duplicating work.
      return BackgroundJob.findOne({ idempotencyKey });
    }
    throw err;
  }
}
