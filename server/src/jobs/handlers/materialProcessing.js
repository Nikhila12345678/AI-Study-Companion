import { processMaterial } from '../../services/document/pipeline.js';
import { emitEvent } from '../../events/eventBus.js';

export async function handleMaterialProcessing(job) {
  const { materialId, userId, projectId } = job.payload;
  await emitEvent({ type: 'MATERIAL_PROCESSING_STARTED', userId, projectId, payload: { materialId } });
  try {
    await processMaterial(materialId);
    await emitEvent({ type: 'MATERIAL_PROCESSING_COMPLETED', userId, projectId, payload: { materialId } });
  } catch (err) {
    await emitEvent({ type: 'MATERIAL_PROCESSING_FAILED', userId, projectId, payload: { materialId, error: err.message } });
    throw err;
  }
}
