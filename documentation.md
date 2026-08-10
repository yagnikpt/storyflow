# StoryFlow — Documentation

## Overview

StoryFlow is an AI-powered episodic intelligence engine. Given a raw story idea it:

1. Classifies input (one-liner vs full story)
2. Expands brief ideas into full narratives
3. Plans and scripts 5–8 episodes
4. Scores emotional progression, retention risk, and cliffhanger strength
5. Validates quality with feedback loops
6. Produces prioritized optimization suggestions

Target format: **90-second vertical video** (TikTok, Reels, Shorts).

---

## Architecture

```
React SPA (Vite + TypeScript)
    │ POST /episodic-intelligence/analyze/stream  (SSE)
    ▼
FastAPI  (backend/app/main.py)
    │
    ▼
LangGraph Engine  (backend/engine/graph.py)  — 10 nodes, 2 loops
    │
    ▼
PostgreSQL 17  (pgvector, JSONB payloads)
```

**Key design decisions:**

- **Graph-as-code**: Pipeline is a `StateGraph` — nodes are pure functions, loops via conditional edges.
- **Structured LLM output**: Every LLM call uses `.with_structured_output(PydanticModel)`. No string parsing.
- **Provider-agnostic LLM**: `langchain`'s `init_chat_model("<provider>:<model>")` — swap providers via env vars.
- **Prompts separated**: All templates in `engine/prompts.py`, no prompt strings in node logic.
- **SSE-first, then persist**: Results are streamed to the client; DB write happens after.
- **SPA serving**: In production the backend serves the built React app (`STATIC_DIR` env var).

---

## Configuration

Settings loaded via Pydantic (`backend/app/config.py`) from `.env`:

| Variable              | Default                                                   | Description                                          |
| --------------------- | --------------------------------------------------------- | ---------------------------------------------------- |
| `DATABASE_URL`        | `postgresql://postgres:postgres@localhost:5432/storyflow` | PostgreSQL connection string                         |
| `AI_PROVIDER`         | _(required)_                                              | LangChain provider ID (`google_genai`, `openai`, …)  |
| `AI_PROVIDER_API_KEY` | _(required)_                                              | API key for the provider                             |
| `AI_MODEL`            | _(required)_                                              | Model name (`gemini-3.5-flash-lite`, `gpt-4o`, …)    |
| `STATIC_DIR`          | `""`                                                      | Path to built frontend; enables SPA serving when set |

`sync_database_url` auto-converts `postgresql://` → `postgresql+psycopg2://` for SQLAlchemy/Alembic.

---

## AI Pipeline

### Flow

```
START → [A0] Input Classifier
              │
         one-liner → [A1] Story Expander ⇄ [A2] Story Validator  (retry ≤3×, score < 8)
              │                      (score ≥ 8)
              ↓  ←───────────────────────────────────────────────────────────────────────┐
         [A3] Episode Planner                                                             │
              ↓                                                                           │
         [A4] Episode Scripter                                                            │
              ↓                                                                           │
         [A5] Emotional Arc ─┐  (parallel)                                               │
         [A6] Cliffhanger  ──┤                                                           │
                             ↓                                                           │
                    [A7] Retention Risk                                                   │
                             ↓                                                           │
                    [A8] Final Validator ── fail (avg < 7, revisions left) ──────────────┘
                             │ pass
                             ↓
                        [Optimizer] → END
```

- **A5 + A6** run in parallel (fan-out from A4, fan-in to A7).
- **Story loop** (A1↔A2): max 3 retries, controlled by `_should_retry_story()` in `graph.py`.
- **Pipeline loop** (A3→A8): max `max_revisions` retries, controlled by `_should_replan()` in `graph.py`.

### Nodes

| ID  | Node             | File                                   | Notes                                               |
| --- | ---------------- | -------------------------------------- | --------------------------------------------------- |
| A0  | Input Classifier | `nodes/input_classifier.py`            | One-liner vs story                                  |
| A1  | Story Expander   | `nodes/story_expander.py`              | 300–600 word narrative; uses literary context files |
| A2  | Story Validator  | `nodes/input_classifier.py`            | Score ≥ 8 passes                                    |
| A3  | Episode Planner  | `nodes/episode_planner.py`             | 5–8 episodes; accepts replan feedback               |
| A4  | Episode Scripter | `nodes/episode_scripter.py`            | ~225-word script per episode                        |
| A5  | Emotional Arc    | `nodes/emotional_arc_scorer.py`        | Per-episode emotion beats + coherence               |
| A6  | Cliffhanger      | `nodes/cliffhanger_strength_scorer.py` | Score 1–10 with curiosity/stakes/emotion breakdown  |
| A7  | Retention Risk   | `nodes/retention_risk_analyzer.py`     | Drop-off risk by zone (0–30s, 30–60s, 60–90s)       |
| A8  | Final Validator  | `nodes/final_validator.py`             | Avg score ≥ 7 passes; triggers replan otherwise     |
| —   | Optimizer        | `nodes/optimizer.py`                   | Advisory suggestions only, no feedback loop         |

