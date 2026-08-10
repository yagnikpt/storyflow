# start fastapi dev server
backend:
    source .venv/bin/activate && cd ./backend && fastapi dev --host 0.0.0.0

# start vite dev server
frontend:
    bun run dev

# docker build and run
docker_preview:
    docker build -t storyflow .
    docker run -p 8000:8000 --env-file backend/.env storyflow:latest
