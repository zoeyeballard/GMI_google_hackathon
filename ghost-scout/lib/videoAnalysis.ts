import { GoogleGenerativeAI, Part } from '@google/generative-ai'
import { VideoAnalysisInput, VideoAnalysisResult, TalentIndicator, VideoFrame } from './types'

const VIDEO_ANALYSIS_TIMEOUT_MS = 60_000

const YOUTUBE_URL_PATTERNS = [
  /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([\w-]{11})/,
  /(?:https?:\/\/)?youtu\.be\/([\w-]{11})/,
  /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([\w-]{11})/,
  /(?:https?:\/\/)?(?:www\.)?youtube\.com\/shorts\/([\w-]{11})/,
]

export function extractYouTubeVideoId(url: string): string | null {
  for (const pattern of YOUTUBE_URL_PATTERNS) {
    const match = url.match(pattern)
    if (match?.[1]) return match[1]
  }
  return null
}

export function validateYouTubeUrl(url: string): boolean {
  return extractYouTubeVideoId(url) !== null
}

function getGenAI(): GoogleGenerativeAI {
  const key = process.env.GEMINI_API_KEY
  if (!key) {
    throw new Error('GEMINI_API_KEY environment variable is not set')
  }
  return new GoogleGenerativeAI(key)
}

function buildVideoPart(youtubeUrl: string): Part {
  return {
    fileData: {
      mimeType: 'video/mp4',
      fileUri: youtubeUrl,
    },
  }
}

// ── Prompt builders ──

export function buildObservationPrompt(input: VideoAnalysisInput): string {
  return `You are watching a football (soccer) video. The player is ${input.playerName}, age ${input.age}, playing as ${input.position} from ${input.country}.
${input.videoDescription ? `The scout has noted: ${input.videoDescription}` : ''}

Describe in detail:
1. The player's technical skills you can observe — ball control, passing, dribbling, shooting, first touch
2. Physical attributes — pace, agility, strength, aerial ability
3. Tactical awareness — positioning, movement off the ball, decision making
4. Any standout moments — both positive and negative

Be specific about timestamps when possible. Note if the video does not appear to contain football footage.

Respond ONLY in valid JSON matching this schema:
{
  "observations": {
    "technical": string,
    "physical": string,
    "tactical": string,
    "standoutMoments": string
  },
  "appearsToBeFootball": boolean,
  "videoAccessible": boolean,
  "estimatedMinutesOfFootage": number
}`
}

export function buildAssessmentPrompt(input: VideoAnalysisInput, observations: string): string {
  const lang = input.language ?? 'English'

  return `Based on these observations of ${input.playerName} (age ${input.age}, ${input.position} from ${input.country}):

${observations}

Rate this player's talent potential. For each talent indicator you can assess, provide a confidence score (0-1) based on how clearly the video evidence supports your rating.

Categories to evaluate:
TECHNICAL: first touch, passing accuracy, dribbling, shooting technique, weak-foot ability, ball control under pressure
PHYSICAL: pace, acceleration, stamina, strength, agility, aerial ability
TACTICAL: positioning, off-the-ball movement, spatial awareness, decision-making speed, pressing triggers
PSYCHOLOGICAL: composure under pressure, leadership, work rate, body language after mistakes, communication

Identify the 5 most important moments in the video.

Write a 2-paragraph scouting summary${lang !== 'English' ? ` in both English and ${lang}` : ''}.

Respond ONLY in valid JSON matching this schema:
{
  "overallVideoRating": number,
  "talentIndicators": [{ "category": "technical"|"physical"|"tactical"|"psychological", "indicator": string, "observed": boolean, "confidence": number, "evidence": string }],
  "keyMoments": [{ "timestamp": number, "description": string }],
  "summaryText": string,
  "recommendationLevel": "high" | "medium" | "low" | "insufficient_footage"
}`
}

// ── Core analysis ──

interface ObservationResult {
  observations: {
    technical: string
    physical: string
    tactical: string
    standoutMoments: string
  }
  appearsToBeFootball: boolean
  videoAccessible: boolean
  estimatedMinutesOfFootage: number
}

function parseJsonFromResponse(text: string): unknown {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/)
  const raw = fenced ? fenced[1]! : text
  return JSON.parse(raw.trim())
}

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`${label} timed out after ${ms / 1000}s`)), ms)
    promise.then(resolve, reject).finally(() => clearTimeout(timer))
  })
}

export interface AnalysisProgress {
  pass: 1 | 2
  status: 'running' | 'complete' | 'error'
  label: string
  data?: unknown
}

