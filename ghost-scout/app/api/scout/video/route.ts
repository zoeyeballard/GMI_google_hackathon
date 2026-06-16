import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { v4 as uuidv4 } from 'uuid'
import { VideoAnalysisInput, VideoAnalysisResult } from '@/lib/types'
import { validateYouTubeUrl, analyzeYouTubeVideo, AnalysisProgress } from '@/lib/videoAnalysis'
import { videoReportStore } from '@/lib/reportStore'

const VideoAnalysisSchema = z.object({
  youtubeUrl: z.string().optional(),
  videoDescription: z.string().max(2000).optional(),
  playerName: z.string().min(2),
  age: z.number().min(10).max(18),
  country: z.string().min(2),
  position: z.string().min(2),
  language: z.string().optional(),
}).refine(
  (data) => !!data.youtubeUrl,
  { message: 'A YouTube URL is required', path: ['youtubeUrl'] },
)

export async function POST(req: NextRequest) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = VideoAnalysisSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.flatten() },
      { status: 400 },
    )
  }

  const input: VideoAnalysisInput = parsed.data
  if (input.youtubeUrl && !validateYouTubeUrl(input.youtubeUrl)) {
    return NextResponse.json(
      { error: 'Invalid YouTube URL' },
      { status: 400 },
    )
  }

  const reportId = uuidv4()

  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: unknown) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
      }

      const onProgress = (progress: AnalysisProgress) => {
        send({
          type: 'step',
          step: {
            id: `video_pass_${progress.pass}`,
            name: progress.label,
            status: progress.status,
            provider: 'gemini' as const,
          },
          ...(progress.data ? { observations: progress.data } : {}),
        })
      }

      try {
        const result = await analyzeYouTubeVideo(input, onProgress)
        const report: VideoAnalysisResult = { ...result, id: reportId }

        videoReportStore.set(reportId, report)
        send({ type: 'complete', report })
      } catch (err) {
        send({
          type: 'error',
          error: err instanceof Error ? err.message : 'Video analysis failed',
        })
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
  const report = videoReportStore.get(id)
  if (!report) {
    return NextResponse.json({ error: 'Video report not found' }, { status: 404 })
  }
  return NextResponse.json(report)
}
