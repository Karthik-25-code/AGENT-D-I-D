from main import graph

# -------- INITIAL STATE --------
def create_initial_state(user_id, topic, first_message):

    return {
        "user_id": user_id,
        "topic": topic,

        # shared conversation memory
        "messages": [
            {
                "role": "user",
                "content": first_message
            }
        ],

        "phase": "start",
        "understanding_score": 0.0,
        "intervention_needed": False,
        "whiteboard_actions": [],

        # helper field for testing
        "latest_input": first_message,
    } 

def run_once():

    state = create_initial_state(
        user_id="student1",
        topic="Binary Search",
        first_message="Binary search finds an element by checking middle repeatedly."
    )

    result = graph.invoke(state)

    print("\n===== FINAL STATE =====\n")

    for msg in result["messages"]:
        print(f"{msg['role'].upper()}:\n{msg['content']}\n")



def interactive_test():

    state = create_initial_state(
        "student1",
        "Binary Search",
        input("Explain the topic:\n> ")
    )

    while True:

        # run graph step
        state = graph.invoke(state)

        print("\n--- Conversation ---\n")

        for msg in state["messages"]:
            print(f"{msg['role']}: {msg['content']}\n")

        # stop if super agent finished
        if state["phase"] == "teaching":
            print("✅ Super agent completed teaching.")
            break

        # simulate user reply
        user_reply = input("Your answer:\n> ")

        state["latest_input"] = user_reply
        state["messages"].append({
            "role": "user",
            "content": user_reply
        })

if __name__ == "__main__":
    interactive_test()