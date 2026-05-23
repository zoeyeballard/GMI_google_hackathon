import OpenAI from 'openai'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { z } from 'zod'
import { PlayerInput, BenchmarkResult, PlayerComp } from './types'

interface PositionBenchmark {
  avg_sprint: number
  sprint_stddev: number
  avg_height: number
  height_stddev: number
  avg_weight: number
  weight_stddev: number
  key_skills: string[]
}

const TIMEOUT_MS = 30000
const RETRY_MAX = 1
const RETRY_BACKOFF_MS = 2000

const VALID_MODELS = [
  'deepseek-ai/DeepSeek-R1',
  'meta-llama/Llama-4-Maverick-17B-128E-Instruct-FP8',
]

const GMI_MODEL = process.env.GMI_MODEL || 'deepseek-ai/DeepSeek-R1'

if (process.env.GMI_MODEL && !VALID_MODELS.includes(process.env.GMI_MODEL)) {
  console.warn(
    `[GMI] Warning: GMI_MODEL "${process.env.GMI_MODEL}" is not a known valid model. ` +
    `Valid models: ${VALID_MODELS.join(', ')}`
  )
}

const GMI_SYSTEM_PROMPT = `You are an elite FIFA-certified youth football scout with 20 years experience identifying talent in underserved regions. You have deep knowledge of player development timelines, physical benchmarks, and historical comp players.`

const gmiClient = new OpenAI({
  apiKey: process.env.GMI_API_KEY || '',
  baseURL: process.env.GMI_BASE_URL || 'https://api.gmi-serving.com/v1',
  timeout: TIMEOUT_MS,
  maxRetries: 0,
})

const fallbackAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

const BenchmarkResultSchema = z.object({
  percentile: z.number().min(0).max(100),
  standout_attributes: z.array(z.string()),
  development_flags: z.array(z.string()),
  overall_rating: z.enum(['exceptional', 'high_potential', 'promising', 'developing']),
})

const PlayerCompSchema = z.object({
  player_name: z.string(),
  current_club: z.string(),
  position: z.string(),
  similarity_score: z.number().min(0).max(100),
  note: z.string(),
})

function classifyError(err: unknown): string {
  if (!(err instanceof Error)) return 'unknown error'
  const msg = err.message.toLowerCase()
  if (msg.includes('timeout') || msg.includes('timed out') || msg.includes('etimedout')) {
    return 'timeout'
  }
  if (msg.includes('401') || msg.includes('unauthorized') || msg.includes('auth')) {
    return 'auth_error'
  }
  if (msg.includes('model') || msg.includes('not found') || msg.includes('404')) {
    return 'model_error'
  }
  if (/5\d\d/.test(msg) || msg.includes('server error') || msg.includes('internal')) {
    return 'server_error'
  }
  return 'unknown'
}

