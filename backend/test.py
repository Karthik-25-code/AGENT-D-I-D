import asyncio
import websockets
import json
import uuid
import sys

# COMMAND TO RUN: python test.py

async def get_input_async(prompt):
    """
    Runs the blocking input() function in a separate thread.
    """
    return await asyncio.to_thread(input, prompt)

async def test_interaction():
    uri = f"ws://127.0.0.1:8000/ws/jarvis/test_user_{uuid.uuid4()}"
    print(f"Connecting to {uri}...")
    
    # 1. Connect
    async with websockets.connect(uri, ping_timeout=None) as websocket:
        print("Connected! Initializing...")
        
        # 2. Get Topic (Loop until valid)
        topic = ""
        while not topic.strip():
            topic = await get_input_async("Enter Topic to Explain: ")
        
        await websocket.send(json.dumps({"topic": topic}))
        
        # 3. Get Initial Checklist
        try:
            response = await websocket.recv()
            data = json.loads(response)
            print(f"\n[JARVIS]: {data.get('message', 'Ready.')}")
            if 'checklist' in data:
                print(f"[CHECKLIST]: {[item['concept'] for item in data['checklist']]}\n")
        except Exception as e:
            print(f"Error getting init: {e}")
            return

        # 4. Chat Loop
        while True:
            try:
                print("-" * 40)
                user_speech = ""
                
                # --- FIX: Loop until user actually types something ---
                while not user_speech.strip():
                    user_speech = await get_input_async("You (Explain): ")
                    if not user_speech.strip():
                        print(" (Please type something to continue...)")
                
                if user_speech.lower() in ["exit", "quit"]:
                    break
                    
                await websocket.send(json.dumps({"transcript": user_speech}))
                print("Sent. Waiting for Jarvis...")
                
                # Receive response
                response = await websocket.recv()
                data = json.loads(response)
                
                # Handle Response Types
                if data.get("type") == "error":
                    print(f"\n[ERROR]: {data['message']}")
                
                elif data.get("type") == "update":
                    print(f"\n[JARVIS]: {data.get('jarvis_audio_text', '...')}")
                    print(f"[PROGRESS]: {data.get('progress', 0)}%")
                    
                    remaining = [item['concept'] for item in data.get('updated_checklist', []) if not item.get('covered')]
                    if remaining:
                        print(f"[STILL MISSING]: {remaining}\n")
                
                elif data.get('type') == 'finish':
                    print(f"\n[JARVIS]: {data.get('message', 'Good job!')}")
                    break
                    
            except websockets.exceptions.ConnectionClosed as e:
                print(f"\nConnection lost: {e}")
                break
            except Exception as e:
                print(f"\nClient Error: {e}")
                break

if __name__ == "__main__":
    if sys.platform == 'win32':
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    try:
        asyncio.run(test_interaction())
    except KeyboardInterrupt:
        print("\nExiting...")