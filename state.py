# state.py

from typing import TypedDict, List, Dict, Optional


class Message(TypedDict):
    role: str
    content: str


class AgentState(TypedDict):
    # ---- identity ----
    user_id: str
    topic: str

    # ---- conversation ----
    messages: List[Message]
    latest_input: str

    # ---- flow control ----
    phase: str

    # ---- evaluation ----
    understanding_score: float
    intervention_needed: bool

    # ---- teaching output ----
    whiteboard_actions: List[Dict]

    # ---- optional future expansion ----
    metadata: Dict