#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
docker compose up -d
cd backend
[ -f .env ] || cp .env.example .env
[ -d .venv ] || python3 -m venv .venv
source .venv/bin/activate
pip install -q -r requirements.txt
python -m app.db.init_db || true
cd "$ROOT/frontend" && npm install
echo "Backend: cd backend && source .venv/bin/activate && uvicorn app.main:app --reload --port 8000"
echo "Frontend: cd frontend && npm run dev"
