import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { v4 as uuidv4 } from 'uuid'
import { RocketRideOrchestrator } from '@/lib/rocketride'
import { analyzeWithBenchmarks, generatePlayerComps } from '@/lib/gmi'
import { generateScoutingReport, generateAcademyEmail } from '@/lib/gemini'
import { getBenchmarks } from '@/lib/benchmarks'
import { matchAcademy } from '@/lib/academy'
import { PlayerInput, ScoutingReport, PipelineStep, BenchmarkResult, PlayerComp } from '@/lib/types'

const reportStore = new Map<string, ScoutingReport>()

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


export async function POST(req: NextRequest) {
  let body: { player?: unknown }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = PlayerInputSchema.safeParse(body.player)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const player: PlayerInput = parsed.data
  const reportId = uuidv4()
  const academy = matchAcademy(player.position, player.dominant_foot, player.country)
  const benchmarks = getBenchmarks(player.age, player.position)

  let benchmarkResult: BenchmarkResult
  let comps: PlayerComp[]
  let reportTexts: { english: string; native: string }
  let emailDraft: string

  const steps: PipelineStep[] = [
    { id: 'step1', name: 'Benchmark Analysis', status: 'pending', provider: 'gmi' },
    { id: 'step2', name: 'Player Comps', status: 'pending', provider: 'gmi' },
    { id: 'step3', name: 'Scouting Report', status: 'pending', provider: 'gemini' },
    { id: 'step4', name: 'Academy Email', status: 'pending', provider: 'gemini' },
  ]

  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: unknown) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
      }

      const orchestrator = new RocketRideOrchestrator()
      const handlers = {
        step1: async () => {
          benchmarkResult = await analyzeWithBenchmarks(player, benchmarks)
          return benchmarkResult
        },
        step2: async () => {
          comps = await generatePlayerComps(player, benchmarkResult!)
          return comps
        },
        step3: async () => {
          reportTexts = await generateScoutingReport(player, benchmarkResult!, comps!)
          return reportTexts
        },
        step4: async () => {
          emailDraft = await generateAcademyEmail(reportTexts!.english, player, academy)
          return emailDraft
        },
      }

      try {
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
          matched_academy: academy,
          email_draft: emailDraft!,
          pipeline_steps: steps,
        }

        reportStore.set(reportId, report)
        send({ type: 'complete', report })
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
