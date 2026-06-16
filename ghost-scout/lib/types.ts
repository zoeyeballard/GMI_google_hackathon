export interface PlayerInput {
  name: string
  age: number
  country: string
  position: 'goalkeeper' | 'defender' | 'midfielder' | 'winger' | 'striker'
  height_cm: number
  weight_kg: number
  dominant_foot: 'left' | 'right' | 'both'
  sprint_100m_seconds?: number
  skills_description: string
  language: string
}

export interface BenchmarkResult {
  percentile: number
  standout_attributes: string[]
  development_flags: string[]
  overall_rating: 'exceptional' | 'high_potential' | 'promising' | 'developing'
}

export interface PlayerComp {
  player_name: string
  current_club: string
  position: string
  similarity_score: number
  note: string
}

export interface AcademyMatch {
  name: string
  country: string
  tier: 'elite' | 'top' | 'development'
  fitScore: number
  reason: string
  contactEmail: string
  websiteUrl: string
}

export interface ScoutingReport {
  id: string
  generated_at: string
  player: PlayerInput
  benchmark: BenchmarkResult
  comps: PlayerComp[]
  report_english: string
  report_native: string
  matched_academy: string
  matched_academies: AcademyMatch[]
  email_draft: string
  pipeline_steps: PipelineStep[]
}

export interface PipelineStep {
  id: string
  name: string
  status: 'pending' | 'running' | 'complete' | 'error'
  provider: 'gmi' | 'gemini' | 'rocketride'
  duration_ms?: number
  output_preview?: string
}

// ── Combined input ──

export interface CombinedScoutInput {
  player?: PlayerInput
  video?: VideoAnalysisInput
}

// ── Video-based talent analysis ──

export interface VideoAnalysisInput {
  youtubeUrl?: string
  videoDescription?: string
  playerName: string
  age: number
  country: string
  position: string
  language?: string
}

export interface VideoFrame {
  timestamp: number
  description: string
}

export interface TalentIndicator {
  category: 'technical' | 'physical' | 'tactical' | 'psychological'
  indicator: string
  observed: boolean
  confidence: number
  evidence: string
}

export interface VideoAnalysisResult {
  id: string
  playerName: string
  overallVideoRating: number
  talentIndicators: TalentIndicator[]
  keyMoments: VideoFrame[]
  summaryText: string
  recommendationLevel: 'high' | 'medium' | 'low' | 'insufficient_footage'
  combinedWithFormData?: ScoutingReport
}
