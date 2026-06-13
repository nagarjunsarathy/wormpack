# Wormpack 🪱

**WormPack** is an AI-powered adaptive, mastery-based tutoring platform for data engineers. It teaches concepts in **Apache Spark, SQL, Data Engineering, and Python** through a continuous **Teach → Question → Evaluate → Remediate/Advance** loop, adapting difficulty in real time based on the learner's responses.

---

## Tech Stack

| Layer       | Technology                  |
|-------------|------------------------------|
| Backend     | FastAPI (Python)             |
| Frontend    | React + Vite                 |
| AI Model    | OpenAI `gpt-4o-mini`         |
| Deployment  | Railway (API), Vercel (Web)  |

---

## Project Structure

```
wormpack/
├── backend/
│   ├── main.py
│   ├── requirements.txt
│   └── .env
└── frontend/
    ├── src/
    │   └── App.jsx
    └── package.json
```

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/nagarjunsarathy/wormpack.git
cd wormpack
```

### 2. Backend setup

```bash
cd backend

# Create and activate a virtual environment
python3 -m venv wp-env
source wp-env/bin/activate        # on Windows: wp-env\Scripts\activate

# Install dependencies
pip install fastapi uvicorn openai python-dotenv
```

Create a `.env` file in `backend/` with your OpenAI API key:

```bash
echo "OPENAI_API_KEY=sk-your-key-here" > .env
```

Add the environment file and virtualenv to `.gitignore`:

```bash
echo ".env" >> .gitignore
echo "wp-env/" >> .gitignore
```

Run the backend server:

```bash
uvicorn main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`.
Interactive API docs (Swagger UI): `http://localhost:8000/docs`

---

### 3. Frontend setup

In a new terminal:

```bash
cd frontend

# If setting up frontend for the first time:
npm create vite@latest . -- --template react

npm install
```

Run the dev server:

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## How It Works

1. The student selects a **topic** (Spark, SQL, Data Engineering, or Python) from the topic tabs.
2. They ask a question or pick a suggested prompt.
3. The backend builds a topic-specific system prompt and sends the conversation to `gpt-4o-mini`.
4. The model responds with structured JSON in one of three flows:
   - **Teach** — explains a concept and asks a check-for-understanding question
   - **Evaluation** — scores the student's answer (0–10), flags misconceptions, and adapts difficulty
   - **Redirect** — gently steers off-topic questions back to the selected curriculum
5. The frontend renders each response type with a dedicated UI (concept card, score ring, mastery progress bar, etc).

---

## API Reference

| Method | Endpoint      | Description                          |
|--------|---------------|---------------------------------------|
| GET    | `/health`     | Health check                          |
| GET    | `/topics`     | List available topics                 |
| POST   | `/api/chat`   | Send conversation, get tutor response |

**`POST /api/chat`** request body:

```json
{
  "messages": [
    { "role": "user", "content": "What causes a shuffle in Spark?" }
  ],
  "topic": "spark"
}
```

---

## Roadmap

- [ ] Deploy backend to Railway
- [ ] Deploy frontend to Vercel
- [ ] Point `wormpack.ai` (Cloudflare DNS) to production
- [ ] Add persistent user progress tracking
- [ ] Expand curriculum (Electrical, Mechanical, Aerospace, Civil, Biotech)

---
