import os
from dotenv import load_dotenv
from mem0 import Memory

load_dotenv()
# AWS credentials (better via IAM role in production)

memory_config = {
   "llm": {
        "provider": "groq",
        "config": {
            "model": "openai/gpt-oss-120b",
            "temperature": 0.1,
            "max_tokens": 2000,
        }
    },

   "embedder": {
        "provider": "huggingface",
        "config": {
            "model": "multi-qa-MiniLM-L6-cos-v1"
        }
    },
     "vector_store": {
        "provider": "chroma",
        "config": {
            "collection_name": "agent_did_memory",
            "path": "./agent_memory"
        }
    }
}


memory = Memory.from_config(memory_config)


def save_learning(user_id, content):
    memory.add(
        content,
        user_id=user_id
    )


def retrieve_learning(user_id, query):
    results = memory.search(query, user_id=user_id, limit=5)

    memories = []

    for r in results:
        if isinstance(r, dict):
            memories.append(r.get("memory", ""))
        else:
            memories.append(str(r))

    return "\n".join(memories)
