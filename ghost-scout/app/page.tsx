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

  const handleSubmit = async (player: PlayerInput) => {
    setIsLoading(true)
    setReport(null)
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
        alert(`Error: ${err.error || 'Something went wrong'}`)
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
              router.push(`/report/${event.report.id}`, { scroll: false })
            }
          } catch {
            // skip malformed events
          }
        }
      }
    } catch (err) {
      alert(`Network error: ${err instanceof Error ? err.message : 'Unknown'}`)
    } finally {
      setIsLoading(false)
    }
  }

  if (report) {
    return (
      <div className="min-h-screen bg-scout-dark">
        <div className="text-center pt-8">
          <button
            onClick={() => { setReport(null); setSteps([]) }}
            className="text-gray-400 hover:text-scout-accent transition-colors text-sm"
          >
            &larr; Scout another player
          </button>
        </div>
        <ReportCard report={report} />
        <EmailDraft email={report.email_draft} academy={report.matched_academy} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-scout-dark">
      <ScoutForm onSubmit={handleSubmit} isLoading={isLoading} />
      {isLoading && steps.length > 0 && <PipelineStatus steps={steps} />}
    </div>
  )
}
