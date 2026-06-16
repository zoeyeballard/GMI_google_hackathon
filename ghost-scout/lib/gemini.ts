import { GoogleGenerativeAI } from '@google/generative-ai'
import { PlayerInput, BenchmarkResult, PlayerComp, VideoAnalysisResult } from './types'

// Google AI Studio API key for Gemini model access (reports, emails, synthesis)
if (!process.env.GEMINI_API_KEY) {
  console.error('[Gemini] GEMINI_API_KEY is not set — Gemini features will fail. Get one at https://aistudio.google.com/apikey')
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export async function generateScoutingReport(
  player: PlayerInput,
  benchmark: BenchmarkResult,
  comps: PlayerComp[]
): Promise<{ english: string; native: string }> {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

  const compsText = comps
    .map(c => `- ${c.player_name} (${c.current_club}): ${c.similarity_score}% match — ${c.note}`)
    .join('\n')

  const prompt = `You are a professional football scouting analyst. Write a formal 1-page scouting report for a youth player.

PLAYER PROFILE:
Name: ${player.name}
Age: ${player.age}
Country: ${player.country}
Position: ${player.position}
Height: ${player.height_cm}cm | Weight: ${player.weight_kg}kg
Dominant Foot: ${player.dominant_foot}
Sprint 100m: ${player.sprint_100m_seconds || 'N/A'}s
Scout's Observations: ${player.skills_description}

BENCHMARK ANALYSIS:
Percentile: Top ${100 - benchmark.percentile}% of U${player.age} ${player.position}s globally
Overall Rating: ${benchmark.overall_rating.toUpperCase()}
Standout Attributes: ${benchmark.standout_attributes.join(', ')}
Development Areas: ${benchmark.development_flags.join(', ')}

PLAYER COMPARISONS:
${compsText}

Write the report with these sections:
1. **Executive Summary**
2. **Physical Profile**
3. **Technical Assessment**
4. **Psychological Indicators** (infer from scout's observations)
5. **Development Pathway** (next 2-4 years)
6. **Recommended Academy Match**

Reference the specific player comps by name. Write in formal scouting report style.

After the English report, write "---TRANSLATION---" and then translate the ENTIRE report into ${player.language}.`

  const result = await model.generateContent(prompt)
  const text = result.response.text()

  const parts = text.split('---TRANSLATION---')
  return {
    english: parts[0]?.trim() || text,
    native: parts[1]?.trim() || text,
  }
}

export async function generateAcademyEmail(
  report: string,
  player: PlayerInput,
  academy: string
): Promise<string> {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

  const prompt = `Write a formal email to the youth academy director at ${academy}, introducing a talented youth player.

PLAYER: ${player.name}, Age ${player.age}, from ${player.country}, Position: ${player.position}

KEY HIGHLIGHTS FROM SCOUTING REPORT:
${report.substring(0, 1500)}

The email should:
- Be professional and concise
- Include the player's key stats and standout qualities
- Reference the scouting report findings
- Request an assessment opportunity or trial
- Be ready to send (include Subject line at the top)

Format:
Subject: [subject line]

[email body]

Sign off as "Ghost Scout AI Scouting Platform"`

  const result = await model.generateContent(prompt)
  return result.response.text()
}

export async function synthesizeCombinedReport(
  player: PlayerInput,
  benchmark: BenchmarkResult,
  videoResult: VideoAnalysisResult,
): Promise<string> {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

  const indicatorSummary = videoResult.talentIndicators
    .filter(t => t.observed)
    .map(t => `- [${t.category}] ${t.indicator}: ${Math.round(t.confidence * 100)}% confidence — ${t.evidence}`)
    .join('\n')

  const prompt = `You have two independent analyses of the same youth football player. Your task is to synthesize them into a unified talent assessment.

ANALYSIS 1 — Statistical Benchmarking (form-based scouting data):
Player: ${player.name}, Age ${player.age}, ${player.position} from ${player.country}
Height: ${player.height_cm}cm, Weight: ${player.weight_kg}kg, Dominant Foot: ${player.dominant_foot}
Scout's Observations: ${player.skills_description}
Benchmark Percentile: Top ${100 - benchmark.percentile}% of U${player.age} ${player.position}s globally
Overall Rating: ${benchmark.overall_rating.toUpperCase()}
Standout Attributes: ${benchmark.standout_attributes.join(', ')}
Development Areas: ${benchmark.development_flags.join(', ')}

ANALYSIS 2 — AI Video Analysis (from match/training footage):
Overall Video Rating: ${videoResult.overallVideoRating}/100
Recommendation Level: ${videoResult.recommendationLevel}
Talent Indicators Observed:
${indicatorSummary}
Video Summary: ${videoResult.summaryText}

Produce a unified assessment that:
1. Reconciles both data sources — note where they agree and where they diverge
2. Highlights any discrepancies (e.g., "stats suggest elite pace but video shows average acceleration")
3. Gives a FINAL combined talent rating (1-100) and recommendation (high/medium/low)
4. Provides a 3-paragraph executive summary suitable for an academy director

Write in formal scouting report style.`

  const result = await model.generateContent(prompt)
  return result.response.text()
}