### LLM Factory

`backend/engine/llm.py` — uses `langchain.init_chat_model(f"{AI_PROVIDER}:{AI_MODEL}")` with the API key from `AI_PROVIDER_API_KEY`. Temperature = 0 (deterministic). All nodes also do a `None` guard on upstream state before invoking the model to prevent cascading failures.

---

## API Reference

Base URL: `http://localhost:8000` · Docs: `/docs`

### `GET /health`

Returns `{"status": "ok"}`.

### `POST /episodic-intelligence/analyze`

Synchronous. Blocks until the pipeline completes (1–3 min). Returns full `AnalyzeResponse`.

### `POST /episodic-intelligence/analyze/stream`

SSE streaming. Same request body. Emits:

| Event      | Payload                                              |
| ---------- | ---------------------------------------------------- |
| `progress` | `{"node": "<name>", "status": "started\|completed"}` |
| `complete` | Full `AnalyzeResponse` JSON                          |
| `error`    | `{"detail": "<message>"}`                            |

**Request body:**

| Field                      | Type   | Default                        |
| -------------------------- | ------ | ------------------------------ |
| `story_idea`               | string | _(required)_                   |
| `genre`                    | string | `""`                           |
| `target_audience`          | string | `"18-30 mobile-first viewers"` |
| `tone`                     | string | `""`                           |
| `episode_count_preference` | int    | `6` (range 5–8)                |
| `max_revisions`            | int    | `2` (range 1–5)                |

---

## Data Models

All defined in `backend/engine/state.py`. Key models:

| Model                 | Purpose                                                |
| --------------------- | ------------------------------------------------------ |
| `EpisodeEngineState`  | Central TypedDict passed through all nodes (16 fields) |
| `InputClassification` | A0 output                                              |
| `ExpandedStory`       | A1 output — title, characters, setting, narrative      |
| `StoryValidation`     | A2 output — score, pass flag, feedback                 |
| `EpisodePlanner`      | A3 output — collection of `PlannedEpisode`             |
| `EpisodeScripts`      | A4 output — collection of `EpisodeScript`              |
| `EmotionalArc`        | A5 output — per-episode `EpisodeEmotionProfile`        |
| `CliffhangerAnalysis` | A6 output — per-episode `CliffhangerScore`             |
| `RetentionAnalysis`   | A7 output — per-episode `EpisodeRetentionRisk`         |
| `FinalValidation`     | A8 output — pass/fail + feedback for replanning        |
| `OptimizationReport`  | Optimizer output — prioritized `Suggestion` list       |

---

## Database

- **PostgreSQL 17** with pgvector · default DB: `storyflow` · port `5432`
- ORM: SQLAlchemy + psycopg2 · migrations: Alembic

### `analysis_runs` table

| Column             | Type           | Notes              |
| ------------------ | -------------- | ------------------ |
| `id`               | UUID           | PK, auto-generated |
| `story_idea`       | Text           |                    |
| `request_payload`  | JSONB          | Full request body  |
| `response_payload` | JSONB          | Full response body |
| `created_at`       | DateTime (UTC) |                    |

**Migration commands:**

```bash
make backend-migrate                           # apply
make backend-migration msg="describe change"   # create new
```

---

## Deployment

### Fly.io

App: `storyflow` · Region: `sin` (Singapore) · 1 shared CPU · 256 MB RAM  
Auto-deploys on push to `main` via `.github/workflows/fly-deploy.yml`.

```bash
flyctl secrets set \
  DATABASE_URL=postgresql://... \
  AI_PROVIDER=google_genai \
  AI_PROVIDER_API_KEY=your-key \
  AI_MODEL=gemini-3.5-flash
```

### Docker

Multi-stage `Dockerfile`: Node 20 builds the React frontend → Python 3.13 runtime installs backend + copies `frontend/dist` into `/code/static`. `STATIC_DIR=/code/static` is set automatically.

```bash
just docker_preview
# or: make docker-build && docker run -p 8000:8000 --env-file backend/.env storyflow
```

---

## Dev Commands

### Justfile

| Target           | Description                           |
| ---------------- | ------------------------------------- |
| `backend`        | Activate `.venv` + FastAPI dev server |
| `frontend`       | `bun run dev`                         |
| `docker_preview` | Build image + run with `backend/.env` |
