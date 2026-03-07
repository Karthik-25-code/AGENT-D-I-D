# # llm.py

# import os
# from dotenv import load_dotenv
# import google.generativeai as genai

# # load env variables
# load_dotenv()

# # configure Gemini
# genai.configure(
#     api_key="AIzaSyCS6SQWFOQvHgd5X779qd0ry73VlnlQzBU"
# )


# model = genai.GenerativeModel(
#     model_name="gemini-2.5-flash"   
# )


# def llm_call(prompt: str,
#              system_prompt: str = None,
#              temperature: float = 0.7,
#              max_tokens: int = 1024) -> str:
#     """
#     Generic LLM call for your LangGraph agents.

#     Args:
#         prompt: user/content prompt
#         system_prompt: optional system instruction
#         temperature: randomness
#         max_tokens: output limit

#     Returns:
#         text response
#     """

#     try:
#         # combine system + user prompt
#         if system_prompt:
#             full_prompt = f"""
# SYSTEM:
# {system_prompt}

# USER:
# {prompt}
# """
#         else:
#             full_prompt = prompt

#         response = model.generate_content(
#             full_prompt,
#             generation_config={
#                 "temperature": temperature,
#                 "max_output_tokens": max_tokens,
#             }
#         )

#         return response.text.strip()

#     except Exception as e:
#         print("LLM Error:", e)
#         return "Error generating response."





# llm.py

import os
from dotenv import load_dotenv
from groq import Groq

# load env variables
load_dotenv()

# initialize groq client
client = Groq(
    api_key=''
)


def llm_call(
    prompt: str,
    system_prompt: str = None,
    temperature: float = 0.7,
    max_tokens: int = 1024
) -> str:
    """
    Generic LLM call for your LangGraph agents using Groq.
    """

    try:

        messages = []

        if system_prompt:
            messages.append({
                "role": "system",
                "content": system_prompt
            })

        messages.append({
            "role": "user",
            "content": prompt
        })

        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",  # fast groq model
            messages=messages,
            temperature=temperature,
            max_tokens=max_tokens
        )

        return response.choices[0].message.content.strip()

    except Exception as e:
        print("LLM Error:", e)
        return "Error generating response."