'use client'

import { useEffect, useState, useMemo } from 'react'
import { VideoAnalysisResult as VideoResult, TalentIndicator } from '@/lib/types'
import { extractYouTubeVideoId } from '@/lib/videoValidation'

interface VideoAnalysisResultProps {
  result: VideoResult
  youtubeUrl?: string
}

// ── Recommendation badge styles ──

const BADGE_STYLES: Record<string, { bg: string; border: string; text: string; label: string }> = {
  high: {
    bg: 'bg-green-500/10',
    border: 'border-green-500/40',
    text: 'text-green-400',
    label: 'HIGH POTENTIAL',
  },
  medium: {
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/40',
    text: 'text-yellow-400',
    label: 'MEDIUM POTENTIAL',
  },
  low: {
    bg: 'bg-red-500/10',
    border: 'border-red-500/40',
    text: 'text-red-400',
    label: 'LOW POTENTIAL',
  },
  insufficient_footage: {
    bg: 'bg-gray-500/10',
    border: 'border-gray-500/40',
    text: 'text-gray-400',
    label: 'INSUFFICIENT FOOTAGE',
  },
}

const CATEGORY_COLORS: Record<string, string> = {
  technical: '#60a5fa',
  physical: '#34d399',
  tactical: '#facc15',
  psychological: '#c084fc',
}

const CATEGORY_LABELS: Record<string, string> = {
  technical: 'Technical',
  physical: 'Physical',
  tactical: 'Tactical',
  psychological: 'Psychological',
}

