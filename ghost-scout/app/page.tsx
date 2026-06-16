'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import ScoutForm from '@/components/ScoutForm'
import PipelineStatus from '@/components/PipelineStatus'
import ReportCard from '@/components/ReportCard'
import EmailDraft from '@/components/EmailDraft'
import VideoAnalysisResultCard from '@/components/VideoAnalysisResult'
import { PlayerInput, PipelineStep, ScoutingReport, VideoAnalysisInput, VideoAnalysisResult } from '@/lib/types'

type ResultTab = 'report' | 'video' | 'email'

export default function Home() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [steps, setSteps] = useState<PipelineStep[]>([])
  const [report, setReport] = useState<ScoutingReport | null>(null)
  const [videoResult, setVideoResult] = useState<VideoAnalysisResult | null>(null)
  const [videoUrl, setVideoUrl] = useState<string | undefined>()
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<ResultTab>('report')
  const [lastSubmission, setLastSubmission] = useState<{ player: PlayerInput; video?: VideoAnalysisInput } | null>(null)

  const handleSubmit = useCallback(async (player: PlayerInput, video?: VideoAnalysisInput) => {
    setIsLoading(true)
    setReport(null)
    setVideoResult(null)
    setError(null)
    setActiveTab('report')
    setVideoUrl(video?.youtubeUrl)
    setLastSubmission({ player, video })

    const hasVideo = !!video
    const initialSteps: PipelineStep[] = hasVideo
      ? [
          { id: 'step1', name: 'Benchmark Analysis', status: 'pending', provider: 'gmi' },
          { id: 'step2', name: 'Player Comps', status: 'pending', provider: 'gmi' },
          { id: 'video_analysis', name: 'Video Analysis', status: 'pending', provider: 'gemini' },
          { id: 'step3', name: 'Scouting Report', status: 'pending', provider: 'gemini' },
          { id: 'step4', name: 'Academy Email', status: 'pending', provider: 'gemini' },
          { id: 'step5', name: 'Combined Synthesis', status: 'pending', provider: 'gemini' },
        ]
      : [
          { id: 'step1', name: 'Benchmark Analysis', status: 'pending', provider: 'gmi' },
          { id: 'step2', name: 'Player Comps', status: 'pending', provider: 'gmi' },
          { id: 'step3', name: 'Scouting Report', status: 'pending', provider: 'gemini' },
          { id: 'step4', name: 'Academy Email', status: 'pending', provider: 'gemini' },
        ]
    setSteps(initialSteps)

    try {
      const res = await fetch('/api/scout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ player, ...(video ? { video } : {}) }),
      })

      if (!res.ok) {
        const err = await res.json()
        setError(err.error || 'Something went wrong')
        setIsLoading(false)
        return
      }

      const reader = res.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) return

      let buffer = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          const dataLine = line.replace(/^data: /, '').trim()
          if (!dataLine) continue

          try {
            const event = JSON.parse(dataLine)
            if (event.type === 'step') {
              setSteps(prev =>
                prev.map(s => (s.id === event.step.id ? { ...s, ...event.step } : s))
              )
            } else if (event.type === 'parallel_step') {
              setSteps(prev =>
                prev.map(s => {
                  const update = (event.steps as PipelineStep[]).find(u => u.id === s.id)
                  return update ? { ...s, ...update } : s
                })
              )
            } else if (event.type === 'complete') {
              setReport(event.report)
              if (event.videoAnalysis) {
                setVideoResult(event.videoAnalysis)
              }
              sessionStorage.setItem(`report:${event.report.id}`, JSON.stringify(event.report))
              setTimeout(() => {
                router.push(`/report/${event.report.id}`)
              }, 1500)
            } else if (event.type === 'error') {
              setError(event.error)
            }
          } catch {
            // skip malformed events
          }
        }
      }
    } catch (err) {
      setError(`Network error: ${err instanceof Error ? err.message : 'Unknown'}`)
    } finally {
      setIsLoading(false)
    }
  }, [router])

  const handleRetry = () => {
    if (lastSubmission) {
      handleSubmit(lastSubmission.player, lastSubmission.video)
    }
  }

  const handleReset = () => {
    setSteps([])
    setError(null)
    setReport(null)
    setVideoResult(null)
    setLastSubmission(null)
  }

  const hasErrors = steps.some(s => s.status === 'error')
  const isCombined = !!report && !!videoResult

  if (report) {
    const tabs: { id: ResultTab; label: string; available: boolean }[] = [
      { id: 'report', label: 'Scouting Report', available: true },
      { id: 'video', label: 'Video Analysis', available: !!videoResult },
      { id: 'email', label: 'Email Draft', available: true },
    ]

    return (
      <div className="min-h-screen bg-scout-dark">
        {/* Top bar */}
        <div className="text-center pt-8 flex items-center justify-center gap-4">
          <button
            onClick={handleReset}
            aria-label="Scout another player"
            className="text-gray-400 hover:text-scout-accent transition-colors text-sm"
          >
            &larr; Scout another player
          </button>
          <button
            onClick={() => router.push(`/report/${report.id}`)}
            aria-label="View permanent link to this report"
            className="px-4 py-2 text-sm font-medium rounded-lg bg-scout-accent/10 border border-scout-accent text-scout-accent hover:bg-scout-accent/20 transition-colors"
          >
            View Permalink
          </button>
        </div>

        {/* Tabs */}
        <div className="max-w-5xl mx-auto px-6 pt-6">
          <div className="flex border-b border-gray-800">
            {tabs.filter(t => t.available).map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                aria-label={`Show ${tab.label} tab`}
                aria-selected={activeTab === tab.id}
                role="tab"
                className={`px-5 py-3 text-sm font-medium transition-colors relative ${
                  activeTab === tab.id
                    ? 'text-scout-accent'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-scout-accent" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Tab content */}
        {activeTab === 'report' && !isCombined && (
          <ReportCard report={report} />
        )}

        {activeTab === 'report' && isCombined && (
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              <div>
                <ReportCard report={report} />
              </div>
              <div>
                <VideoAnalysisResultCard result={videoResult!} youtubeUrl={videoUrl} />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'video' && videoResult && (
          <div className="max-w-4xl mx-auto px-6 py-8">
            <VideoAnalysisResultCard result={videoResult} youtubeUrl={videoUrl} />
          </div>
        )}

        {activeTab === 'email' && (
          <EmailDraft email={report.email_draft} academy={report.matched_academy} academyMatches={report.matched_academies} />
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-scout-dark">
      <ScoutForm onSubmit={handleSubmit} isLoading={isLoading} />

      {/* Pipeline + skeleton during loading */}
      {steps.length > 0 && (
        <>
          <PipelineStatus steps={steps} />
          {isLoading && <ReportSkeleton />}
        </>
      )}

      {/* Error with retry */}
      {(error || hasErrors) && !isLoading && (
        <div className="max-w-2xl mx-auto px-8 pb-8">
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6 text-center">
            <h3 className="text-red-400 font-semibold text-lg mb-2">Pipeline Error</h3>
            <p className="text-gray-300 text-sm mb-4">
              {error || 'One or more steps failed. This usually means the AI provider is temporarily unavailable.'}
            </p>
            <div className="flex items-center justify-center gap-3">
              {lastSubmission && (
                <button
                  onClick={handleRetry}
                  aria-label="Retry scouting report with same data"
                  className="px-5 py-2 text-sm font-medium rounded-lg bg-scout-accent text-scout-dark hover:bg-green-400 transition-colors"
                >
                  Retry with same data
                </button>
              )}
              <button
                onClick={handleReset}
                aria-label="Reset form and start over"
                className="px-5 py-2 text-sm font-medium rounded-lg border border-gray-700 text-gray-300 hover:border-scout-accent hover:text-scout-accent transition-colors"
              >
                Start over
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Loading Skeleton ──

function SkeletonBlock({ className }: { className?: string }) {
  return (
    <div className={`bg-gray-800/60 rounded-lg animate-pulse ${className ?? ''}`} />
  )
}

function ReportSkeleton() {
  return (
    <div className="max-w-4xl mx-auto px-8 pb-12 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <SkeletonBlock className="h-8 w-48" />
          <SkeletonBlock className="h-4 w-36" />
        </div>
        <SkeletonBlock className="h-14 w-32 rounded-lg" />
      </div>

      {/* Percentile bar */}
      <SkeletonBlock className="h-24 w-full" />

      {/* Attributes grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <SkeletonBlock className="h-28" />
        <SkeletonBlock className="h-28" />
      </div>

      {/* Comps */}
      <div>
        <SkeletonBlock className="h-5 w-40 mb-4" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <SkeletonBlock className="h-24" />
          <SkeletonBlock className="h-24" />
          <SkeletonBlock className="h-24" />
        </div>
      </div>

      {/* Report text */}
      <div className="space-y-3">
        <SkeletonBlock className="h-5 w-44" />
        <SkeletonBlock className="h-64 w-full" />
      </div>
    </div>
  )
}
