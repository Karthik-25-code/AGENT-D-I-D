import json
import re
from utils import extract_float

def user_explains(state):

    state["messages"].append({
        "role": "user",
        "content": state["latest_input"]
    })

    state["phase"] = "doubt"

    return state 

from llm import llm_call

def dumb_agent(state):

    history = "\n".join(
        f"{m['role']}: {m['content']}"
        for m in state["messages"]
    )

    prompt = f"""
You are a confused student.

Conversation:
{history}

Ask ONE doubt exposing misunderstanding.
"""

    doubt = llm_call(prompt)

    state["messages"].append({
        "role": "dumb",
        "content": doubt
    })

    state["phase"] = "user_answer"

    return state

def user_answers(state):

    state["messages"].append({
        "role": "user",
        "content": state["latest_input"]
    })

    state["phase"] = "evaluation"

    return state

from llm import llm_call

def evaluate(state):

    history = "\n".join(
        f"{m['role']}: {m['content']}"
        for m in state["messages"]
    )

    prompt = f"""
Evaluate student's understanding.

Conversation:
{history}

Return score between 0 and 1. strcitly output should be between 0 and 1 thats no extra string feilds.
"""
    output_llm=llm_call(prompt)
    print(output_llm)
    k=extract_float(output_llm) 
    print(k)

    score = float(k)
    print(score) 
    state["understanding_score"] = score
    state["intervention_needed"] = score < 0.6

    return state

from llm import llm_call
from memory import retrieve_learning, save_learning

def super_agent(state):

    history = "\n".join(
        f"{m['role']}: {m['content']}"
        for m in state["messages"]
    )

    memories = retrieve_learning(
        state["user_id"],
        state["topic"]
    )

    prompt = f"""
You are an expert Educational Visual Architect. 

Past student memory: {memories}
Conversation: {history}
Topic: {state['topic']}

Your task is to design a massive, highly detailed 800x600 Rough.js diagram that thoroughly explains the topic. 
You must output ONLY a single, completely valid JSON array containing 50+ elements. NO markdown formatting outside the JSON, NO introductory text. The output MUST start with `[` and end with `]`.

### 1. UNRESTRICTED ROUGH.JS ARSENAL (CRITICAL)
- You have total freedom to use ANY valid geometric shape or path from the Rough.js library (e.g., `rectangle`, `circle`, `ellipse`, `line`, `polygon`, `arc`, `curve`, `path`, `linearPath`).
- Choose the shape dynamically based on what best represents the semantic meaning of the concept.
- **WARNING:** Do NOT invent fictional shape types (e.g., do NOT use a "text" type). Text rendering is handled externally. You must only output valid Rough.js geometric primitives.

### 2. MASSIVE SCALE & SPATIAL LOGIC
- Generate a highly detailed diagram containing 50+ distinct elements to map out micro-interactions, edge cases, and broad architecture.
- Canvas Size: 1000 (width) x 800 (height).
- You MUST space out coordinates mathematically to prevent stroke and text overlap. Keep at least 80-100px of space between the starting points of shapes. 
- Group related sub-topics into distinct clusters across the canvas.

### 3. EDUCATIONAL CONTENT
- Quality over Quantity: Every single `speech_reference` must teach a UNIQUE, specific fact about the topic. Do not repeat generic phrases. If the user asks about Python index values, detail positive indexing, negative indexing, `IndexError`, slicing syntax, etc.
- The `text` field must be 1-3 words maximum. This acts as the visual label for the shape.

### 4. STYLING & JSON FORMAT
- Vary the styling professionally to distinguish different concepts. Use specific hex codes and Rough.js `fillStyle` options (e.g., `hachure`, `solid`, `zigzag`, `cross-hatch`).
- Ensure the JSON is perfectly formatted and does not get cut off.

### STRICT JSON SCHEMA
```json
[
  {{
    "type": "<ANY_VALID_ROUGH_JS_SHAPE>",
    "args": [<APPROPRIATE_ARGS_FOR_SHAPE>],
    "options": {{ "stroke": "#2c3e50", "strokeWidth": 2, "fill": "rgba(41, 128, 185, 0.2)", "fillStyle": "solid" }},
    "text": "Short Label",
    "speech_reference": "One highly specific, unique sentence explaining this exact part of the topic."
  }}
]"""

    response = llm_call(prompt)

    # Try to extract a JSON array of drawing actions from the model output
    actions = []
    try:
        json_match = re.search(r"\[\s*\{.*?\}\s*\]", response, re.DOTALL)
        if json_match:
            actions = json.loads(json_match.group())
            # remove raw json from the message so frontends only see the lesson
            clean_text = response.replace(json_match.group(), "").strip()
        else:
            clean_text = response
    except Exception as e:
        print("Could not parse JSON actions from super_agent response:", e)
        clean_text = response

    state["messages"].append({
        "role": "super",
        "content": clean_text
    })

    # attach drawing actions for frontend whiteboard rendering
    state["whiteboard_actions"] = actions

    save_learning(
        state["user_id"],
        f"Needed intervention in {state['topic']}"
    )

    state["phase"] = "teaching"

    return state

from langgraph.graph import StateGraph, END
from state import AgentState
builder = StateGraph(AgentState)

builder.add_node("user_explains", user_explains)
builder.add_node("dumb_agent", dumb_agent)
builder.add_node("user_answers", user_answers)
builder.add_node("evaluate", evaluate)
builder.add_node("super_agent", super_agent)

builder.set_entry_point("user_explains")

builder.add_edge("user_explains", "dumb_agent")
builder.add_edge("dumb_agent", "user_answers")
builder.add_edge("user_answers", "evaluate")


def route(state):
    if state["intervention_needed"]:
        return "super_agent"
    return END


builder.add_conditional_edges("evaluate", route)

builder.add_edge("super_agent", END)

graph = builder.compile()





