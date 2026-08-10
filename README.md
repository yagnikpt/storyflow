# StoryFlow

AI-powered engine that turns a raw story idea into optimized multi-episode arcs for 90-second vertical video (TikTok / Reels / Shorts).

## Stack

**Backend:** FastAPI · LangGraph · LangChain · PostgreSQL · `uv`  
**Frontend:** React · Vite · TypeScript · Tailwind CSS · `bun`  
**LLM:** Any LangChain-supported provider (default: Google Gemini 3.5 Flash Lite)  
**Deploy:** Fly.io · GitHub Actions

## Quick Start

### 1. Start the database

```bash
make docker-up
```

### 2. Configure env

```bash
cp backend/.env.example backend/.env
```

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/storyflow
AI_PROVIDER=google_genai
AI_PROVIDER_API_KEY=your-api-key
AI_MODEL=gemini-2.5-flash
```

### 3. Backend

```bash
uv sync
just backend    # http://localhost:8000
```

### 4. Frontend

```bash
cd frontend && bun install
just frontend   # http://localhost:5173
```

## API

**Docs:** `http://localhost:8000/docs`

| Endpoint                                     | Description                                                  |
| -------------------------------------------- | ------------------------------------------------------------ |
| `GET /health`                                | Liveness probe                                               |
| `POST /episodic-intelligence/analyze`        | Synchronous — blocks 1–3 min, returns full result            |
| `POST /episodic-intelligence/analyze/stream` | SSE streaming — emits `progress`, `complete`, `error` events |

**Minimal request body:**

```json
{
  "story_idea": "A broke delivery rider finds clues to a missing-person case.",
  "genre": "thriller",
  "tone": "tense",
  "episode_count_preference": 6,
  "max_revisions": 2
}
```

## Deployment

### Fly.io

```bash
flyctl secrets set \
  DATABASE_URL=postgresql://... \
  AI_PROVIDER=google_genai \
  AI_PROVIDER_API_KEY=your-key \
  AI_MODEL=gemini-2.5-flash

git push origin main   # GitHub Actions auto-deploys
```

Config: `fly.toml` — app `storyflow`, region `sin`, 1 shared CPU, 256 MB RAM.

### Docker

```bash
just docker_preview
# or
make docker-build
docker run -p 8000:8000 --env-file backend/.env storyflow
```

## Docs

For pipeline internals, node details, data models, and configuration reference — see [`documentation.md`](./documentation.md).
