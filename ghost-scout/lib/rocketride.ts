import { PipelineStep } from './types'

export class RocketRideOrchestrator {
  private maxRetries: number

  constructor(maxRetries = 1) {
    this.maxRetries = maxRetries
  }

  async *run(
    steps: PipelineStep[],
    handlers: Record<string, (...args: unknown[]) => unknown>
  ): AsyncGenerator<PipelineStep> {
    for (const step of steps) {
      step.status = 'running'
      yield { ...step }

      const handler = handlers[step.id]
      if (!handler) {
        step.status = 'error'
        yield { ...step }
        continue
      }

      let lastError: unknown = null
      const startTime = Date.now()

      for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
        try {
          const result = await handler()
          step.status = 'complete'
          step.duration_ms = Date.now() - startTime
          step.output_preview = typeof result === 'string'
            ? result.substring(0, 200)
            : JSON.stringify(result).substring(0, 200)
          yield { ...step }
          lastError = null
          break
        } catch (err) {
          lastError = err
          if (attempt < this.maxRetries) {
            await new Promise(r => setTimeout(r, 500))
          }
        }
      }

      if (lastError) {
        step.status = 'error'
        step.duration_ms = Date.now() - startTime
        step.output_preview = lastError instanceof Error ? lastError.message : String(lastError)
        yield { ...step }
      }
    }
  }
}
