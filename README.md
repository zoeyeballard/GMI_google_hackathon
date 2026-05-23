# GMI_google_hackathon

This repository is being turned into a testable scaffold for the hackathon idea:
video inference from GMI Cloud, orchestration via RocketRide, and report synthesis with Gemini.

## What is in this scaffold

- A small Python package under `src/gmi_hackathon`
- Prompt templates under `prompts/`
- FastAPI entry points for the demo backend
- Tests that define the behavior before vendor integrations are wired in

## Setup

Create a virtual environment, then install the core dependencies:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

Run the web app with:

```powershell
& .\.venv\Scripts\python.exe -m gmi_hackathon --port 8001
```

Then open `http://127.0.0.1:8001/`.

If port `8000` is already in use, keep `--port 8001` or choose another free port.

If you confirm the vendor SDK package names for RocketRide and GMI Cloud, install those into the same environment and wire them into the adapter layer in `src/gmi_hackathon/adapters/`.

For Google AI Studio / Gemini, this scaffold uses the official `google-genai` client shape as the intended integration point.

## Environment variables

Copy `.env.example` to `.env` and fill in your own values. Do not commit secrets.

## Test-driven flow

1. Write or adjust a prompt in `prompts/`.
2. Add or update a test under `tests/`.
3. Implement the smallest code change in `src/gmi_hackathon/`.
4. Run the test suite.

To verify from the repo root, use:

```powershell
& .\.venv\Scripts\python.exe -m pytest tests
```

## Phase plan

See `docs/phase-plan.md` for the detailed 4-hour build plan and the prompt structure for each part of the pipeline.