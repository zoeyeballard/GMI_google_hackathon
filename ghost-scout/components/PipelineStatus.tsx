'use client'

import { PipelineStep } from '@/lib/types'

interface PipelineStatusProps {
  steps: PipelineStep[]
}

const providerLabels: Record<string, string> = {
  gmi: 'GMI Cloud — NVIDIA H100',
  gemini: 'Google Gemini',
  rocketride: 'RocketRide',
}

export default function PipelineStatus({ steps }: PipelineStatusProps) {
  return (
    <div className="max-w-2xl mx-auto p-8">
      <h2 className="text-xl font-bold text-white mb-6 text-center">
        Agent Pipeline Running...
      </h2>
      <div className="space-y-4">
        {steps.map((step, index) => (
          <div
            key={step.id}
            className={`flex items-start gap-4 p-4 rounded-lg border transition-all duration-500 ${
              step.status === 'complete'
                ? 'border-scout-accent/40 bg-scout-accent/5'
                : step.status === 'running'
                ? 'border-blue-500/40 bg-blue-500/5'
                : step.status === 'error'
                ? 'border-red-500/40 bg-red-500/5'
                : 'border-gray-700/40 bg-gray-900/30'
            }`}
          >
            <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center mt-0.5">
              {step.status === 'complete' && (
                <svg className="w-6 h-6 text-scout-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
              {step.status === 'running' && (
                <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
              )}
              {step.status === 'error' && (
                <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
              {step.status === 'pending' && (
                <div className="w-5 h-5 rounded-full border-2 border-gray-600" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white">
                  Step {index + 1}:{' '}<span>{step.name}</span>
                </span>
                {step.duration_ms != null && (
                  <span className="text-xs text-gray-400">{step.duration_ms}ms</span>
                )}
              </div>
              <span className="text-xs text-gray-500 mt-0.5 block">
                {providerLabels[step.provider] || step.provider}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
