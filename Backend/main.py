from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import auth
from database import table

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)

@app.get("/")
def read_root():
    try:
        return {"message": f"Checking table: {table.table_status}"}
    except Exception as e:
        return {"error": f"Error: {e}"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
