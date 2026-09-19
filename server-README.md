# AI Study Companion — Backend

This is the API server for AI Study Companion. It handles auth, storing and processing uploaded study material, running the tutor/quiz/mastery logic, and exposing the data the frontend renders. Everything is a REST API over Express and MongoDB.

## Overview

The backend is organized around a learning loop: a user creates a Space and a Project, uploads PDF material to it, the material gets processed in the background into searchable chunks and concepts, and from there the user can chat with a tutor (grounded in that material), take quizzes, and see their mastery/growth/recommendations update as they go.

Areas that exist in the code:

- **Auth** — register/login/logout, JWT stored in an httpOnly cookie, bcrypt for password hashing.
- **Spaces & Projects** — CRUD, each scoped to the logged-in user. Every project-level route checks ownership before doing anything else.
- **Materials** — PDF upload (multer), stored on disk, processed asynchronously (text extraction → chunking → embeddings → concept extraction).
- **Knowledge / retrieval** — search over a project's processed chunks, concept listing.
- **Tutor** — conversations and messages, answers are grounded in retrieved chunks and include citations back to the source material/page. If nothing relevant is found, it says so instead of guessing.
- **Quiz** — adaptive question generation (multiple choice + open-ended), answer submission, grading, quiz completion.
- **Mastery & Growth** — a per-concept mastery score that updates from quiz evidence, plus growth trend history derived from that.
- **Recommendations** — a "what to do next" suggestion generated from a user's current mastery/growth state.
- **Analytics** — per-project and account-wide aggregation (activity, quiz performance, mastery, AI usage).
- **Admin** — a separate set of routes (role-gated) for looking at users, activity, AI usage, background jobs, and system health.
- **Background jobs** — a small polling worker that processes material uploads and post-quiz recommendation updates outside the request/response cycle.

## Tech Stack

- Node.js (ESM, `"type": "module"`)
- Express
- MongoDB + Mongoose
- JWT (`jsonwebtoken`) + `bcryptjs` for auth
- `cookie-parser`, `cors`, `morgan`
- `multer` for file uploads
- `pdf-parse` for extracting text from uploaded PDFs
- `zod` for request/schema validation
- Jest + Supertest + `mongodb-memory-server` for testing
- Calls out to the Anthropic API for the AI-generated parts (tutor answers, quiz questions, grading, concept extraction, recommendation phrasing)

## Project Structure

```
server/
  src/
    config/       # env loading, db connection, multer upload config
    models/       # Mongoose schemas
    controllers/  # request handlers — thin, delegate to services
    services/     # the actual logic (ai, rag, document, quiz, mastery, recommendation, analytics, context)
    routes/       # Express routers, one per resource
    middleware/   # auth check, project/space ownership check, validation, error handling
    events/       # records learning events and enqueues background jobs
    jobs/         # background worker + its job handlers
    utils/        # small shared helpers (ApiError, asyncHandler, jwt)
    validators/   # zod schemas per resource
    app.js        # express app setup (middleware, routes mounted)
    server.js     # entry point — connects to the db and starts listening
  tests/          # Jest test suites
  uploads/        # uploaded PDFs land here (gitignored)
```

Short version of what each `services/` subfolder does:

- `ai/` — the actual calls to the LLM provider (text generation, structured/JSON generation with validation + one retry, a local embedding function, usage logging).
- `rag/` — retrieval: scores a project's stored chunks against a query and decides if there's enough evidence to answer.
- `document/` — the PDF processing pipeline: extract text per page, chunk it, embed each chunk, extract and merge concepts.
- `quiz/` — picks which concept/difficulty to test next, generates and grades questions.
- `mastery/` — updates a concept's mastery score from quiz evidence, derives growth trends from that history.
- `recommendation/` — picks the next concept to recommend and generates a short reason.
- `analytics/` — MongoDB aggregation queries for the analytics/admin endpoints.
- `context/` — keeps a small per-project "learning context" record (strengths/weaknesses) updated so it can be pulled into tutor prompts without re-reading full history.

## Environment Variables

Copy `.env.example` to `.env` and fill these in:

```env
# Server
PORT=5000
NODE_ENV=development
CLIENT_ORIGIN=http://localhost:5173

# Database
MONGODB_URI=

# Auth
JWT_SECRET=
JWT_EXPIRES_IN=7d
COOKIE_NAME=asc_token

# AI provider
AI_API_KEY=
AI_MODEL=
AI_MAX_TOKENS=1500

# Retrieval
RAG_TOP_K=6
RAG_MIN_SCORE=0.18

# Background jobs
JOB_POLL_INTERVAL_MS=2000

# File uploads
UPLOAD_DIR=uploads
MAX_UPLOAD_MB=25
```

