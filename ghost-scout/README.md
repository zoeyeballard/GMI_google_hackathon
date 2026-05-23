# Ghost Scout

> AI-powered football talent discovery for underserved regions

## Overview

Ghost Scout helps grassroots football scouts generate professional scouting reports for young players in underserved regions. A scout describes a player in natural language, and the system produces a benchmark analysis, player comparisons, a full bilingual scouting report, and an academy introduction email — all in seconds.

## Stack

| Layer | Technology | Role |
|-------|-----------|------|
| AI Inference | **GMI Cloud** (NVIDIA H100/H200) | Player benchmarking & comparisons via Llama-4-Maverick |
| AI Generation | **Google Gemini 2.0 Flash** | Multilingual report generation & academy emails |
| Pipeline Orchestration | **RocketRide** | Agent pipeline orchestration (no API key required) |
| Frontend + API | **Next.js 14** | React UI with streaming server-sent events |
| Styling | **Tailwind CSS** | Dark-themed responsive design |

## How It Works

1. Scout describes a player (name, age, country, position, physical stats, skills)
2. RocketRide orchestrates a 4-step pipeline:
   - **Step 1** — GMI Cloud benchmarks the player against FIFA development standards
   - **Step 2** — GMI Cloud finds historical player comparisons
   - **Step 3** — Gemini generates a formal bilingual scouting report
   - **Step 4** — Gemini drafts an academy introduction email
3. Results stream to the UI in real-time via SSE
4. Output: professional report + translated version + email draft

## Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.12+ and pip (for rocketride orchestrator)

## Setup

### 1. Install Node.js dependencies

```bash
cd ghost-scout
npm install
```

### 2. Install Python dependencies

RocketRide is available as a standard pip package — no API key required:

```bash
pip install -r requirements.txt
```

Or install directly:

```bash
pip install rocketride
```

### 3. Configure environment variables

```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your keys:

```env
GMI_API_KEY=your_gmi_cloud_api_key
GMI_BASE_URL=https://api.gmi-serving.com/v1
GEMINI_API_KEY=your_google_ai_studio_key
```

> **Note:** RocketRide does NOT require an API key. The SDK runs in public mode automatically.

### 4. Start the development server

```bash
npm run dev
```

The app will be available at [http://localhost:3000](http://localhost:3000).

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GMI_API_KEY` | Yes | Your GMI Cloud API key ([get one here](https://cloud.gmi.ai)) |
| `GMI_BASE_URL` | No | GMI Cloud base URL (default: `https://api.gmi-serving.com/v1`) |
| `GEMINI_API_KEY` | Yes | Your Google AI Studio API key ([get one here](https://aistudio.google.com/apikey)) |

## Running Tests

```bash
npm test
```

## Project Structure

```
ghost-scout/
├── app/
│   ├── api/
│   │   ├── scout/route.ts      # Main pipeline API (POST streams SSE, GET fetches report)
│   │   └── health/route.ts     # Health check endpoint
│   ├── report/[id]/page.tsx    # Report permalink page
│   └── page.tsx                # Home page with form + live pipeline
├── components/
│   ├── ScoutForm.tsx           # Player input form with demo scenarios
│   ├── PipelineStatus.tsx      # Real-time pipeline step visualization
│   ├── ReportCard.tsx          # Rendered scouting report
│   └── EmailDraft.tsx          # Academy email preview
├── lib/
│   ├── rocketride.ts           # RocketRide pipeline orchestrator
│   ├── gmi.ts                  # GMI Cloud integration (benchmarks + comps)
│   ├── gemini.ts               # Gemini integration (reports + emails)
│   ├── benchmarks.ts           # FIFA youth development benchmark data
│   └── types.ts                # TypeScript interfaces
├── scripts/
│   └── rocketride_orchestrator.py  # Python RocketRide SDK script (public mode)
├── __tests__/                  # Jest test suites
├── requirements.txt            # Python dependencies (rocketride)
├── package.json                # Node.js dependencies
└── .env.local.example          # Environment variable template
```

## RocketRide Integration

RocketRide handles pipeline orchestration — coordinating the sequence of AI calls and managing retries/failures. It operates in **public mode**, meaning:

- Install via `pip install rocketride` (standard PyPI package)
- No API key, no account signup, no configuration needed
- The TypeScript orchestrator (`lib/rocketride.ts`) handles step sequencing in-process
- The Python script (`scripts/rocketride_orchestrator.py`) provides an alternative standalone runner

### Using the Python orchestrator directly

```bash
echo '{"steps": [{"id": "step1", "name": "Benchmark", "status": "pending"}]}' | python scripts/rocketride_orchestrator.py
```

## API Endpoints

### `POST /api/scout`

Starts the scouting pipeline. Returns a streaming SSE response.

**Request body:**
```json
{
  "player": {
    "name": "Amadou Diallo",
    "age": 14,
    "country": "Senegal",
    "position": "winger",
    "height_cm": 168,
    "weight_kg": 58,
    "dominant_foot": "left",
    "sprint_100m_seconds": 11.4,
    "skills_description": "Exceptional pace and close control...",
    "language": "French"
  }
}
```

**SSE events:**
- `{"type": "step", "step": {...}}` — pipeline step status update
- `{"type": "complete", "report": {...}}` — final report
- `{"type": "error", "error": "..."}` — pipeline failure

### `GET /api/scout?id=<report_id>`

Fetches a previously generated report by ID.

### `GET /api/health`

Returns service health and configured providers.

## Production Build

```bash
npm run build
npm start
```

## Built at GMI Cloud x Google I/O x RocketRide Hackathon, May 2026
