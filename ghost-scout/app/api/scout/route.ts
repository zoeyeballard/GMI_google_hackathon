import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { v4 as uuidv4 } from 'uuid'
import { RocketRideOrchestrator } from '@/lib/rocketride'
import { analyzeWithBenchmarks, generatePlayerComps } from '@/lib/gmi'
import { generateScoutingReport, generateAcademyEmail, synthesizeCombinedReport } from '@/lib/gemini'
import { getBenchmarks } from '@/lib/benchmarks'
import { matchAcademy, matchAcademies } from '@/lib/academy'
import { analyzeYouTubeVideo } from '@/lib/videoAnalysis'
import { validateYouTubeUrl } from '@/lib/videoAnalysis'
import {
  PlayerInput, ScoutingReport, PipelineStep, BenchmarkResult,
  PlayerComp, AcademyMatch, VideoAnalysisResult, VideoAnalysisInput,
} from '@/lib/types'
import { reportStore } from '@/lib/reportStore'

const PlayerInputSchema = z.object({
  name: z.string().min(2),
  age: z.number().min(10).max(18),
  country: z.string().min(2),
  position: z.enum(['goalkeeper', 'defender', 'midfielder', 'winger', 'striker']),
  height_cm: z.number().min(140).max(200),
  weight_kg: z.number().min(30).max(100),
  dominant_foot: z.enum(['left', 'right', 'both']),
  sprint_100m_seconds: z.number().min(9).max(16).optional(),
  skills_description: z.string().min(20).max(1000),
  language: z.string().min(2),
})

const VideoInputSchema = z.object({
  youtubeUrl: z.string().min(1),
  videoDescription: z.string().max(2000).optional(),
  playerName: z.string().min(2),
  age: z.number().min(10).max(18),
  country: z.string().min(2),
  position: z.string().min(2),
  language: z.string().optional(),
})

export async function POST(req: NextRequest) {
  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json(
      { error: 'Server misconfigured: GEMINI_API_KEY is not set. Please add it to .env.local and restart.' },
      { status: 503 },
    )
  }

  let body: { player?: unknown; video?: unknown }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const hasPlayer = !!body.player
  const hasVideo = !!body.video

  if (!hasPlayer && !hasVideo) {
    return NextResponse.json(
      { error: 'At least one of player or video must be provided' },
      { status: 400 },
    )
  }

  let player: PlayerInput | undefined
  let videoInput: VideoAnalysisInput | undefined

  if (hasPlayer) {
    const parsed = PlayerInputSchema.safeParse(body.player)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Player validation failed', details: parsed.error.flatten() },
        { status: 400 },
      )
    }
    player = parsed.data
  }

  if (hasVideo) {
    const parsed = VideoInputSchema.safeParse(body.video)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Video validation failed', details: parsed.error.flatten() },
        { status: 400 },
      )
    }
    if (!validateYouTubeUrl(parsed.data.youtubeUrl)) {
      return NextResponse.json({ error: 'Invalid YouTube URL' }, { status: 400 })
    }
    videoInput = parsed.data
  }

  if (hasPlayer && !hasVideo) {
    return streamFormOnlyPipeline(player!)
  }
  if (hasVideo && !hasPlayer) {
    return streamVideoOnlyPipeline(videoInput!)
  }
  return streamCombinedPipeline(player!, videoInput!)
}

// ── Flow 1: Form only (original behavior) ──

