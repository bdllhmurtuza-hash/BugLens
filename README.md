# BugLens

BugLens turns development error screenshots into structured, developer-ready bug reports using Gemma 4.

## What it does

Upload a screenshot containing an error, traceback, code, logs, or API response. BugLens analyzes the visual context and generates:

- Bug summary
- Error details
- Likely root cause
- Supporting evidence
- Recommended fix
- Next debugging step

## How it works

React frontend → Flask API → Gemma 4 → Structured bug report

## Tech Stack

- React + Vite
- Flask
- Python
- Gemini API
- Gemma 4

## Run locally

### Backend

```bash
cd backend
pip install -r requirements.txt
python app.py