/**
 * Two-pass YouTube video analysis using Gemini 2.0 Flash multimodal.
 *
 * Pass 1 — Observation: describe what Gemini sees in the video.
 * Pass 2 — Assessment: structured talent rating from the observations.
 *
 * Accepts an optional `onProgress` callback so callers (e.g. the SSE route)
 * can stream incremental updates to the client.
 */
export async function analyzeYouTubeVideo(
  input: VideoAnalysisInput,
  onProgress?: (progress: AnalysisProgress) => void,
): Promise<VideoAnalysisResult> {
  if (!input.youtubeUrl) {
    throw new Error('A YouTube URL is required for video analysis')
  }

  const genAI = getGenAI()
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })
  const videoPart = buildVideoPart(input.youtubeUrl)

  // ── Pass 1: Observation ──
  onProgress?.({ pass: 1, status: 'running', label: 'Observing video footage' })

  let observationResult: ObservationResult
  try {
    const pass1 = await withTimeout(
      model.generateContent([videoPart, { text: buildObservationPrompt(input) }]),
      VIDEO_ANALYSIS_TIMEOUT_MS,
      'Video observation pass',
    )
    observationResult = parseJsonFromResponse(pass1.response.text()) as ObservationResult
  } catch (err) {
    onProgress?.({ pass: 1, status: 'error', label: 'Could not access or analyze video' })
    return insufficientFootageResult(input, err)
  }

  if (!observationResult.videoAccessible) {
    onProgress?.({ pass: 1, status: 'error', label: 'Video not accessible' })
    return insufficientFootageResult(
      input,
      new Error('Gemini could not access the YouTube video — it may be private, age-restricted, or geo-blocked'),
    )
  }

  onProgress?.({ pass: 1, status: 'complete', label: 'Observation complete', data: observationResult.observations })

  const nonFootballWarning = !observationResult.appearsToBeFootball
    ? '\n\n⚠️ Note: The video may not contain football footage. Results should be interpreted with caution.'
    : ''

  // ── Pass 2: Talent Assessment ──
  onProgress?.({ pass: 2, status: 'running', label: 'Assessing talent potential' })

  const observationText = JSON.stringify(observationResult.observations, null, 2)
  let assessment: Omit<VideoAnalysisResult, 'id' | 'playerName'>
  try {
    const pass2 = await withTimeout(
      model.generateContent([
        videoPart,
        { text: buildAssessmentPrompt(input, observationText) },
      ]),
      VIDEO_ANALYSIS_TIMEOUT_MS,
      'Talent assessment pass',
    )
    assessment = parseJsonFromResponse(pass2.response.text()) as Omit<VideoAnalysisResult, 'id' | 'playerName'>
  } catch (err) {
    onProgress?.({ pass: 2, status: 'error', label: 'Assessment failed' })
    return insufficientFootageResult(input, err)
  }

  onProgress?.({ pass: 2, status: 'complete', label: 'Assessment complete' })

  return {
    id: '',
    playerName: input.playerName,
    overallVideoRating: clampRating(assessment.overallVideoRating),
    talentIndicators: normalizeTalentIndicators(assessment.talentIndicators),
    keyMoments: normalizeKeyMoments(assessment.keyMoments),
    summaryText: (assessment.summaryText ?? '') + nonFootballWarning,
    recommendationLevel: assessment.recommendationLevel ?? 'insufficient_footage',
  }
}

// ── Helpers ──

function insufficientFootageResult(input: VideoAnalysisInput, err: unknown): VideoAnalysisResult {
  const message = err instanceof Error ? err.message : 'Unknown error during video analysis'
  return {
    id: '',
    playerName: input.playerName,
    overallVideoRating: 0,
    talentIndicators: [],
    keyMoments: [],
    summaryText: `Video analysis could not be completed: ${message}`,
    recommendationLevel: 'insufficient_footage',
  }
}

function clampRating(n: unknown): number {
  const num = typeof n === 'number' ? n : 0
  return Math.max(0, Math.min(100, Math.round(num)))
}

function normalizeTalentIndicators(raw: unknown): TalentIndicator[] {
  if (!Array.isArray(raw)) return []
  return raw.map((t) => ({
    category: t.category ?? 'technical',
    indicator: String(t.indicator ?? ''),
    observed: Boolean(t.observed),
    confidence: Math.max(0, Math.min(1, Number(t.confidence) || 0)),
    evidence: String(t.evidence ?? ''),
  }))
}

function normalizeKeyMoments(raw: unknown): VideoFrame[] {
  if (!Array.isArray(raw)) return []
  return raw.map((m) => ({
    timestamp: Number(m.timestamp) || 0,
    description: String(m.description ?? ''),
  }))
}
