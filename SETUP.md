# WormPack — Setup & Recovery Guide

This document explains how to get WormPack running on a fresh machine. Follow it top to bottom if you're setting up on a new laptop or onboarding a collaborator.

---

## Prerequisites

Install these first:

- **Git** — https://git-scm.com
- **Node.js** (v18 or newer) — https://nodejs.org
- **Python** (3.10 or newer) — https://python.org

Verify each is installed:

```bash
git --version
node --version
python3 --version
```

---

## Secrets you'll need

These are **not** stored in the repo (they're gitignored for security). Keep them in a password manager under a note called "WormPack secrets":

| Secret | Where it's used | Where to find it |
|--------|-----------------|-------------------|
| `OPENAI_API_KEY` | backend `.env` | platform.openai.com → API keys |
| `VITE_SUPABASE_URL` | frontend `.env.local` | Supabase → Project Settings → API |
| `VITE_SUPABASE_ANON_KEY` | frontend `.env.local` | Supabase → Project Settings → API |
| Supabase DB password | (rarely needed) | set at project creation |

If the OpenAI key is lost, regenerate a new one in the OpenAI dashboard. The Supabase values can always be re-copied from the dashboard.

---

## 1. Clone the repository

```bash
git clone https://github.com/nagarjunsarathy/wormpack.git
cd wormpack
```

---

## 2. Backend setup (FastAPI)

```bash
cd backend

# Create and activate a virtual environment
python3 -m venv wp-env
source wp-env/bin/activate        # Windows: wp-env\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

Create `backend/.env` with your OpenAI key:

```
OPENAI_API_KEY=sk-your-key-here
```

Run the backend:

```bash
uvicorn main:app --reload --port 8000
```

- API: http://localhost:8000
- Interactive docs: http://localhost:8000/docs

---

## 3. Frontend setup (React + Vite)

In a new terminal:

```bash
cd frontend
npm install
```

Create `frontend/.env.local` with your Supabase values:

```
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

Run the frontend:

```bash
npm run dev
```

App: http://localhost:5173

---

## 4. Supabase (cloud — nothing to install)

The database, auth, and storage live on Supabase's servers. On a new machine you only need to:

1. Log in at https://supabase.com
2. Open the `wormpack` project
3. Copy the API URL and anon key into `frontend/.env.local` (see above)

The schema (tables, row-level security, triggers) is already applied on the server. If you ever need to recreate it from scratch, the SQL lives in `db/schema.sql` (keep that file updated whenever you change the schema).

---

## New-laptop recovery checklist

If your machine is lost or replaced, this is the full recovery path:

1. Install Git, Node.js, Python (see Prerequisites).
2. `git clone` the repo.
3. Recreate `backend/.env` and `frontend/.env.local` from your password manager.
4. Backend: create venv → `pip install -r requirements.txt`.
5. Frontend: `npm install`.
6. Run both servers. You're back.

Everything else (code, database, auth config, deployment settings) lives in GitHub, Supabase, Railway, and Cloudflare — no local backup needed.

---

## Project structure

```
wormpack/
├── backend/
│   ├── main.py
│   ├── requirements.txt
│   └── .env                  (gitignored — your secrets)
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   └── supabaseClient.js
│   ├── .env.local            (gitignored — your secrets)
│   └── package.json
├── db/
│   └── schema.sql            (Supabase schema for reference/recovery)
├── SETUP.md
└── README.md
```

---

## Deployment targets (Phase 1)

| Component | Host |
|-----------|------|
| Frontend  | Cloudflare Pages |
| Backend   | Railway |
| Database / Auth / Storage | Supabase |
| DNS (wormpack.ai) | Cloudflare (DNS-only / grey-cloud mode) |
