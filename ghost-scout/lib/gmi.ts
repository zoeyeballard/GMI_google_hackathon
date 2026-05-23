import OpenAI from 'openai'
import { z } from 'zod'
import { PlayerInput, BenchmarkResult, PlayerComp } from './types'

const GMI_SYSTEM_PROMPT = `You are an elite FIFA-certified youth football scout with 20 years experience identifying talent in underserved regions. You have deep knowledge of player development timelines, physical benchmarks, and historical comp players.`

const gmiClient = new OpenAI({
  apiKey: process.env.GMI_API_KEY || '',
  baseURL: process.env.GMI_BASE_URL || 'https://api.gmi-serving.com/v1',
})

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

export async function analyzeWithBenchmarks(
  player: PlayerInput,
  benchmarks: Record<string, unknown>
): Promise<BenchmarkResult> {
  const response = await gmiClient.chat.completions.create({
    model: 'meta-llama/Llama-4-Maverick-17B-128E-Instruct-FP8',
    messages: [
      { role: 'system', content: GMI_SYSTEM_PROMPT },
      {
        role: 'user',
        content: `Analyze this youth player against FIFA development benchmarks and return a JSON object.

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
}`,
      },
    ],
    temperature: 0.3,
  })

  const content = response.choices[0]?.message?.content || '{}'
  const jsonMatch = content.match(/\{[\s\S]*\}/)
  const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : content)
  return BenchmarkResultSchema.parse(parsed)
}

export async function generatePlayerComps(
  player: PlayerInput,
  benchmark: BenchmarkResult
): Promise<PlayerComp[]> {
  const response = await gmiClient.chat.completions.create({
    model: 'meta-llama/Llama-4-Maverick-17B-128E-Instruct-FP8',
    messages: [
      { role: 'system', content: GMI_SYSTEM_PROMPT },
      {
        role: 'user',
        content: `Find 2-3 historical player comparisons for this youth talent and return a JSON array.

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
}]`,
      },
    ],
    temperature: 0.5,
  })

  const content = response.choices[0]?.message?.content || '[]'
  const jsonMatch = content.match(/\[[\s\S]*\]/)
  const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : content)
  return z.array(PlayerCompSchema).parse(parsed)
}
