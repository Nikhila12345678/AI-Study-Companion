import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import * as materials from '../controllers/materialsController.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import Material from '../models/Material.js';
import { ApiError } from '../utils/ApiError.js';

const router = Router();
router.use(requireAuth);

// Standalone /api/materials/:materialId routes still verify ownership via
// the material's own projectId->userId chain (not a project route param),
// since the PRD's API contract addresses materials directly here.
const loadOwnedMaterial = asyncHandler(async (req, res, next) => {
  const material = await Material.findById(req.params.materialId);
  if (!material) throw ApiError.notFound('Material not found.');
  if (String(material.userId) !== String(req.user._id)) throw ApiError.forbidden('You do not have access to this material.');
  req.project = { _id: material.projectId };
  req.params.projectId = String(material.projectId);
  next();
});

router.get('/:materialId', loadOwnedMaterial, materials.getMaterial);
router.get('/:materialId/status', loadOwnedMaterial, materials.getMaterialStatus);
router.delete('/:materialId', loadOwnedMaterial, materials.deleteMaterial);

export default router;
