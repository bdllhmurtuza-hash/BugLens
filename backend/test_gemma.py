from google import genai
from dotenv import load_dotenv

load_dotenv("backend/.env")

client = genai.Client()

response = client.models.generate_content(
    model="gemma-4-26b-a4b-it",
    contents="Reply with exactly: BugLens Gemma 4 is working."
)

print(response.text)

