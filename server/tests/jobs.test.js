import mongoose from 'mongoose';
import { setupTestDB, teardownTestDB, clearTestDB } from './setup.js';

let enqueueJob, emitEvent, BackgroundJob, LearningEvent;

beforeAll(async () => {
  await setupTestDB();
  ({ enqueueJob, emitEvent } = await import('../src/events/eventBus.js'));
  BackgroundJob = (await import('../src/models/BackgroundJob.js')).default;
  LearningEvent = (await import('../src/models/LearningEvent.js')).default;
});
afterEach(clearTestDB);
afterAll(teardownTestDB);

describe('Background job & event idempotency', () => {
  test('enqueueing the same job twice with the same idempotencyKey does not duplicate it', async () => {
    const payload = { materialId: 'm1' };
    await enqueueJob({ type: 'MATERIAL_PROCESSING', payload, idempotencyKey: 'material-processing-m1' });
    await enqueueJob({ type: 'MATERIAL_PROCESSING', payload, idempotencyKey: 'material-processing-m1' });

    const count = await BackgroundJob.countDocuments({ idempotencyKey: 'material-processing-m1' });
    expect(count).toBe(1);
  });

  test('two different idempotency keys create two jobs', async () => {
    await enqueueJob({ type: 'MATERIAL_PROCESSING', payload: {}, idempotencyKey: 'job-a' });
    await enqueueJob({ type: 'MATERIAL_PROCESSING', payload: {}, idempotencyKey: 'job-b' });
    const count = await BackgroundJob.countDocuments();
    expect(count).toBe(2);
  });

  test('emitting an event with a duplicate idempotencyKey is a safe no-op, not an error', async () => {
    const userId = new mongoose.Types.ObjectId();
    const first = await emitEvent({ type: 'QUIZ_COMPLETED', userId, payload: {}, idempotencyKey: 'quiz-complete-1' });
    const second = await emitEvent({ type: 'QUIZ_COMPLETED', userId, payload: {}, idempotencyKey: 'quiz-complete-1' });
    expect(first).not.toBeNull();
    expect(second).toBeNull();
    const count = await LearningEvent.countDocuments({ idempotencyKey: 'quiz-complete-1' });
    expect(count).toBe(1);
  });
});
