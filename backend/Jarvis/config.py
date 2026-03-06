import os
from groq import AsyncGroq
from dotenv import load_dotenv
import re

load_dotenv()

api_key = os.getenv("GROQ_API_KEY")
if not api_key:
    print("CRITICAL ERROR: GROQ_API_KEY not found in .env")

# Initialize Async Client
client = AsyncGroq(api_key=api_key)

MODEL_NAME = "llama-3.1-8b-instant" 

def clean_json_text(text: str) -> str:
    cleaned = re.sub(r"^```json\s*", "", text, flags=re.MULTILINE)
    cleaned = re.sub(r"^```\s*", "", cleaned, flags=re.MULTILINE)
    cleaned = re.sub(r"\s*```$", "", cleaned, flags=re.MULTILINE)
    return cleaned.strip()

async def get_gemini_response(system_instruction: str, user_prompt: str):
    try:
        # Await the async completion
        completion = await client.chat.completions.create(
            model=MODEL_NAME,
            messages=[
                {"role": "system", "content": system_instruction + "\n\nIMPORTANT: RESPOND ONLY WITH JSON. NO MARKDOWN."},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.7,
            response_format={"type": "json_object"} 
        )
        return completion.choices[0].message.content
        
    except Exception as e:
        print(f"Groq API Error: {e}")
        return "{}"