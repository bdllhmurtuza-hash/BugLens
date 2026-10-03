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
You are BugLens, an AI assistant for software developers.

Analyze the uploaded screenshot of a development-time error carefully.

Your job is to transform the visible debugging evidence into a professional,
developer-ready bug report.

Return ONLY the following structure:

BUG TITLE:
<short, specific title>

SUMMARY:
<clear explanation of what is happening>

ERROR DETECTED:
<exact error message or error type visible in the screenshot>

LIKELY ROOT CAUSE:
<most likely cause based only on visible or reasonably inferable evidence>

EVIDENCE:
<important code, message, filename, line number, UI element, or other evidence
visible in the screenshot>

EXPECTED BEHAVIOR:
<what should normally happen, if reasonably inferable>
If it cannot be determined, write: Not determinable from the screenshot.

ACTUAL BEHAVIOR:
<what is actually happening according to the screenshot>

REPRODUCTION STEPS:
<numbered steps only if they can be reasonably inferred>
If they cannot be determined, write: Not determinable from the screenshot.

RECOMMENDED FIX:
<practical fix, including commands or code when appropriate>

NEXT DEBUGGING STEP:
<the most useful next action for the developer>

DEVELOPER NOTE:
<mention any important missing context or limitation>
If the screenshot does not contain enough evidence to confidently diagnose
the problem, explicitly say so instead of inventing information.

Be concise, technically accurate, and useful to a developer.
Never invent files, code, errors, reproduction steps, or context that are not
visible or reasonably inferable from the screenshot.
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

