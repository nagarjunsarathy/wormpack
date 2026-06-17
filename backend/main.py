from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
# from anthropic import Anthropic
from openai import OpenAI
from dotenv import load_dotenv
import os

load_dotenv()

app = FastAPI()
# client = Anthropic(api_key=os.getenv("OPENAI_API_KEY"))
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

SYSTEM_PROMPT = """You are MasteryMind, an expert AI tutor...
(paste your full system prompt here)
"""

class ChatRequest(BaseModel):
    messages: list

@app.get("/health")
def health():
    return {"status": "ok"}


# Anthropic style
# @app.post("/api/chat")
# def chat(req: ChatRequest):
#     try:
#         response = client.messages.create(
#             # model="claude-sonnet-4-20250514",
#             model="gpt-4o-mini",
#             max_tokens=1000,
#             system=SYSTEM_PROMPT,
#             messages=req.messages,
#         )
#         return {"content": response.content[0].text}
#     except Exception as e:
#         print(f"ERROR: {e}")   # this prints to your uvicorn terminal
#         return {"error": str(e)}, 500


@app.post("/api/chat")
def chat(req: ChatRequest):
    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",        # cheap and fast for MVP
            max_tokens=1000,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                *req.messages           # spread the conversation history
            ],
        )
        return {"content": response.choices[0].message.content}
    except Exception as e:
        print(f"ERROR: {e}")
        return {"error": str(e)}, 500
