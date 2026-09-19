import fs from 'node:fs/promises';
import Material from '../models/Material.js';
import KnowledgeChunk from '../models/KnowledgeChunk.js';
import Concept from '../models/Concept.js';
import { enqueueJob } from '../events/eventBus.js';
import { emitEvent } from '../events/eventBus.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';

export const uploadMaterial = asyncHandler(async (req, res) => {
  if (!req.file) throw ApiError.badRequest('No file uploaded. Attach a PDF.');
  if (req.file.mimetype !== 'application/pdf') {
    await fs.unlink(req.file.path).catch(() => {});
    throw ApiError.badRequest('Only PDF files are supported in this prototype.');
  }

  const material = await Material.create({
    userId: req.user._id,
    projectId: req.project._id,
    fileName: req.file.filename,
    originalName: req.file.originalname,
    filePath: req.file.path,
    fileSizeBytes: req.file.size,
    status: 'QUEUED'
  });

  await emitEvent({ type: 'MATERIAL_UPLOADED', userId: req.user._id, projectId: req.project._id, payload: { materialId: material._id, name: material.originalName } });

  // Processing happens off the request path — the browser never needs to
  // stay open for this to complete.
  await enqueueJob({
    type: 'MATERIAL_PROCESSING',
    payload: { materialId: String(material._id), userId: String(req.user._id), projectId: String(req.project._id) },
    idempotencyKey: `material-processing-${material._id}`,
    userId: req.user._id,
    projectId: req.project._id
  });

  res.status(201).json({ material });
});

export const listMaterials = asyncHandler(async (req, res) => {
  const materials = await Material.find({ projectId: req.project._id }).sort({ createdAt: -1 }).lean();
  res.json({ materials });
});

export const getMaterialStatus = asyncHandler(async (req, res) => {
  const material = await Material.findOne({ _id: req.params.materialId, projectId: req.project._id }).lean();
  if (!material) throw ApiError.notFound('Material not found.');
  res.json({
    status: material.status,
    statusMessage: material.statusMessage,
    failureReason: material.failureReason,
    pageCount: material.pageCount,
    chunkCount: material.chunkCount,
    conceptCount: material.conceptCount
  });
});

export const getMaterial = asyncHandler(async (req, res) => {
  const material = await Material.findOne({ _id: req.params.materialId, projectId: req.project._id }).lean();
  if (!material) throw ApiError.notFound('Material not found.');
  res.json({ material });
});

export const deleteMaterial = asyncHandler(async (req, res) => {
  const material = await Material.findOne({ _id: req.params.materialId, projectId: req.project._id });
  if (!material) throw ApiError.notFound('Material not found.');
  await KnowledgeChunk.deleteMany({ materialId: material._id });
  await Concept.updateMany({ sourceMaterialIds: material._id }, { $pull: { sourceMaterialIds: material._id } });
  await fs.unlink(material.filePath).catch(() => {});
  await material.deleteOne();
  res.json({ ok: true });
});