export default function VideoAnalysisResultCard({ result, youtubeUrl }: VideoAnalysisResultProps) {
  const badge = BADGE_STYLES[result.recommendationLevel] ?? BADGE_STYLES.insufficient_footage
  const videoId = youtubeUrl ? extractYouTubeVideoId(youtubeUrl) : null

  return (
    <div className="space-y-6">
      {/* Header: rating + badge */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">{result.playerName}</h2>
          <p className="text-sm text-gray-400 mt-0.5">Video Talent Analysis</p>
        </div>
        <div className="flex items-center gap-4">
          <AnimatedRating target={result.overallVideoRating} />
          <RecommendationBadge {...badge} />
        </div>
      </div>

      {/* Radar chart + indicators */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
            Talent Profile
          </h3>
          <RadarChart indicators={result.talentIndicators} />
        </div>

        <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
            Talent Indicators
          </h3>
          <TalentIndicatorList indicators={result.talentIndicators} />
        </div>
      </div>

      {/* Key moments */}
      {result.keyMoments.length > 0 && (
        <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
            Key Moments
          </h3>
          <div className="space-y-2">
            {result.keyMoments.map((m, i) => {
              const mins = Math.floor(m.timestamp / 60)
              const secs = Math.floor(m.timestamp % 60)
              const timeLabel = `${mins}:${String(secs).padStart(2, '0')}`
              const ytLink = videoId
                ? `https://www.youtube.com/watch?v=${videoId}&t=${Math.floor(m.timestamp)}s`
                : null

              return (
                <div key={i} className="flex gap-3 text-sm group">
                  {ytLink ? (
                    <a
                      href={ytLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-scout-accent font-mono shrink-0 w-14 hover:underline"
                    >
                      {timeLabel}
                    </a>
                  ) : (
                    <span className="text-scout-accent font-mono shrink-0 w-14">{timeLabel}</span>
                  )}
                  <span className="text-gray-300">{m.description}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
          Scouting Summary
        </h3>
        <div className="text-gray-300 leading-relaxed whitespace-pre-wrap">
          {renderSummaryMarkdown(result.summaryText)}
        </div>
      </div>
    </div>
  )
}

// ── Animated rating counter ──

function AnimatedRating({ target }: { target: number }) {
  const [value, setValue] = useState(0)

  useEffect(() => {
    if (target <= 0) return
    const duration = 1200
    const steps = 40
    const increment = target / steps
    let current = 0
    const interval = setInterval(() => {
      current += increment
      if (current >= target) {
        setValue(target)
        clearInterval(interval)
      } else {
        setValue(Math.round(current))
      }
    }, duration / steps)
    return () => clearInterval(interval)
  }, [target])

  const color =
    target >= 75 ? 'text-green-400' :
    target >= 50 ? 'text-yellow-400' :
    target >= 25 ? 'text-orange-400' :
    'text-red-400'

  return (
    <div className="text-right">
      <div className={`text-4xl font-black tabular-nums ${color}`}>{value}</div>
      <div className="text-[10px] text-gray-500 uppercase tracking-widest">Rating</div>
    </div>
  )
}

// ── Recommendation badge (stamp style) ──

function RecommendationBadge({ bg, border, text, label }: { bg: string; border: string; text: string; label: string }) {
  return (
    <div className={`px-4 py-2.5 rounded-lg border-2 ${bg} ${border} rotate-[-2deg] select-none`}>
      <div className={`text-sm font-black uppercase tracking-[0.15em] ${text}`}
        style={{ textShadow: '0 0 20px currentColor' }}
      >
        {label}
      </div>
    </div>
  )
}

// ── SVG Radar / Spider chart ──

function RadarChart({ indicators }: { indicators: TalentIndicator[] }) {
  const categories = ['technical', 'physical', 'tactical', 'psychological'] as const
  const categoryScores = useMemo(() => {
    return categories.map(cat => {
      const catIndicators = indicators.filter(t => t.category === cat && t.observed)
      if (catIndicators.length === 0) return 0
      const avg = catIndicators.reduce((sum, t) => sum + t.confidence, 0) / catIndicators.length
      return avg
    })
  }, [indicators])

  const cx = 120, cy = 120, r = 90
  const n = categories.length
  const angleStep = (2 * Math.PI) / n
  const startAngle = -Math.PI / 2

  const pointAt = (index: number, value: number) => {
    const angle = startAngle + index * angleStep
    return {
      x: cx + r * value * Math.cos(angle),
      y: cy + r * value * Math.sin(angle),
    }
  }

  const gridLevels = [0.25, 0.5, 0.75, 1.0]

  const dataPoints = categoryScores.map((score, i) => pointAt(i, score))
  const dataPath = dataPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z'

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 240 240" className="w-full max-w-[240px]">
        {/* Grid */}
        {gridLevels.map(level => {
          const pts = categories.map((_, i) => pointAt(i, level))
          const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z'
          return <path key={level} d={path} fill="none" stroke="#374151" strokeWidth={0.5} />
        })}

        {/* Axes */}
        {categories.map((_, i) => {
          const p = pointAt(i, 1)
          return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="#374151" strokeWidth={0.5} />
        })}

        {/* Data fill */}
        <path d={dataPath} fill="rgba(0,255,135,0.12)" stroke="#00ff87" strokeWidth={2} />

        {/* Data points */}
        {dataPoints.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={4} fill={CATEGORY_COLORS[categories[i]]} stroke="#0a0f1e" strokeWidth={2} />
        ))}

        {/* Labels */}
        {categories.map((cat, i) => {
          const labelPoint = pointAt(i, 1.22)
          return (
            <text
              key={cat}
              x={labelPoint.x}
              y={labelPoint.y}
              textAnchor="middle"
              dominantBaseline="middle"
              fill={CATEGORY_COLORS[cat]}
              fontSize={10}
              fontWeight={600}
            >
              {CATEGORY_LABELS[cat]}
            </text>
          )
        })}
      </svg>

      {/* Legend scores */}
      <div className="flex gap-4 mt-2">
        {categories.map((cat, i) => (
          <div key={cat} className="text-center">
            <div className="text-lg font-bold" style={{ color: CATEGORY_COLORS[cat] }}>
              {Math.round(categoryScores[i] * 100)}
            </div>
            <div className="text-[10px] text-gray-500 uppercase">{CATEGORY_LABELS[cat].slice(0, 4)}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Talent indicator list ──

function TalentIndicatorList({ indicators }: { indicators: TalentIndicator[] }) {
  const sorted = [...indicators].sort((a, b) => {
    if (a.observed !== b.observed) return a.observed ? -1 : 1
    return b.confidence - a.confidence
  })

  return (
    <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1 scrollbar-thin">
      {sorted.map((t, i) => (
        <div key={i} className="flex items-start gap-2.5 text-sm">
          <span className="shrink-0 mt-0.5 text-base leading-none">
            {t.observed ? '\u2705' : '\u26A0\uFE0F'}
          </span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span
                className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded"
                style={{
                  color: CATEGORY_COLORS[t.category],
                  backgroundColor: `${CATEGORY_COLORS[t.category]}15`,
                }}
              >
                {t.category.slice(0, 4)}
              </span>
              <span className="text-white font-medium truncate">{t.indicator}</span>
            </div>
            {t.evidence && (
              <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{t.evidence}</p>
            )}
          </div>
          <div className="shrink-0 w-16 flex items-center gap-1.5 mt-1">
            <div className="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${Math.round(t.confidence * 100)}%`,
                  backgroundColor: CATEGORY_COLORS[t.category],
                }}
              />
            </div>
            <span className="text-[10px] text-gray-500 tabular-nums w-7 text-right">
              {Math.round(t.confidence * 100)}%
            </span>
          </div>
        </div>
      ))}
      {sorted.length === 0 && (
        <p className="text-sm text-gray-500 text-center py-4">No indicators observed</p>
      )}
    </div>
  )
}

// ── Simple markdown renderer ──

function renderSummaryMarkdown(text: string): React.ReactNode {
  const parts = text.split(/(\*\*.*?\*\*)/g)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="text-white">{part.slice(2, -2)}</strong>
    }
    return part
  })
}