function streamFormOnlyPipeline(player: PlayerInput): Response {
  const reportId = uuidv4()
  const academy = matchAcademy(player.position, player.dominant_foot, player.country)
  const benchmarks = getBenchmarks(player.age, player.position)

  let benchmarkResult: BenchmarkResult
  let academyMatches: AcademyMatch[] = []
  let comps: PlayerComp[]
  let reportTexts: { english: string; native: string }
  let emailDraft: string

  const steps: PipelineStep[] = [
    { id: 'step1', name: 'Benchmark Analysis', status: 'pending', provider: 'gmi' },
    { id: 'step2', name: 'Player Comps', status: 'pending', provider: 'gmi' },
    { id: 'step3', name: 'Scouting Report', status: 'pending', provider: 'gemini' },
    { id: 'step4', name: 'Academy Email', status: 'pending', provider: 'gemini' },
  ]

  return sseResponse(async (send) => {
    const orchestrator = new RocketRideOrchestrator()
    const handlers = {
      step1: async () => {
        benchmarkResult = await analyzeWithBenchmarks(player, benchmarks)
        try {
          academyMatches = matchAcademies({ player, rating: benchmarkResult.overall_rating })
        } catch {
          academyMatches = []
        }
        return benchmarkResult
      },
      step2: async () => {
        comps = await generatePlayerComps(player, benchmarkResult)
        return comps
      },
      step3: async () => {
        reportTexts = await generateScoutingReport(player, benchmarkResult, comps)
        return reportTexts
      },
      step4: async () => {
        emailDraft = await generateAcademyEmail(reportTexts.english, player, academy)
        return emailDraft
      },
    }

    for await (const stepUpdate of orchestrator.run(steps, handlers)) {
      send({ type: 'step', step: stepUpdate })
    }

    const report: ScoutingReport = {
      id: reportId,
      generated_at: new Date().toISOString(),
      player,
      benchmark: benchmarkResult!,
      comps: comps!,
      report_english: reportTexts!.english,
      report_native: reportTexts!.native,
      matched_academy: academyMatches[0]?.name || academy,
      matched_academies: academyMatches,
      email_draft: emailDraft!,
      pipeline_steps: steps,
    }

    reportStore.set(reportId, report)
    send({ type: 'complete', report })
  })
}

// ── Flow 2: Video only ──

function streamVideoOnlyPipeline(videoInput: VideoAnalysisInput): Response {
  const reportId = uuidv4()

  const steps: PipelineStep[] = [
    { id: 'video_pass_1', name: 'Video Observation', status: 'pending', provider: 'gemini' },
    { id: 'video_pass_2', name: 'Talent Assessment', status: 'pending', provider: 'gemini' },
  ]

  return sseResponse(async (send) => {
    for (const step of steps) {
      send({ type: 'step', step })
    }

    const result = await analyzeYouTubeVideo(videoInput, (progress) => {
      const stepId = `video_pass_${progress.pass}`
      send({
        type: 'step',
        step: { id: stepId, name: progress.label, status: progress.status, provider: 'gemini' as const },
      })
    })

    const report: VideoAnalysisResult = { ...result, id: reportId }
    send({ type: 'complete', report, reportType: 'video' })
  })
}

// ── Flow 3: Combined (parallel form + video → synthesis) ──

