# ── Stage 1: Build React frontend ────────────────────────────
FROM oven/bun:1 AS frontend-build

WORKDIR /app

# Copy workspace root files needed for dependency resolution
COPY package.json bun.lock ./
COPY frontend/package.json ./frontend/

# Install dependencies
RUN bun install --frozen-lockfile

# Copy frontend source and build
COPY frontend/ ./frontend/
RUN bun run --filter frontend build


# ── Stage 2: Python backend + built frontend ────────────────
FROM python:3.13-slim AS runtime

WORKDIR /code

RUN apt-get update && \
    apt-get install -y --no-install-recommends ca-certificates && \
    rm -rf /var/lib/apt/lists/*

# Install backend dependencies
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir --upgrade -r requirements.txt

# Copy backend source
COPY backend/app ./app
COPY backend/engine ./engine

ENV STATIC_DIR=/code/static
ENV ENVIRONMENT=production

# Copy built frontend dist from stage 1
COPY --from=frontend-build /app/frontend/dist ./static

EXPOSE 8000

CMD ["sh", "-c", "fastapi run --host 0.0.0.0 --port ${PORT:-8000}"]
