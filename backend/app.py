from flask import Flask, request, jsonify
from flask_cors import CORS
from google import genai
from google.genai import types
from dotenv import load_dotenv
import os

load_dotenv("backend/.env")

app = Flask(__name__)
CORS(app)

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

MODEL = "gemma-4-26b-a4b-it"


@app.route("/api/analyze", methods=["POST"])
def analyze():
    if "image" not in request.files:
        return jsonify({"error": "No image uploaded"}), 400

    image = request.files["image"]

    image_bytes = image.read()

    prompt = """
You are BugLens, a focused technical error analyzer.

Analyze the uploaded screenshot carefully.

Return ONLY this structure:

PROBLEM:
<what the error is>

LIKELY CAUSE:
<why it is happening>

FIX:
<exact practical fix, including commands when appropriate>

NEXT STEP:
<what the user should do after applying the fix>

Be concise and technically accurate.
Do not invent information that is not visible or reasonably inferable from the screenshot.
"""

    try:
        response = client.models.generate_content(
            model=MODEL,
            contents=[
                types.Part.from_bytes(
                    data=image_bytes,
                    mime_type=image.content_type
                ),
                prompt
            ]
        )

        return jsonify({
            "analysis": response.text
        })

    except Exception as e:
        return jsonify({
            "error": str(e)
        }), 500


@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "BugLens backend is running"})


if __name__ == "__main__":
    app.run(debug=True, port=5000)

