# Finance Tool Pilot

Full-stack **personal finance** manager: accounts, income/expense transactions, categories, budgets, and dashboard summaries.

[![Open in Codespaces](https://img.shields.io/badge/Open%20in-GitHub%20Codespaces-blue?logo=github)](https://codespaces.new/Invenitur42/Finance_tool_pilot)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688)](https://fastapi.tiangolo.com/)
[![Next.js](https://img.shields.io/badge/Frontend-Next.js%2015-black)](https://nextjs.org/)

> **Live demo:** _Add Vercel + API URLs after deploy_

---

## About this project

Built to demonstrate **careful domain modeling** in a full-stack app:

- Money stored as **Decimal**, not float
- Transactions update account balances consistently
- Monthly income/expense summary for the dashboard
- Seeded system categories + user-scoped data

**Why it matters for hiring:** Finance UIs are common in product companies; this shows you respect correctness (balances, categories, time windows).

---

## Features

- JWT auth
- Accounts (checking, savings, cash, credit)
- Transactions (income / expense) with categories
- Dashboard: total balance, month income, month expense
- Budget endpoints
- Docker Compose (Postgres on port **5433** to avoid clashes)

---

## Tech stack

| Layer | Tech |
|-------|------|
| Frontend | Next.js 15, TypeScript, Tailwind |
| Backend | FastAPI, SQLAlchemy, JWT |
| DB | PostgreSQL |

---

## Run locally

```bash
git clone https://github.com/Invenitur42/Finance_tool_pilot.git
cd Finance_tool_pilot
docker compose up -d

cd backend && cp .env.example .env
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python -m app.db.init_db
uvicorn app.main:app --reload --port 8000

# new terminal
cd frontend && npm install && npm run dev
```

| Service | URL |
|---------|-----|
| UI | http://localhost:3000 |
| API docs | http://localhost:8000/docs |

**Or:** **Code → Codespaces** on GitHub.

---

## Interview talking points

1. **Why Decimal for money** — floats cause rounding bugs.
2. **Balance updates** on each transaction — consistency vs eventual ledger tables.
3. **Month boundaries** for reports (`occurred_on >= first of month`).
4. **Category kinds** (income vs expense) keep the UI honest.
5. **Next** — charts, CSV export, multi-currency, shared households.

---

## Deploy

- Frontend → Vercel (`frontend/`)
- Backend → Railway/Render + managed Postgres
- Set `DATABASE_URL`, `SECRET_KEY`

---

## Screenshots

_Add: summary cards, accounts list, transactions table._

---

Portfolio hub: [ai-tools-portfolio](https://github.com/Invenitur42/ai-tools-portfolio)
