# Personal Finance Manager

A full-stack **personal finance** application for tracking income, expenses, budgets, and insights.

Built for mid-level full-stack developer interviews. Covers classic product requirements: accounts, transactions, categories, budgets, and summary dashboards with charts.

---

## Features

- [x] User authentication (JWT)
- [x] Accounts (checking, savings, cash, credit)
- [x] Transactions (income / expense) with categories
- [x] Categories (system + custom)
- [x] Budgets per category / month
- [x] Dashboard summaries (balance, spending by category, recent activity)
- [x] Docker Compose (Postgres)
- [x] Next.js frontend structure
- [ ] Charts (Recharts / Chart.js)
- [ ] CSV export / import (optional)

---

## Tech Stack

| Layer    | Technology                          |
|----------|-------------------------------------|
| Frontend | Next.js 15 + TypeScript + Tailwind  |
| Backend  | FastAPI + Python 3.11+              |
| Database | PostgreSQL + SQLAlchemy             |
| Auth     | JWT (python-jose + passlib)         |
| Infra    | Docker + docker-compose             |

---

## Architecture

```
User → Next.js Frontend
         ↓
      FastAPI Backend
         ├── Auth
         ├── Accounts
         ├── Categories & Transactions
         ├── Budgets
         └── Reports / Summaries
         ↓
      PostgreSQL
```

---

## API Overview

| Method | Endpoint                      | Description                |
|--------|-------------------------------|----------------------------|
| POST   | `/api/v1/auth/register`       | Register                   |
| POST   | `/api/v1/auth/login`          | Login                      |
| GET    | `/api/v1/auth/me`             | Current user               |
| GET    | `/api/v1/accounts/`           | List accounts              |
| POST   | `/api/v1/accounts/`           | Create account             |
| GET    | `/api/v1/transactions/`       | List transactions          |
| POST   | `/api/v1/transactions/`       | Create transaction         |
| GET    | `/api/v1/categories/`         | List categories            |
| GET    | `/api/v1/budgets/`            | List budgets               |
| POST   | `/api/v1/budgets/`            | Create / update budget     |
| GET    | `/api/v1/reports/summary`     | Dashboard summary numbers  |

---

## Getting Started

```bash
git clone https://github.com/Invenitur42/personal-finance-manager.git
cd personal-finance-manager
docker-compose up -d

# Backend
cd backend
cp .env.example .env
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python -m app.db.init_db
uvicorn app.main:app --reload --port 8000

# Frontend
cd ../frontend
npm install && npm run dev
```

Open http://localhost:3000

---

## Interview Talking Points

- Modeling money carefully (use Decimal, avoid float)
- Transaction integrity and account balance consistency
- Time-based reporting (this month / last 30 days)
- Budget vs actual spending calculations
- How you would add multi-currency or shared households later

---

Part of a full-stack portfolio focused on production-style applications.