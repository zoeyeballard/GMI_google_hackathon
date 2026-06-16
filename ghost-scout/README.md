# Ghost Scout

> AI-powered football talent discovery for underserved regions

Ghost Scout helps grassroots football scouts generate professional scouting reports for young players in underserved regions. A scout describes a player — or submits a YouTube video — and the system produces a benchmark analysis, player comparisons, a full bilingual scouting report, an academy introduction email, and optional AI video talent analysis, all in seconds.

## Quick Start

```bash
# 1. Install dependencies
cd ghost-scout && npm install

# 2. Configure API keys
cp .env.local.example .env.local
# Edit .env.local — add your GMI_API_KEY and GEMINI_API_KEY

# 3. Start the dev server
npm run dev

# 4. Open http://localhost:3000

# 5. Click any demo card to try it instantly
```

## Features

### Form-Based Scouting Pipeline
A scout fills in a player profile (name, age, country, position, physical stats, skills description) and the system runs a 4-step AI pipeline:

1. **Benchmark Analysis** (GMI Cloud) — Compares the player against FIFA development benchmarks
2. **Player Comparisons** (GMI Cloud) — Finds historical professional player comps
3. **Scouting Report** (Gemini) — Generates a formal bilingual scouting report
4. **Academy Email** (Gemini) — Drafts an introduction email to a matched academy

### Video Talent Analysis (New)
Scouts can submit a YouTube video URL for AI-powered video analysis using Gemini 2.0 Flash's multimodal capabilities:

- **Two-pass analysis**: Observation pass (what the AI sees) → Talent assessment pass (structured rating)
- **Radar chart**: Visual talent profile across Technical, Physical, Tactical, and Psychological categories
- **Talent indicators**: Observed skills with confidence scores and video evidence
- **Key moments**: Timestamped highlights linked back to the YouTube video
- **Recommendation badge**: HIGH / MEDIUM / LOW / INSUFFICIENT FOOTAGE

### Combined Analysis
Submit both form data AND video for a unified assessment that:
- Runs benchmark + video analysis in parallel
- Synthesizes both data sources into a single report
- Highlights agreements and discrepancies between stats and footage

### Additional Features
- **Bilingual reports** — Full report translated into the player's native language
- **Academy matching** — Matches players to suitable youth academies worldwide
- **Shareable permalinks** — Every report gets a unique URL
- **Real-time streaming** — Pipeline progress streams via SSE
- **Demo scenarios** — 4 pre-built demo cards (including video demo)
- **PDF export** — Print-ready report formatting
- **Dark mode UI** — Professional scouting aesthetic

## Environment Variables

| Variable | Required | Description | Get one |
|----------|----------|-------------|---------|
| `GMI_API_KEY` | Yes | GMI Cloud API key for benchmark & comp inference on NVIDIA H100 GPUs | [cloud.gmi.ai](https://cloud.gmi.ai) |
| `GMI_BASE_URL` | No | GMI Cloud API base URL (default: `https://api.gmi-serving.com/v1`) | — |
| `GMI_MODEL` | No | Model to use on GMI Cloud (default: `deepseek-ai/DeepSeek-R1`) | — |
| `GEMINI_API_KEY` | Yes | Google AI Studio API key for report generation, email drafting, and video analysis | [aistudio.google.com/apikey](https://aistudio.google.com/apikey) |

## Stack

| Layer | Technology | Role |
|-------|-----------|------|
| AI Inference | **GMI Cloud** (NVIDIA H100/H200) | Player benchmarking & comparisons via DeepSeek-R1 |
| AI Generation | **Google Gemini 2.5 Flash** | Multilingual reports, emails, video analysis, synthesis |
| Pipeline Orchestration | **RocketRide** | Agent pipeline orchestration (no API key required) |
| Frontend + API | **Next.js 14** | React UI with streaming server-sent events |
| Styling | **Tailwind CSS** | Dark-themed responsive design |

## Demo Script (3-minute pitch)

### Opening (30s)
> "Every year, millions of talented young footballers are missed because they play in regions with no professional scouting infrastructure. Ghost Scout uses AI to change that."

### Demo Flow (2m)

1. **Click "Amadou Diallo" demo card** — Show how a scout describes a 14-year-old winger from Senegal
2. **Watch the pipeline run** — Point out the real-time streaming: GMI Cloud benchmarks → player comps → Gemini report → academy email
3. **Show the report** — Highlight the percentile bar, player comparisons, bilingual translation toggle
4. **Show the email** — A ready-to-send introduction to FC Barcelona La Masia
5. **Click "Amadou (Video Demo)"** — Show combined form + video analysis
6. **Highlight the video analysis** — Radar chart, talent indicators, timestamped key moments

### Closing (30s)
> "Ghost Scout runs entirely on GMI Cloud and Google Gemini. The GMI Cloud H100 cluster handles player benchmarking at inference speed. Gemini handles the creative generation — multilingual reports, video analysis, academy emails. RocketRide orchestrates the whole pipeline. One scout, one form, one report — anywhere in the world."

## Project Structure

```
ghost-scout/
├── app/
│   ├── api/
│   │   ├── scout/route.ts          # Main pipeline API (form, video, combined flows)
│   │   ├── scout/video/route.ts    # Video-only analysis API
│   │   └── health/route.ts         # Health check endpoint
│   ├── report/[id]/page.tsx        # Report permalink page
│   ├── report/video/[id]/page.tsx  # Video report permalink page
│   └── page.tsx                    # Home page with form + live pipeline
├── components/
│   ├── ScoutForm.tsx               # Player input form with demo scenarios
│   ├── PipelineStatus.tsx          # Real-time pipeline step visualization
│   ├── ReportCard.tsx              # Rendered scouting report
│   ├── EmailDraft.tsx              # Academy email preview
│   ├── VideoInput.tsx              # YouTube URL / file upload input
│   └── VideoAnalysisResult.tsx     # Video analysis display (radar chart, indicators)
├── lib/
│   ├── rocketride.ts               # RocketRide pipeline orchestrator
│   ├── gmi.ts                      # GMI Cloud integration (benchmarks + comps)
│   ├── gemini.ts                   # Gemini integration (reports + emails + synthesis)
│   ├── videoAnalysis.ts            # Gemini video analysis (two-pass)
│   ├── videoValidation.ts          # Client-safe YouTube URL validation
│   ├── reportStore.ts              # In-memory report storage
│   ├── benchmarks.ts               # FIFA youth development benchmark data
│   ├── academy.ts                  # Academy matching logic
│   └── types.ts                    # TypeScript interfaces
├── __tests__/                      # Jest test suites (4 phases, 39 tests)
├── package.json
└── .env.local.example
```

## Running Tests

```bash
npm test          # Run all 39 tests
npm run build     # Production build with type checking
```

## API Endpoints

### `POST /api/scout`
Starts the scouting pipeline. Accepts `{ player?, video? }` — at least one required.
Returns a streaming SSE response with step updates and final report.

### `POST /api/scout/video`
Video-only analysis endpoint. Accepts `VideoAnalysisInput` with a YouTube URL.

### `GET /api/scout?id=<report_id>`
Fetches a previously generated report by ID.

### `GET /api/health`
Returns service health, configured providers, and GMI Cloud connection status.

## Built at GMI Cloud × Google I/O × RocketRide Hackathon, May 2026
