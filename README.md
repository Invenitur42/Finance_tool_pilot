# Finance Tool Pilot

Track accounts and transactions, see balance and monthly income/expense on a small dashboard.

**FastAPI + Postgres + Next.js**

Amounts use **Decimal** in the backend so balances don’t drift from float rounding.

**Live demo:** [Open Finance Tracker](https://invenitur42.github.io/portfolio-live-demos/finance/)  
(All demos: [portfolio-live-demos](https://invenitur42.github.io/portfolio-live-demos/))

[Open in Codespaces](https://codespaces.new/Invenitur42/Finance_tool_pilot)

---

## Features

- Auth (JWT)
- Accounts (checking, savings, cash, credit)
- Income / expense transactions with categories
- Dashboard totals for the current month
- Budget endpoints (API)
- Postgres via Docker (host port **5433** so it doesn’t clash with other local DBs)

---

## Run (full stack)

```bash
git clone https://github.com/Invenitur42/Finance_tool_pilot.git
cd Finance_tool_pilot
docker compose up -d

cd backend
cp .env.example .env
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python -m app.db.init_db
uvicorn app.main:app --reload --port 8000

cd ../frontend && npm install && npm run dev
```

UI: http://localhost:3000 · API: http://localhost:8000/docs

---

## Notes

Creating a transaction updates the account balance in the same flow. Categories are seeded for common income/expense types; users only see their own data.

Possible follow-ups: charts, CSV import/export, multi-currency.

---

## Deploy

Frontend → Vercel. API + Postgres → Railway/Render. Wire `DATABASE_URL` and `SECRET_KEY`.
