import os
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()
key = os.getenv("OPENAI_API_KEY")
print("OpenAI Key length:", len(key))
client = OpenAI(api_key=key)

try:
    completion = client.chat.completions.create(
        model=os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
        messages=[{"role": "user", "content": "Hi"}],
        max_tokens=10
    )
    print("Success!", completion.choices[0].message.content)
except Exception as e:
    print("Error:", e)
