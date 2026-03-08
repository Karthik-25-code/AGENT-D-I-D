from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import importlib
from fastapi.middleware.cors import CORSMiddleware
from auth import router as auth_router

from main import graph
from test import create_initial_state
from memory import save_learning, retrieve_learning

app = FastAPI()

# 1. Define the origins that are allowed to talk to your server
origins = [
    "http://localhost:5173",
]

# 2. Add the middleware to your app
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,            # Allow specific origins
    allow_credentials=True,
    allow_methods=["*"],              # Allow all methods (GET, POST, etc.)
    allow_headers=["*"],              # Allow all headers
)

class ChatRequest(BaseModel):
    user_id: str
    topic: str
    user_input: str


app.include_router(auth_router, prefix="/auth", tags=["auth"])

@app.get("/health")
async def health():
    return {"status": "ok"}


@app.post("/chat")
async def chat(req: ChatRequest):
    initial_state = {
        "user_id": req.user_id,
        "topic": req.topic,
        "messages": [],
        "latest_input": req.user_input,
        "phase": "start",
        "understanding_score": 0.0,
        "intervention_needed": False,
        "whiteboard_actions": [],
    }

    try:
        final_state = graph.invoke(initial_state)
        return {
            "messages": final_state.get("messages", []),
            "phase": final_state.get("phase", ""),
            "score": final_state.get("understanding_score", 0.0),
            "whiteboard_actions": final_state.get("whiteboard_actions", []),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/run_test")
async def run_test(req: ChatRequest):
    try:
        state = create_initial_state(req.user_id, req.topic, req.user_input)
        result = graph.invoke(state)
        return {
            "messages": result.get("messages", []),
            "phase": result.get("phase", ""),
            "score": result.get("understanding_score", 0.0),
            "whiteboard_actions": result.get("whiteboard_actions", []),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/memory/{user_id}")
async def memory_search(user_id: str, q: str):
    try:
        data = retrieve_learning(user_id, q)
        return {"user_id": user_id, "matches": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


class MemoryAdd(BaseModel):
    user_id: str
    content: str


@app.post("/memory/add")
async def memory_add(req: MemoryAdd):
    try:
        save_learning(req.user_id, req.content)
        return {"ok": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/encode")
async def encode_text(text: str):
    try:
        st = importlib.import_module("sentence_transformers")
        SentenceTransformer = getattr(st, "SentenceTransformer")
        model = SentenceTransformer("multi-qa-MiniLM-L6-cos-v1")
        vec = model.encode(text)
        return {"len": len(vec), "sample": list(vec[:10])}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("api:app", host="127.0.0.1", port=8000, reload=True)
