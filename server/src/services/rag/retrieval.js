import KnowledgeChunk from '../../models/KnowledgeChunk.js';
import { embed, cosineSimilarity } from '../ai/provider.js';
import { env } from '../../config/env.js';

/**
 * Semantic retrieval, always filtered by projectId. This is the single
 * chokepoint that guarantees a document from Project A can never surface in
 * Project B's Tutor response — every caller goes through here.
 */
export async function retrieveRelevantChunks({ projectId, query, topK = env.ragTopK }) {
  const queryEmbedding = await embed(query);

  // Prototype-scale approach: score all of this project's chunks in Node.
  // For larger corpora this is where Atlas Vector Search's $vectorSearch
  // stage would replace the in-memory scan — see docs/limitations.md.
  const chunks = await KnowledgeChunk.find({ projectId }).lean();
  const scored = chunks
    .map((chunk) => ({ chunk, score: cosineSimilarity(queryEmbedding, chunk.embedding) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);

  return scored;
}

export function hasEnoughEvidence(scoredChunks) {
  if (scoredChunks.length === 0) return false;
  return scoredChunks.some((s) => s.score >= env.ragMinScore);
}
