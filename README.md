# Ghost Scout

> AI-powered football talent discovery for underserved regions

## Stack
- **GMI Cloud** — NVIDIA H100/H200 inference via OpenAI-compatible API
- **Google Gemini** — multilingual report generation (10+ languages)
- **RocketRide** — agent pipeline orchestration
- **Next.js 14** — frontend + streaming API

## How it works
1. Scout describes a player in natural language
2. RocketRide orchestrates a 4-step pipeline
3. GMI Cloud benchmarks stats + finds player comps
4. Gemini generates a formal scouting report + translates it
5. Output: professional PDF-ready report + academy email draft

## Setup
```bash
npm install
cp .env.local.example .env.local
# Add your GMI_API_KEY and GEMINI_API_KEY
npm run dev
```

See [`ghost-scout/README.md`](./ghost-scout/README.md) for full setup and run instructions.

## Environment Variables
| Variable | Description |
|---|---|
| `GMI_API_KEY` | Your GMI Cloud API key |
| `GMI_BASE_URL` | GMI Cloud base URL (default: `https://api.gmi-serving.com/v1`) |
| `GEMINI_API_KEY` | Your Google AI Studio API key |
| `ROCKETRIDE_API_KEY` | Your RocketRide API key |

## Running Tests
```bash
npm test
```

## Built at GMI Cloud × Google I/O × RocketRide Hackathon, May 2026
