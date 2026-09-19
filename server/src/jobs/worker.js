import { connectDB } from '../config/db.js';
import { env } from '../config/env.js';
import BackgroundJob from '../models/BackgroundJob.js';
import { handleMaterialProcessing } from './handlers/materialProcessing.js';
import { handleLearningWorkflow } from './handlers/learningWorkflow.js';

const HANDLERS = {
  MATERIAL_PROCESSING: handleMaterialProcessing,
  LEARNING_WORKFLOW: handleLearningWorkflow
};

/**
 * A simple, dependency-free background worker: polls for queued jobs and
 * runs them with retry/failure tracking. This is an intentional trade for a
 * 3-4 day prototype instead of standing up Redis/BullMQ — see
 * docs/architecture.md for the reasoning and the upgrade path.
 */
async function claimNextJob() {
  return BackgroundJob.findOneAndUpdate(
    { status: 'queued' },
    { status: 'processing', startedAt: new Date() },
    { sort: { createdAt: 1 }, new: true }
  );
}

export async function runOnce() {
  const job = await claimNextJob();
  if (!job) return false;

  const handler = HANDLERS[job.type];
  try {
    if (!handler) throw new Error(`No handler registered for job type ${job.type}`);
    await handler(job);
    job.status = 'completed';
    job.completedAt = new Date();
    await job.save();
  } catch (err) {
    job.retryCount += 1;
    job.error = err.message;
    if (job.retryCount >= job.maxRetries) {
      job.status = 'failed';
    } else {
      job.status = 'queued'; // will be retried on a future poll
    }
    await job.save();
    // eslint-disable-next-line no-console
    console.error(`[worker] job ${job._id} (${job.type}) failed:`, err.message);
  }
  return true;
}

async function loop() {
  // Drain any currently-queued jobs, then wait before polling again.
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const didWork = await runOnce();
    if (!didWork) await new Promise((r) => setTimeout(r, env.jobPollIntervalMs));
  }
}

if (process.argv[1]?.endsWith('worker.js')) {
  connectDB().then(() => {
    // eslint-disable-next-line no-console
    console.log('[worker] started, polling for jobs every', env.jobPollIntervalMs, 'ms');
    loop();
  });
}
