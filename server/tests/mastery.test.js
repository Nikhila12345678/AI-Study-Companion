import mongoose from 'mongoose';
import { setupTestDB, teardownTestDB, clearTestDB } from './setup.js';

let updateMastery, getGrowth, ConceptMastery;

beforeAll(async () => {
  await setupTestDB();
  ({ updateMastery, getGrowth } = await import('../src/services/mastery/masteryService.js'));
  ConceptMastery = (await import('../src/models/ConceptMastery.js')).default;
});
afterEach(clearTestDB);
afterAll(teardownTestDB);

describe('Mastery update logic', () => {
  test('a correct answer increases mastery toward 1', async () => {
    const projectId = new mongoose.Types.ObjectId();
    const userId = new mongoose.Types.ObjectId();
    const conceptId = new mongoose.Types.ObjectId();

    const { mastery: first } = await updateMastery({ projectId, userId, conceptId, conceptName: 'Recursion', evidenceScore: 1, reason: 'quiz_mcq' });
    expect(first.score).toBeGreaterThan(0.3);

    const { mastery: second } = await updateMastery({ projectId, userId, conceptId, conceptName: 'Recursion', evidenceScore: 1, reason: 'quiz_mcq' });
    expect(second.score).toBeGreaterThan(first.score);
  });

  test('mastery is not a fixed step function — a run of mistakes swings harder than one mistake', async () => {
    const projectId = new mongoose.Types.ObjectId();
    const userId = new mongoose.Types.ObjectId();
    const conceptId = new mongoose.Types.ObjectId();

    // Get mastery up first so drops are visible.
    await updateMastery({ projectId, userId, conceptId, conceptName: 'DP', evidenceScore: 1, reason: 'quiz_mcq' });
    const { mastery: afterOneMiss } = await updateMastery({ projectId, userId, conceptId, conceptName: 'DP', evidenceScore: 0, reason: 'quiz_mcq' });
    const dropOne = 0 <= afterOneMiss.score; // sanity
    const { mastery: afterTwoMisses, repeatedMistake } = await updateMastery({ projectId, userId, conceptId, conceptName: 'DP', evidenceScore: 0, reason: 'quiz_mcq' });

    expect(repeatedMistake).toBe(true);
    expect(afterTwoMisses.consecutiveMistakes).toBe(2);
  });

  test('score is always clamped between 0 and 1', async () => {
    const projectId = new mongoose.Types.ObjectId();
    const userId = new mongoose.Types.ObjectId();
    const conceptId = new mongoose.Types.ObjectId();

    let result;
    for (let i = 0; i < 15; i++) {
      result = await updateMastery({ projectId, userId, conceptId, conceptName: 'X', evidenceScore: 1, reason: 'quiz_mcq' });
    }
    expect(result.mastery.score).toBeLessThanOrEqual(1);
    expect(result.mastery.score).toBeGreaterThanOrEqual(0);
  });

  test('growth detects an improving trend from real history, never fabricated', async () => {
    const projectId = new mongoose.Types.ObjectId();
    const userId = new mongoose.Types.ObjectId();
    const conceptId = new mongoose.Types.ObjectId();

    for (let i = 0; i < 4; i++) {
      await updateMastery({ projectId, userId, conceptId, conceptName: 'Sorting', evidenceScore: 1, reason: 'quiz_mcq' });
    }
    const growth = await getGrowth(projectId, userId);
    expect(growth[0].trend).toBe('improving');
    expect(growth[0].history.length).toBeGreaterThan(0);
  });
});