Notes:
- `MONGODB_URI` and `JWT_SECRET` are required — the server exits on startup with an error message if either is missing (see `src/config/env.js`).
- `AI_API_KEY` is needed for anything that calls the tutor/quiz/concept-extraction/recommendation logic. Without it those calls fail with a clear "AI provider is not configured" error, but the rest of the app (auth, spaces, projects, uploads) still works.
- `CLIENT_ORIGIN` is used for CORS and must match wherever the frontend is actually running.
- `RAG_TOP_K` / `RAG_MIN_SCORE` control how many chunks get retrieved and how similar something has to be before the tutor is willing to answer from it.

## Running Locally

```bash
npm install
npm run dev       # starts the API with --watch on PORT (default 5000)
```

In a second terminal, start the background worker — it's a separate process and material uploads won't get processed without it:

```bash
npm run worker
```

Other scripts:

```bash
npm start   # same as dev, without --watch (for production)
npm test    # runs the Jest suite
```

## API Routes

All routes are mounted under `/api`. Everything except `/auth/register`, `/auth/login`, and `/health` requires the auth cookie; admin routes additionally require `role: 'admin'` on the user.

```
/auth
  POST   /register
  POST   /login
  POST   /logout
  GET    /me

/spaces
  POST   /
  GET    /
  GET    /:spaceId
  PATCH  /:spaceId
  DELETE /:spaceId
  GET    /:spaceId/dashboard
  GET    /:spaceId/activity
  POST   /:spaceId/projects
  GET    /:spaceId/projects

/projects/:projectId
  GET    /
  PATCH  /
  DELETE /
  GET    /dashboard
  GET    /activity
  POST   /materials
  GET    /materials
  GET    /knowledge
  GET    /knowledge/search
  GET    /concepts
  GET    /concepts/:conceptId
  POST   /conversations
  GET    /conversations
  POST   /quizzes
  GET    /quizzes
  GET    /mastery
  GET    /mastery/:conceptId
  GET    /growth
  GET    /growth/:conceptId
  GET    /recommendations
  GET    /recommendations/latest
  GET    /learning-context
  GET    /analytics

/materials/:materialId       # ownership checked via the material itself
  GET    /
  GET    /status
  DELETE /

/conversations/:conversationId
  GET    /
  GET    /messages
  POST   /messages

/quizzes/:quizId
  GET    /
  GET    /questions
  POST   /questions/next
  POST   /questions/:questionId/answer
  POST   /complete

/analytics
  GET    /global

/users
  GET    /me/activity

/admin   (role: admin)
  GET    /users
  GET    /users/:userId
  GET    /spaces
  GET    /projects
  GET    /activity
  GET    /analytics
  GET    /ai-usage
  GET    /ai-evaluations
  GET    /background-jobs
  GET    /system-health
```

## Project Isolation

Every route that takes a `spaceId` or `projectId` goes through `middleware/projectAccess.js`, which loads the resource and checks its `userId` against the logged-in user before the request goes any further. Routes that identify a resource by its own id instead (materials, conversations, quizzes) do the same ownership check inline in their route file. Nothing trusts an id from the client as proof of access on its own.

## Background Jobs

There's no external queue (no Redis/BullMQ) — `src/jobs/worker.js` is a simple loop that polls the `BackgroundJob` collection for queued jobs and runs them. Two job types exist right now:

- `MATERIAL_PROCESSING` — enqueued when a PDF is uploaded, runs the extraction/chunking/embedding/concept-extraction pipeline.
- `LEARNING_WORKFLOW` — enqueued when a quiz is completed, regenerates the project's recommendation.

Jobs are keyed by an `idempotencyKey` so re-enqueuing the same piece of work (e.g. a retried request) doesn't create a duplicate job. Failed jobs retry up to `maxRetries` before being marked `failed` (visible in the admin dashboard).

## Testing

```bash
npm test
```

Uses Jest + Supertest, with `mongodb-memory-server` spinning up an in-memory MongoDB for each test file (see `tests/setup.js`) so tests don't touch a real database. Covers auth, project isolation, mastery/growth calculation, AI structured-output validation, and background job/event idempotency.