function isRetryable(err: unknown): boolean {
  const classification = classifyError(err)
  return classification === 'timeout' || classification === 'server_error'
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function callGMIWithRetry(systemPrompt: string, userPrompt: string): Promise<string> {
  let lastError: unknown

  for (let attempt = 0; attempt <= RETRY_MAX; attempt++) {
    try {
      const response = await gmiClient.chat.completions.create({
        model: GMI_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.3,
        max_tokens: 2000,
      })
      return response.choices[0]?.message?.content || ''
    } catch (err) {
      lastError = err
      const reason = classifyError(err)
      console.error(`[GMI] Request failed (attempt ${attempt + 1}/${RETRY_MAX + 1}): ${reason} — ${(err as Error).message}`)

      if (attempt < RETRY_MAX && isRetryable(err)) {
        const backoff = RETRY_BACKOFF_MS * Math.pow(2, attempt)
        console.error(`[GMI] Retrying in ${backoff}ms...`)
        await sleep(backoff)
      }
    }
  }

  throw lastError
}

async function callGMI(systemPrompt: string, userPrompt: string, stepName: string): Promise<string> {
  try {
    return await callGMIWithRetry(systemPrompt, userPrompt)
  } catch (err) {
    const reason = classifyError(err)
    console.error(`[GMI] All retries exhausted (${reason}). Falling back to Gemini for step: ${stepName}`)
    const model = fallbackAI.getGenerativeModel({ model: 'gemini-2.5-flash' })
    const result = await model.generateContent(`${systemPrompt}\n\n${userPrompt}`)
    return result.response.text()
  }
}

export async function testGMIConnection(signal?: AbortSignal): Promise<{ ok: boolean; models: string[]; error?: string }> {
  try {
    const baseURL = process.env.GMI_BASE_URL || 'https://api.gmi-serving.com/v1'
    const response = await fetch(`${baseURL}/models`, {
      headers: { Authorization: `Bearer ${process.env.GMI_API_KEY || ''}` },
      signal: signal ?? AbortSignal.timeout(TIMEOUT_MS),
    })

    if (!response.ok) {
      const text = await response.text().catch(() => '')
      return { ok: false, models: [], error: `HTTP ${response.status}: ${text}` }
    }

    const data = await response.json()
    const models = (data.data || []).map((m: { id: string }) => m.id)
    return { ok: true, models }
  } catch (err) {
    const reason = classifyError(err)
    return { ok: false, models: [], error: `${reason}: ${(err as Error).message}` }
  }
}

export async function analyzeWithBenchmarks(
  player: PlayerInput,
  benchmarks: PositionBenchmark
): Promise<BenchmarkResult> {
  const userPrompt = `Analyze this youth player against FIFA development benchmarks and return a JSON object.

Player: ${player.name}, Age: ${player.age}, Country: ${player.country}
Position: ${player.position}, Height: ${player.height_cm}cm, Weight: ${player.weight_kg}kg
Dominant Foot: ${player.dominant_foot}, Sprint 100m: ${player.sprint_100m_seconds || 'N/A'}s
Skills Observed: ${player.skills_description}

Benchmarks for age ${player.age} ${player.position}:
${JSON.stringify(benchmarks, null, 2)}

Return ONLY valid JSON with this exact structure:
{
  "percentile": <0-100>,
  "standout_attributes": [<strings>],
  "development_flags": [<strings>],
  "overall_rating": "<exceptional|high_potential|promising|developing>"
}`

  const content = await callGMI(GMI_SYSTEM_PROMPT, userPrompt, 'analyzeWithBenchmarks')
  const jsonMatch = content.match(/\{[\s\S]*\}/)
  const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : content)
  return BenchmarkResultSchema.parse(parsed)
}

export async function generatePlayerComps(
  player: PlayerInput,
  benchmark: BenchmarkResult
): Promise<PlayerComp[]> {
  const userPrompt = `Find 2-3 historical player comparisons for this youth talent and return a JSON array.

Player: ${player.name}, Age: ${player.age}, Country: ${player.country}
Position: ${player.position}, Height: ${player.height_cm}cm, Weight: ${player.weight_kg}kg
Dominant Foot: ${player.dominant_foot}, Sprint 100m: ${player.sprint_100m_seconds || 'N/A'}s
Skills: ${player.skills_description}
Benchmark Percentile: ${benchmark.percentile}
Standout Attributes: ${benchmark.standout_attributes.join(', ')}
Rating: ${benchmark.overall_rating}

Return ONLY a valid JSON array of objects:
[{
  "player_name": "<famous player name>",
  "current_club": "<club>",
  "position": "<position>",
  "similarity_score": <0-100>,
  "note": "<why they are a comparison at the same age>"
}]`

  const content = await callGMI(GMI_SYSTEM_PROMPT, userPrompt, 'generatePlayerComps')
  const jsonMatch = content.match(/\[[\s\S]*\]/)
  const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : content)
  return z.array(PlayerCompSchema).parse(parsed)
}
