'use client'

import { PipelineStep } from '@/lib/types'

interface PipelineStatusProps {
  steps: PipelineStep[]
}

const providerLabels: Record<string, string> = {
  gmi: 'GMI Cloud \u2014 NVIDIA H100',
  gemini: 'Google Gemini',
  rocketride: 'RocketRide',
}

const STEP_ICONS: Record<string, string> = {
  video_analysis: '\uD83C\uDFA5',
  video_pass_1: '\uD83D\uDC41\uFE0F',
  video_pass_2: '\uD83E\uDDE0',
  step5: '\uD83D\uDD00',
}

const PARALLEL_STEP_IDS = new Set(['step1', 'video_analysis'])

function getStepIcon(step: PipelineStep): string | null {
  return STEP_ICONS[step.id] ?? null
}

function isParallelStep(step: PipelineStep): boolean {
  return PARALLEL_STEP_IDS.has(step.id)
}

export default function PipelineStatus({ steps }: PipelineStatusProps) {
  const allComplete = steps.every(s => s.status === 'complete')
  const hasVideo = steps.some(s => s.id in STEP_ICONS || PARALLEL_STEP_IDS.has(s.id))

  const parallelGroup = hasVideo
    ? steps.filter(s => isParallelStep(s))
    : []
  const sequentialSteps = hasVideo
    ? steps.filter(s => !isParallelStep(s))
    : steps

  const showParallelBlock = parallelGroup.length > 1

  return (
    <div className="max-w-2xl mx-auto p-8" role="status" aria-live="polite" aria-label="Pipeline progress">
      <h2 className="text-xl font-bold text-white mb-6 text-center">
        {allComplete ? 'Pipeline Complete' : 'Agent Pipeline Running...'}
      </h2>
      <div className="space-y-3">
        {/* Parallel block */}
        {showParallelBlock && (
          <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-1.5">
            <div className="flex items-center gap-2 px-3 py-1.5 mb-1.5">
              <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">
                Running in parallel
              </span>
              <div className="flex-1 h-px bg-blue-500/20" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {parallelGroup.map(step => (
                <StepRow key={step.id} step={step} compact />
              ))}
            </div>
          </div>
        )}

        {/* Non-parallel parallel steps (fallback if only 1) */}
        {!showParallelBlock && parallelGroup.map(step => (
          <StepRow key={step.id} step={step} />
        ))}

        {/* Sequential steps */}
        {sequentialSteps.map(step => (
          <StepRow key={step.id} step={step} />
        ))}
      </div>
    </div>
  )
}

function StepRow({ step, compact }: { step: PipelineStep; compact?: boolean }) {
  const icon = getStepIcon(step)
  const statusLabel = `${step.name}: ${step.status}${step.duration_ms ? ` (${step.duration_ms}ms)` : ''}`

  return (
    <div
      aria-label={statusLabel}
      className={`flex items-start gap-3 rounded-lg border transition-all duration-500 ${
        compact ? 'p-3' : 'p-4'
      } ${
        step.status === 'complete'
          ? 'border-scout-accent/40 bg-scout-accent/5'
          : step.status === 'running'
          ? 'border-blue-500/40 bg-blue-500/5'
          : step.status === 'error'
          ? 'border-red-500/40 bg-red-500/5'
          : 'border-gray-700/40 bg-gray-900/30'
      }`}
    >
      <div className="flex-shrink-0 w-7 h-7 flex items-center justify-center mt-0.5">
        {step.status === 'complete' && (
          <svg className="w-5 h-5 text-scout-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        )}
        {step.status === 'running' && (
          <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
        )}
        {step.status === 'error' && (
          <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        )}
        {step.status === 'pending' && (
          <div className="w-4 h-4 rounded-full border-2 border-gray-600" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className={`font-semibold text-white ${compact ? 'text-sm' : ''} flex items-center gap-1.5`}>
            {icon && <span className="text-base">{icon}</span>}
            {step.name}
          </span>
          {step.duration_ms != null && (
            <span className="text-xs text-gray-400 shrink-0">{step.duration_ms}ms</span>
          )}
        </div>
        <span className="text-xs text-gray-500 mt-0.5 block">
          {providerLabels[step.provider] || step.provider}
        </span>
      </div>
    </div>
  )
}
