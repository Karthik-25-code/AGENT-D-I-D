from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from .jarv import JarvisBrain
import json
import traceback
import asyncio

app = FastAPI()
brain = JarvisBrain()

sessions = {}

@app.websocket("/ws/jarvis/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: str):
    await websocket.accept()
    
    try:
        data = await websocket.receive_json()
        topic = data.get("topic")
        
        if not topic:
            await websocket.close()
            return

        print(f"Client {client_id} connected. Topic: {topic}")
        
        # Initial Checklist Generation
        try:
            initial_data = await brain.generate_dynamic_checklist(topic)
        except Exception as e:
            print(f"Checklist generation failed: {e}")
            initial_data = {"checklist": []}
        
        checklist_state = []
        if initial_data and 'checklist' in initial_data:
            for item in initial_data['checklist']:
                item['covered'] = False
                checklist_state.append(item)
            
        sessions[client_id] = {
            "topic": topic,
            "checklist": checklist_state,
            "chat_history": [] 
        }
        
        await websocket.send_json({
            "type": "init",
            "message": f"Okay, I'm ready to learn about {topic}. Where should we start?",
            "checklist": checklist_state
        })

        while True:
            try:
                # Wait for user input
                user_input = await websocket.receive_json()
                transcript = user_input.get("transcript")
                
                if not transcript:
                    continue

                print(f"Processing: {transcript[:30]}...")
                current_session = sessions[client_id]
                
                # --- CRITICAL FIX: Timeout Protection ---
                # We wrap the AI call in a timeout so it doesn't hang forever
                try:
                    evaluation = await asyncio.wait_for(
                        brain.evaluate_user_explanation(
                            transcript, 
                            current_session["checklist"], 
                            current_session["topic"],
                            current_session["chat_history"]
                        ),
                        timeout=3000.0 # Stop waiting after 25 seconds
                    )
                except asyncio.TimeoutError:
                    print("AI took too long to respond.")
                    evaluation = {
                        "jarvis_response_text": "I'm thinking really hard... can you say that again?",
                        "covered_concept_ids": []
                    }

                # Update State
                covered_ids = evaluation.get("covered_concept_ids", [])
                for item in current_session["checklist"]:
                    if item["id"] in covered_ids:
                        item["covered"] = True
                
                jarvis_reply = evaluation.get("jarvis_response_text", "Hmm, okay.")
                
                # Update History
                current_session["chat_history"].append(f"User: {transcript}")
                current_session["chat_history"].append(f"Jarvis: {jarvis_reply}")
                
                # Calculate Progress
                total = len(current_session["checklist"])
                covered = sum(1 for i in current_session["checklist"] if i["covered"])
                progress = int((covered / total) * 100) if total > 0 else 0
                
                await websocket.send_json({
                    "type": "update",
                    "jarvis_audio_text": jarvis_reply,
                    "updated_checklist": current_session["checklist"],
                    "progress": progress,
                    "is_complete": progress == 100
                })
                
                if progress >= 80:
                    await websocket.send_json({
                        "type": "finish", 
                        "message": "I get it now! Thanks!"
                    })
                    break
            
            except WebSocketDisconnect:
                print(f"Client {client_id} disconnected unexpectedly.")
                break
            except Exception as inner_e:
                print(f"Error in loop: {inner_e}")
                traceback.print_exc()
                # Send error to client so they know what happened
                await websocket.send_json({
                    "type": "error",
                    "message": "My brain froze for a second. Please continue."
                })

    except Exception as e:
        print(f"CRITICAL SERVER ERROR: {e}")
    finally:
        if client_id in sessions:
            del sessions[client_id]