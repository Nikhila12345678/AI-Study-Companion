import { env } from '../../config/env.js';
import AIUsage from '../../models/AIUsage.js';

/**
 * AIProvider abstracts every AI operation the product needs behind a small
 * interface (generateText, generateStructured, embed, evaluateText) so the
 * underlying model/vendor can change without touching callers. Today it
 * calls the Anthropic Messages API directly via fetch.
 *
 * Every call is timed and logged to AIUsage — AI is treated as an
 * engineering system (latency/tokens/cost/success), not just an API call.
 */

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
// Rough public per-token pricing estimate for cost tracking (USD per token).
// Intentionally approximate — see docs/limitations.md.
const COST_PER_INPUT_TOKEN = 0.000003;
const COST_PER_OUTPUT_TOKEN = 0.000015;

function estimateTokens(text = '') {
  // Cheap, provider-agnostic estimate (~4 chars/token) used only for cost/
  // observability display, not for truncation decisions.
  return Math.ceil((text || '').length / 4);
}

async function logUsage({ userId, projectId, feature, model, latencyMs, input, output, success, errorMessage, retrievalChunkCount }) {
  const inputTokensEst = estimateTokens(input);
  const outputTokensEst = estimateTokens(output);
  try {
    await AIUsage.create({
      userId, projectId, feature, model, latencyMs,
      inputTokensEst, outputTokensEst,
      estimatedCostUsd: Number((inputTokensEst * COST_PER_INPUT_TOKEN + outputTokensEst * COST_PER_OUTPUT_TOKEN).toFixed(6)),
      success, errorMessage: errorMessage || null,
      retrievalChunkCount: retrievalChunkCount ?? null
    });
  } catch {
    // Observability must never break the primary request path.
  }
}

async function callGroq({ system, messages, maxTokens }) {
  if (!env.aiApiKey) {
    const err = new Error('AI provider is not configured (missing AI_API_KEY).');
    err.code = 'AI_NOT_CONFIGURED';
    throw err;
  }

  const res = await fetch(GROQ_URL, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'Authorization': `Bearer ${env.aiApiKey}`
    },
    body: JSON.stringify({
      model: env.aiModel,
      max_tokens: maxTokens || env.aiMaxTokens,
      messages: [
        {
          role: 'system',
          content: system
        },
        ...messages
      ]
    })
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    const err = new Error(
      `AI provider error (${res.status}): ${body.slice(0, 300)}`
    );
    err.code = 'AI_PROVIDER_ERROR';
    throw err;
  }

  const data = await res.json();

  const text = data.choices?.[0]?.message?.content || '';

  return {
    text,
    raw: data
  };
}

/**
 * Free-form text generation (used by the Tutor for the final answer).
 */
export async function generateText({ system, prompt, userId, projectId, feature = 'tutor', maxTokens, retrievalChunkCount }) {
  const started = Date.now();
  try {
    const { text } = await callGroq({ system, messages: [{ role: 'user', content: prompt }], maxTokens });
    await logUsage({
      userId, projectId, feature, model: env.aiModel, latencyMs: Date.now() - started,
      input: system + prompt, output: text, success: true, retrievalChunkCount
    });
    return text;
  } catch (err) {
    await logUsage({
      userId, projectId, feature, model: env.aiModel, latencyMs: Date.now() - started,
      input: system + prompt, output: '', success: false, errorMessage: err.message, retrievalChunkCount
    });
    throw err;
  }
}

/**
 * Structured (JSON) generation with schema validation and one bounded
 * repair retry. Never returns unvalidated data — callers get either a
 * parsed+validated object or a thrown error; malformed AI output is never
 * silently persisted.
 */
export async function generateStructured({ system, prompt, schema, userId, projectId, feature, maxTokens }) {
  const jsonSystem = `${system}\n\nRespond with ONLY valid JSON matching the required shape. No prose, no markdown code fences, no explanation before or after the JSON.`;

  const attempt = async (attemptPrompt) => {
    const started = Date.now();
    let text = '';
    try {
      const result = await callGroq({ system: jsonSystem, messages: [{ role: 'user', content: attemptPrompt }], maxTokens });
      text = result.text;
      const cleaned = text.trim().replace(/^```json\s*/i, '').replace(/^```\s*/, '').replace(/```\s*$/, '');
      const parsed = JSON.parse(cleaned);
      const validated = schema.parse(parsed);
      await logUsage({ userId, projectId, feature, model: env.aiModel, latencyMs: Date.now() - started, input: jsonSystem + attemptPrompt, output: text, success: true });
      return validated;
    } catch (err) {
      await logUsage({ userId, projectId, feature, model: env.aiModel, latencyMs: Date.now() - started, input: jsonSystem + attemptPrompt, output: text, success: false, errorMessage: err.message });
      throw err;
    }
  };

  try {
    return await attempt(prompt);
  } catch (firstErr) {
    // One bounded repair retry: tell the model exactly what was wrong.
    try {
      return await attempt(`${prompt}\n\nYour previous response was invalid (${firstErr.message}). Return ONLY corrected JSON matching the required shape.`);
    } catch (secondErr) {
      const err = new Error(`AI structured output failed validation after retry: ${secondErr.message}`);
      err.code = 'AI_STRUCTURED_INVALID';
      throw err;
    }
  }
}

/**
 * Embeddings. Anthropic does not expose a public embeddings endpoint, and
 * this deployment's network policy does not permit calling a third-party
 * embeddings provider, so we use a deterministic local lexical-hashing
 * embedding (a bag-of-words hashed into a fixed-size vector, L2-normalized)
 * as a practical, dependency-free stand-in. It supports real semantic-ish
 * retrieval for keyword/topic overlap but is weaker than a trained embedding
 * model for paraphrase/synonym matching. The AIProvider interface isolates
 * this choice — swapping in a real embeddings API later is a one-file change.
 * See docs/limitations.md.
 */
const EMBEDDING_DIM = 384;

export async function embed(text) {
  const vec = new Array(EMBEDDING_DIM).fill(0);
  const tokens = (text || '').toLowerCase().match(/[a-z0-9]+/g) || [];
  for (const token of tokens) {
    let hash = 0;
    for (let i = 0; i < token.length; i++) {
      hash = (hash * 31 + token.charCodeAt(i)) >>> 0;
    }
    const idx = hash % EMBEDDING_DIM;
    vec[idx] += 1;
  }
  const norm = Math.sqrt(vec.reduce((s, v) => s + v * v, 0)) || 1;
  return vec.map((v) => v / norm);
}

export function cosineSimilarity(a, b) {
  let dot = 0;
  for (let i = 0; i < a.length; i++) dot += a[i] * b[i];
  return dot; // both vectors are already L2-normalized
}

/**
 * Lightweight rule-based + model-assisted evaluation hook, used by the
 * offline evaluation suite (see docs/evaluation.md) and by AIEvaluation
 * records surfaced in the admin dashboard.
 */
export async function evaluateText({ system, prompt, schema, feature = 'evaluation' }) {
  return generateStructured({ system, prompt, schema, feature });
}

export const AI_CONFIG = { model: env.aiModel };
