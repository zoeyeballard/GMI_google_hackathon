import { NextRequest, NextResponse } from 'next/server'
import { testGMIConnection } from '@/lib/gmi'

const HEALTH_CHECK_TIMEOUT_MS = 4000

export async function GET(_req: NextRequest) {
  let gmi: { ok: boolean; models: string[]; error?: string }

  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), HEALTH_CHECK_TIMEOUT_MS)

    try {
      gmi = await testGMIConnection(controller.signal)
    } catch {
      gmi = { ok: false, models: [], error: 'health check timeout' }
    } finally {
      clearTimeout(timer)
    }
  } catch {
    gmi = { ok: false, models: [], error: 'unexpected failure' }
  }

  return NextResponse.json({
    status: 'ok',
    providers: ['gmi', 'gemini', 'rocketride'],
    gmi,
    timestamp: new Date().toISOString(),
  })
}