function streamCombinedPipeline(player: PlayerInput, videoInput: VideoAnalysisInput): Response {
  const reportId = uuidv4()
  const academy = matchAcademy(player.position, player.dominant_foot, player.country)
  const benchmarks = getBenchmarks(player.age, player.position)

  let benchmarkResult: BenchmarkResult
  let academyMatches: AcademyMatch[] = []
  let comps: PlayerComp[]
  let reportTexts: { english: string; native: string }
  let emailDraft: string
  let videoResult: VideoAnalysisResult

  const steps: PipelineStep[] = [
    { id: 'step1', name: 'Benchmark Analysis', status: 'pending', provider: 'gmi' },
    { id: 'step2', name: 'Player Comps', status: 'pending', provider: 'gmi' },
    { id: 'video_analysis', name: 'Video Analysis', status: 'pending', provider: 'gemini' },
    { id: 'step3', name: 'Scouting Report', status: 'pending', provider: 'gemini' },
    { id: 'step4', name: 'Academy Email', status: 'pending', provider: 'gemini' },
    { id: 'step5', name: 'Combined Synthesis', status: 'pending', provider: 'gemini' },
  ]

  return sseResponse(async (send) => {
    for (const step of steps) {
      send({ type: 'step', step })
    }

    const orchestrator = new RocketRideOrchestrator()
    const handlers = {
      step1: async () => {
        benchmarkResult = await analyzeWithBenchmarks(player, benchmarks)
        try {
          academyMatches = matchAcademies({ player, rating: benchmarkResult.overall_rating })
        } catch {
          academyMatches = []
        }
        return benchmarkResult
      },
      step2: async () => {
        comps = await generatePlayerComps(player, benchmarkResult)
        return comps
      },
      video_analysis: async () => {
        videoResult = await analyzeYouTubeVideo(videoInput, (progress) => {
          send({
            type: 'step',
            step: {
              id: 'video_analysis',
              name: `Video: ${progress.label}`,
              status: progress.status === 'complete' && progress.pass === 1 ? 'running' : progress.status,
              provider: 'gemini' as const,
            },
          })
        })
        return videoResult
      },
      step3: async () => {
        reportTexts = await generateScoutingReport(player, benchmarkResult, comps)
        return reportTexts
      },
      step4: async () => {
        emailDraft = await generateAcademyEmail(reportTexts.english, player, academy)
        return emailDraft
      },
      step5: async () => {
        const synthesis = await synthesizeCombinedReport(player, benchmarkResult, videoResult)
        return synthesis
      },
    }

    // Parallel group: form pipeline (step1→step2) runs concurrently with video_analysis
    // Then step3, step4 run sequentially (they depend on step1+step2 results)
    // Then step5 runs last (needs both form + video results)
    const parallelGroups = [
      ['step1', 'video_analysis'],  // benchmark + video in parallel
      ['step2'],                     // comps (needs benchmark)
      ['step3'],                     // report (needs comps)
      ['step4'],                     // email (needs report)
      ['step5'],                     // synthesis (needs everything)
    ]

    for await (const update of orchestrator.runParallel(steps, handlers, parallelGroups)) {
      if ('type' in update && update.type === 'parallel_complete') {
        const parallelSteps = steps.filter(s => update.stepIds.includes(s.id))
        send({
          type: 'parallel_step',
          steps: parallelSteps,
          allComplete: parallelSteps.every(s => s.status === 'complete'),
        })
      } else {
        send({ type: 'step', step: update })
      }
    }

    const synthesisOutput = steps.find(s => s.id === 'step5')?.output_preview ?? ''

    const report: ScoutingReport = {
      id: reportId,
      generated_at: new Date().toISOString(),
      player,
      benchmark: benchmarkResult!,
      comps: comps!,
      report_english: reportTexts!.english + '\n\n---\n\n## Combined Video + Stats Analysis\n\n' + synthesisOutput,
      report_native: reportTexts!.native,
      matched_academy: academyMatches[0]?.name || academy,
      matched_academies: academyMatches,
      email_draft: emailDraft!,
      pipeline_steps: steps,
    }

    const videoReport: VideoAnalysisResult = {
      ...videoResult!,
      id: reportId,
      combinedWithFormData: report,
    }

    reportStore.set(reportId, { ...report, videoAnalysis: videoReport } as ScoutingReport & { videoAnalysis: VideoAnalysisResult })
    send({ type: 'complete', report, videoAnalysis: videoReport })
  })
}

// ── Shared helpers ──

function sseResponse(handler: (send: (data: unknown) => void) => Promise<void>): Response {
  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: unknown) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
      }
      try {
        await handler(send)
      } catch (err) {
        send({ type: 'error', error: err instanceof Error ? err.message : 'Pipeline failed' })
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  })
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const id = url.searchParams.get('id')
  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  }
  const report = reportStore.get(id)
  if (!report) {
    return NextResponse.json({ error: 'Report not found' }, { status: 404 })
  }
  return NextResponse.json(report)
}
