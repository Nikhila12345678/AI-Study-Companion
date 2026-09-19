import dotenv from 'dotenv';
dotenv.config();

// Fail fast (but clearly) if required config is missing, rather than running insecurely.
const required = ['JWT_SECRET', 'MONGODB_URI'];
const missing = required.filter((key) => !process.env[key]);

if (missing.length && process.env.NODE_ENV !== 'test') {
  // eslint-disable-next-line no-console
  console.error(
    `[config] Missing required environment variables: ${missing.join(', ')}. ` +
      'Copy .env.example to .env and fill these in before starting the server.'
  );
  process.exit(1);
}

export const env = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  mongoUri: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET || 'test-secret-not-for-production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  cookieName: process.env.COOKIE_NAME || 'asc_token',
  aiApiKey: process.env.AI_API_KEY,
  aiModel: process.env.AI_MODEL || 'claude-sonnet-4-6',
  aiMaxTokens: Number(process.env.AI_MAX_TOKENS || 1500),
  ragTopK: Number(process.env.RAG_TOP_K || 6),
  ragMinScore: Number(process.env.RAG_MIN_SCORE || 0.18),
  jobPollIntervalMs: Number(process.env.JOB_POLL_INTERVAL_MS || 2000),
  uploadDir: process.env.UPLOAD_DIR || 'uploads',
  maxUploadMb: Number(process.env.MAX_UPLOAD_MB || 25)
};
