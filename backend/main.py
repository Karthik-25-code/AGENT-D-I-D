from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from typing import List
import json
import asyncio
import random

app = FastAPI()

# --- CONNECTION MANAGER (Handles Sync) ---
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: str, sender: WebSocket):
        # Send the drawing to everyone EXCEPT the person who drew it
        # (This prevents double-drawing lines on your own screen)
        for connection in self.active_connections:
            if connection != sender:
                await connection.send_text(message)

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

manager = ConnectionManager()

# --- WEBSOCKET ENDPOINT ---
@app.websocket("/ws/draw")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # 1. Receive data from the User
            data = await websocket.receive_text()
            data_json = json.loads(data)
            
            # 2. Sync it to other opened tabs (Collaborative Mode)
            await manager.broadcast(data, websocket)

            # 3. SIMULATE JARVIS (The Dumb Agent)
            # If the User stops drawing, Jarvis waits 2s and draws a blue line
            if data_json.get("type") == "end_stroke" and data_json.get("agent") == "user":
                print("User finished a stroke. Jarvis is thinking...")
                
                # Wait 2 seconds to simulate "Thinking"
                await asyncio.sleep(2)
                
                # Create a Fake Response Stroke (Just a simple offset line)
                # In real life, this comes from AWS Bedrock
                last_point = data_json["points"][-2:] # Get last x, y
                jarvis_stroke = {
                    "points": [last_point[0], last_point[1], last_point[0] + 50, last_point[1] + 50],
                    "color": "#0000FF", # Blue for Jarvis
                    "strokeWidth": 5,
                    "agent": "jarvis",
                    "type": "new_stroke"
                }
                
                # Send Jarvis's drawing to EVERYONE (including the user)
                await manager.broadcast(json.dumps(jarvis_stroke), None) 
                await manager.send_personal_message(json.dumps(jarvis_stroke), websocket)

    except WebSocketDisconnect:
        manager.disconnect(websocket)