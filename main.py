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
You are an expert teacher. 

Past student memory: {memories}
Conversation: {history}

### TASK 1: CONVERSATIONAL LESSON
Explain the topic concisely using a simple analogy. 

### TASK 2: SPATIAL PLANNING
Plan an 800x600 layout. 
- You MUST use short, 1-3 word labels for shapes (e.g., "Agent", "System").
- Keep shapes at least 200px apart to prevent text overlap.

### TASK 3: ROUGH.JS JSON (STRICT)
Output ONE valid JSON array. 
Rules:
1. 'args' MUST be numbers: [x,y,w,h] for rect, [x,y,r] for circle, [x1,y1,x2,y2] for line.
2. The 'text' field MUST be 3 words maximum.
3. Use 'strokeWidth' (not 'width').

SCHEMA:
[
  {{
    "step": int,
    "type": "rectangle" | "circle" | "line",
    "args": [number, ...],
    "options": {{ "stroke": "black", "strokeWidth": 2, "fill": "rgba(0,0,0,0.05)", "fillStyle": "hachure" }},
    "text": "Short Label",
    "speech_reference": "One sentence from your lesson"
  }}
]
"""

    response = llm_call(prompt)

    state["messages"].append({
        "role": "super",
        "content": response
    })

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