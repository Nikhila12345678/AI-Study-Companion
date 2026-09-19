import Concept from '../models/Concept.js';
import KnowledgeChunk from '../models/KnowledgeChunk.js';
import { retrieveRelevantChunks } from '../services/rag/retrieval.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';

export const getProjectKnowledge = asyncHandler(async (req, res) => {
  const concepts = await Concept.find({ projectId: req.project._id }).sort({ importance: -1, name: 1 }).lean();
  const chunkCount = await KnowledgeChunk.countDocuments({ projectId: req.project._id });
  res.json({ concepts, chunkCount });
});

export const searchProjectKnowledge = asyncHandler(async (req, res) => {
  const { q } = req.query;
  if (!q) throw ApiError.badRequest('Provide a search query as ?q=');
  const results = await retrieveRelevantChunks({ projectId: req.project._id, query: q, topK: 8 });
  res.json({
    results: results.map((r) => ({
      score: r.score, materialName: r.chunk.materialName, page: r.chunk.pageNumber, text: r.chunk.text
    }))
  });
});

export const listConcepts = asyncHandler(async (req, res) => {
  const concepts = await Concept.find({ projectId: req.project._id }).sort({ name: 1 }).lean();
  res.json({ concepts });
});

export const getConcept = asyncHandler(async (req, res) => {
  const concept = await Concept.findOne({ _id: req.params.conceptId, projectId: req.project._id }).lean();
  if (!concept) throw ApiError.notFound('Concept not found.');
  res.json({ concept });
});
