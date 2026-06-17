# Wormpack — Progress Log & Handoff

_Last updated: session ending with working Google + email auth, dark theme live on localhost._

---

## Where things stand right now

The tutor works end-to-end and is now gated behind login. A user lands on a dark
centered login page, signs in with Google (or email/password), and drops straight
into the adaptive tutor. Everything below is running locally and confirmed working.

**Stack:** React + Vite (frontend) · FastAPI (backend) · Supabase (auth + DB) · OpenAI gpt-4o-mini
**Local URLs:** frontend on Vite dev server (port varies: 5173/5175), backend on localhost:8000

---

## What we did this session

### 1. Tutor UI polish
- Fixed pointer rendering: the model returns `•` bullets separated by newlines, but
  React rendered them inline. Added a `PointerText` component that splits on `\n`
  (and on a space-before-bullet as a fallback) so each pointer is its own line.
- Note: the model sometimes uses `·` (U+00B7) instead of `•` (U+2022) — the splitter
  handles both.

### 2. Backend prompt hardening (main.py)
- Rewrote the system prompt with an explicit "POINTER FORMAT LAW" so the model
  separates every bullet with `\n`.
- Added a rule that the FIRST message is always treated as a teach request (never
  an off-topic redirect), fixing on-topic questions being wrongly redirected.

### 3. Strategy decisions (for future phases — not built yet)
- Q&A as a standalone pillar is being deprioritized (AI has eroded that model).
- Core = AI tutor (retention) + activity feed (the moat, Phase 2).
- "Ask/Say" from the old WordPress design is NOT being rebuilt as-is; "Ask" lives in
  the tutor, "Say" becomes the future activity feed.
- Invite-only secure R&D pods = a promising LONG-TERM idea, parked until there's a
  user base. Do not build early.
- Monetization: start organic (reputation/badges), add paid tiers only after density.

### 4. Color theme + font
- Chose a dark greyscale theme (Apple/Perplexity inspired): near-black page,
  slightly lighter card surfaces, a light silver accent used sparingly.
- Mastery score colors kept (muted) so performance feedback stays legible.
- Font: system font stack (-apple-system, BlinkMacSystemFont, "Segoe UI").

### 5. Auth (the big one) — Supabase + Google SSO + email fallback
- Supabase project created; schema applied (profiles, learning_progress, conversations);
  Row Level Security ON; auto-create-profile trigger on signup. All verified working.
- Google OAuth configured in Google Cloud + Supabase (no billing needed for OAuth).
- Built four files (see below) wiring auth into the app.

---

## Files created / changed this session

| File | Status | What it does |
|------|--------|--------------|
| `frontend/src/App.jsx` | replaced | Dark theme, "Wormpack" name, PointerText fix, auth gate (Login vs Tutor), name + logout in header |
| `frontend/src/Login.jsx` | new | Centered dark login: Google + email/password + reset |
| `frontend/src/AuthContext.jsx` | new | Holds session, provides `user` + `signOut` |
| `frontend/src/main.jsx` | replaced | Wraps app in `<AuthProvider>` |
| `frontend/src/supabaseClient.js` | (already existed) | Supabase client from env vars |
| `backend/main.py` | updated | Pointer-format prompt rules + first-message-is-teach rule |
| `backend/requirements.txt` | created | Pinned Python deps |
| `SETUP.md` | created | Local setup + new-laptop recovery guide |
| `README.md` | refined | Professional project readme (via PR) |

---

## Supabase schema (for recovery — keep in db/schema.sql)

Tables: `profiles`, `learning_progress`, `conversations` — all with RLS enabled and
"users manage own rows" policies. A trigger auto-creates a profile row on signup.
(Full SQL is in the earlier setup steps; save it to `db/schema.sql` so it's version-controlled.)

---

## Secrets (store in password manager — NOT in git)

- `OPENAI_API_KEY` → backend/.env
- `VITE_SUPABASE_URL` → frontend/.env.local
- `VITE_SUPABASE_ANON_KEY` → frontend/.env.local
- Supabase DB password
- Google OAuth Client ID + Secret

---

## Known notes / gotchas

- Email/password signup requires email confirmation by default. Disable under
  Supabase → Authentication → Providers → Email if you want to skip it during testing.
- Vite needs a full restart (not just hot reload) when adding NEW files.
- Vite dev port drifts (5173 → 5175) when ports are busy — that's normal.
- For production later: Supabase Site URL + Redirect URLs must change from
  localhost to https://wormpack.ai, and CORS in main.py must be locked to the real domain.

---

## NEXT STEP — pick up here

**Week 4 of Phase 1: persist learning progress.**
Right now login works but nothing is saved per user. Next is wiring the tutor to
save each user's conversations + mastery scores + concepts covered into the Supabase
`learning_progress` and `conversations` tables, and showing returning users their progress.

After that (Phase 1 remaining):
- Backend hardening (lock CORS, rate limiting, move secrets to env properly)
- Deploy: backend → Railway, frontend → Cloudflare Pages
- Point wormpack.ai via Cloudflare DNS (grey-cloud / DNS-only mode)
- Real-user testing, then public launch

Phase 2 (later): activity feed, professional accounts, semantic search.
Phase 3+ (parked): invite-only secure R&D pods.
