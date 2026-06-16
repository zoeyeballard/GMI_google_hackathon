'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { VideoAnalysisResult } from '@/lib/types'

const CATEGORY_COLORS: Record<string, string> = {
  technical: 'text-blue-400',
  physical: 'text-green-400',
  tactical: 'text-yellow-400',
  psychological: 'text-purple-400',
}

function RatingBadge({ level }: { level: VideoAnalysisResult['recommendationLevel'] }) {
  const styles: Record<string, string> = {
    high: 'bg-green-500/20 text-green-400 border-green-500/30',
    medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    low: 'bg-red-500/20 text-red-400 border-red-500/30',
    insufficient_footage: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  }

  return (
    <span className={`px-3 py-1 rounded-full border text-xs font-medium uppercase tracking-wider ${styles[level]}`}>
      {level.replace('_', ' ')}
    </span>
  )
}

export default function VideoReportPage() {
  const params = useParams<{ id: string }>()
  const [report, setReport] = useState<VideoAnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchReport() {
      try {
        const res = await fetch(`/api/scout/video?id=${params.id}`)
        if (res.ok) {
          setReport(await res.json())
          return
        }
      } catch {
        // fall through to sessionStorage
      }

      const cached = sessionStorage.getItem(`video-report:${params.id}`)
      if (cached) {
        try {
          setReport(JSON.parse(cached))
          return
        } catch {
          // corrupted cache
        }
      }

      setError('Video report not found — it may have expired. Submit a new video from the home page.')
    }
    fetchReport().finally(() => setLoading(false))
  }, [params.id])

  if (loading) {
    return (
      <div className="min-h-screen bg-scout-dark flex items-center justify-center">
        <div className="text-gray-400 text-sm animate-pulse">Loading video report...</div>
      </div>
    )
  }

  if (error || !report) {
    return (
      <div className="min-h-screen bg-scout-dark flex flex-col items-center justify-center gap-4">
        <p className="text-red-400">{error || 'Report not found'}</p>
        <Link href="/" className="text-scout-accent hover:underline text-sm">&larr; Back to Scout</Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-scout-dark text-white">
      <div className="text-center pt-8">
        <Link href="/" className="text-gray-400 hover:text-scout-accent transition-colors text-sm">
          &larr; Back to Scout
        </Link>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{report.playerName}</h1>
            <p className="text-gray-400 text-sm mt-1">Video Analysis Report</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-3xl font-bold text-scout-accent">{report.overallVideoRating}</div>
              <div className="text-xs text-gray-500 uppercase">Rating</div>
            </div>
            <RatingBadge level={report.recommendationLevel} />
          </div>
        </div>

        {/* Summary */}
        <div className="bg-white/5 rounded-xl p-6 border border-white/10">
          <h2 className="text-lg font-semibold mb-3">Summary</h2>
          <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">{report.summaryText}</p>
        </div>

        {/* Talent Indicators */}
        <div className="bg-white/5 rounded-xl p-6 border border-white/10">
          <h2 className="text-lg font-semibold mb-4">Talent Indicators</h2>
          <div className="space-y-3">
            {report.talentIndicators.filter(t => t.observed).map((t, i) => (
              <div key={i} className="flex items-start gap-3 text-sm">
                <span className={`font-medium w-24 shrink-0 ${CATEGORY_COLORS[t.category] ?? 'text-gray-400'}`}>
                  {t.category}
                </span>
                <span className="text-white font-medium w-40 shrink-0">{t.indicator}</span>
                <span className="text-gray-400 flex-1">{t.evidence}</span>
                <span className="text-gray-500 shrink-0">{Math.round(t.confidence * 100)}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Key Moments */}
        <div className="bg-white/5 rounded-xl p-6 border border-white/10">
          <h2 className="text-lg font-semibold mb-4">Key Moments</h2>
          <div className="space-y-2">
            {report.keyMoments.map((m, i) => (
              <div key={i} className="flex gap-3 text-sm">
                <span className="text-scout-accent font-mono shrink-0 w-16">
                  {Math.floor(m.timestamp / 60)}:{String(Math.floor(m.timestamp % 60)).padStart(2, '0')}
                </span>
                <span className="text-gray-300">{m.description}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
