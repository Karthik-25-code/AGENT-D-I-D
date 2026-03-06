import json
import re
from .config import get_gemini_response

class JarvisBrain:
    def __init__(self):
        pass

    async def generate_dynamic_checklist(self, topic: str):
        # ... (Same as before, keep the checklist generation logic) ...
        print(f"DEBUG: Generating checklist for {topic}")
        system_prompt = """
        You are an Expert Curriculum Designer. 
        Analyze the requested TOPIC and break it down into 4-6 distinct, sequential learning milestones.
        
        RULES:
        1. Keep concepts atomic (one idea per item).
        2. Order them logically (Basics -> Mechanics -> Advanced).
        3. Descriptions should be simple enough for a student to explain.
        
        OUTPUT FORMAT (JSON ONLY):
        {
            "topic_category": "Category Name",
            "checklist": [
                {"id": "c1", "concept": "Concept Name", "description": "What specifically needs to be explained?"}
            ]
        }
        """
        user_message = f"Topic: {topic}"
        
        try:
            raw_json = await get_gemini_response(system_prompt, user_message)
            clean_json = re.search(r'\{.*\}', raw_json, re.DOTALL)
            parsed_data = json.loads(clean_json.group() if clean_json else raw_json)
            
            if not parsed_data.get("checklist"):
                raise ValueError("No checklist found")
            return parsed_data
        except Exception as e:
            print(f"Checklist Error: {e}")
            return {
                "checklist": [
                    {"id": "error1", "concept": f"Basics of {topic}", "description": "Define it."},
                    {"id": "error2", "concept": "Key Details", "description": "Explain how it works."}
                ]
            }

    async def evaluate_user_explanation(self, transcript: str, current_checklist: list, topic: str, chat_history: list):
        # 1. Context Preparation
        # specific focus on the *uncovered* items to guide the AI
        uncovered_items = [item for item in current_checklist if not item.get("covered")]
        covered_items = [item for item in current_checklist if item.get("covered")]
        
        context_data = {
            "topic": topic,
            "goal_concepts": uncovered_items,
            "already_known": [item["concept"] for item in covered_items]
        }
        
        history_text = "\n".join([str(msg) for msg in chat_history[-6:]]) # Last 3 turns

        # --- THE UNIVERSAL PROMPT ---
        system_prompt = f"""
        You are Jarvis, a curious, slightly confused peer student.
        You are learning about "{topic}" from the User (who is the teacher).

        YOUR BRAIN (JSON):
        {json.dumps(context_data)}

        CONVERSATION HISTORY:
        {history_text}

        USER'S LATEST EXPLANATION:
        "{transcript}"

        ---------------------------------------------------
        ### INSTRUCTIONS ###
        1. **ANALYZE (Semantic Match)**: 
           - Does the User's explanation cover the *meaning* or *core idea* of any concept in 'goal_concepts'?
           - Be generous. If the concept is "Time Complexity" and user says "It's super fast, log n", MARK IT COVERED.
           - If the user implies a concept (e.g., "It calls itself" -> Recursion), MARK IT COVERED.

        2. **DETERMINE STATUS**:
           - **Complete?**: If 'goal_concepts' is empty (or becomes empty after this turn), you are done.
           - **Stuck?**: If the user asks "What's left?" or "What next?", explicitly list the remaining 'goal_concepts'.

        3. **GENERATE RESPONSE (Persona: Jarvis)**:
           - **If a concept was explained**: Acknowledge it excitedly ("Oh, that makes sense! So [rephrase slightly].") and IMMEDIATELY ask about the *next* concept in 'goal_concepts'.
           - **If the explanation was vague**: Ask a "dumb" clarifying question. ("Wait, I don't get the [specific part]. Can you give an example?")
           - **If the user is off-topic**: Gently steer them back to the *first* item in 'goal_concepts'.

        ### OUTPUT FORMAT (Strict JSON) ###
        {{
            "covered_concept_ids": ["c1", "c3"], 
            "jarvis_response_text": "Your natural, conversational response here.",
            "is_explanation_complete": false
        }}
        """
        
        try:
            raw_response = await get_gemini_response(system_prompt, transcript)
            
            # Cleaning
            clean_json = re.search(r'\{.*\}', raw_response, re.DOTALL)
            if clean_json:
                data = json.loads(clean_json.group())
            else:
                data = json.loads(raw_response)

            return {
                "covered_concept_ids": data.get("covered_concept_ids", []),
                "jarvis_response_text": data.get("jarvis_response_text", "I'm thinking... could you rephrase that?"),
                "is_explanation_complete": len(uncovered_items) == 0 # Auto-complete if list is empty
            }
        except Exception as e:
            print(f"CORE EVAL ERROR: {e}")
            return {
                "covered_concept_ids": [], 
                "jarvis_response_text": "I lost my train of thought. What were we saying?", 
                "is_explanation_complete": False
            }