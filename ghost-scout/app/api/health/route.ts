import { NextRequest, NextResponse } from 'next/server'

export async function GET(_req: NextRequest) {
  return NextResponse.json({
    status: 'ok',
    providers: ['gmi', 'gemini', 'rocketride'],
    timestamp: new Date().toISOString(),
  })
}
