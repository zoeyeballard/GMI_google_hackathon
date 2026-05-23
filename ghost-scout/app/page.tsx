'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import ScoutForm from '@/components/ScoutForm'
import PipelineStatus from '@/components/PipelineStatus'
import ReportCard from '@/components/ReportCard'
import EmailDraft from '@/components/EmailDraft'
import { PlayerInput, PipelineStep, ScoutingReport } from '@/lib/types'

export default function Home() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [steps, setSteps] = useState<PipelineStep[]>([])
  const [report, setReport] = useState<ScoutingReport | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (player: PlayerInput) => {
    setIsLoading(true)
    setReport(null)
    setError(null)
    setSteps([
      { id: 'step1', name: 'Benchmark Analysis', status: 'pending', provider: 'gmi' },
      { id: 'step2', name: 'Player Comps', status: 'pending', provider: 'gmi' },
      { id: 'step3', name: 'Scouting Report', status: 'pending', provider: 'gemini' },
      { id: 'step4', name: 'Academy Email', status: 'pending', provider: 'gemini' },
    ])

    try {
      const res = await fetch('/api/scout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ player }),
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
                prev.map(s => (s.id === event.step.id ? event.step : s))
              )
            } else if (event.type === 'complete') {
              setReport(event.report)
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
  }

  const hasErrors = steps.some(s => s.status === 'error')

  if (report) {
    return (
      <div className="min-h-screen bg-scout-dark">
        <div className="text-center pt-8 flex items-center justify-center gap-4">
          <button
            onClick={() => { setReport(null); setSteps([]); setError(null) }}
            className="text-gray-400 hover:text-scout-accent transition-colors text-sm"
          >
            &larr; Scout another player
          </button>
          <button
            onClick={() => router.push(`/report/${report.id}`)}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-scout-accent/10 border border-scout-accent text-scout-accent hover:bg-scout-accent/20 transition-colors"
          >
            View Permalink
          </button>
        </div>
        <ReportCard report={report} />
        <EmailDraft email={report.email_draft} academy={report.matched_academy} academyMatches={report.matched_academies} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-scout-dark">
      <ScoutForm onSubmit={handleSubmit} isLoading={isLoading} />
      {steps.length > 0 && <PipelineStatus steps={steps} />}
      {(error || hasErrors) && !isLoading && (
        <div className="max-w-2xl mx-auto px-8 pb-8">
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6 text-center">
            <h3 className="text-red-400 font-semibold text-lg mb-2">Pipeline Error</h3>
            <p className="text-gray-300 text-sm mb-4">
              {error || 'One or more steps failed. This usually means the AI provider is temporarily unavailable.'}
            </p>
            <button
              onClick={() => { setSteps([]); setError(null) }}
              className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-700 text-gray-300 hover:border-scout-accent hover:text-scout-accent transition-colors"
            >
              Try again
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
