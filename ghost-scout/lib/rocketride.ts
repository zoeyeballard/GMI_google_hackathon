import { PipelineStep } from './types'

type StepHandler = (...args: unknown[]) => unknown

export class RocketRideOrchestrator {
  private maxRetries: number
  private stopOnError: boolean

  constructor(maxRetries = 1, stopOnError = true) {
    this.maxRetries = maxRetries
    this.stopOnError = stopOnError
  }

  async *run(
    steps: PipelineStep[],
    handlers: Record<string, StepHandler>
  ): AsyncGenerator<PipelineStep> {
    for (const step of steps) {
      step.status = 'running'
      yield { ...step }

      const handler = handlers[step.id]
      if (!handler) {
        step.status = 'error'
        yield { ...step }
        if (this.stopOnError) {
          throw new Error(`No handler for step: ${step.name}`)
        }
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
        if (this.stopOnError) {
          throw lastError instanceof Error ? lastError : new Error(String(lastError))
        }
      }
    }
  }

  /**
   * Run multiple step groups concurrently. Each group is an array of step IDs
   * that execute in parallel. Yields individual step updates as they happen,
   * then yields a parallel_group completion marker once all steps in the group finish.
   */
  async *runParallel(
    steps: PipelineStep[],
    handlers: Record<string, StepHandler>,
    parallelGroups: string[][],
  ): AsyncGenerator<PipelineStep | { type: 'parallel_complete'; stepIds: string[] }> {
    const stepMap = new Map(steps.map(s => [s.id, s]))
    const executed = new Set<string>()

    for (const group of parallelGroups) {
      const groupSteps = group
        .map(id => stepMap.get(id))
        .filter((s): s is PipelineStep => !!s)

      if (groupSteps.length === 0) continue

      if (groupSteps.length === 1) {
        const step = groupSteps[0]!
        yield* this.runSingleStep(step, handlers[step.id])
        executed.add(step.id)
        continue
      }

      for (const step of groupSteps) {
        step.status = 'running'
      }

      const updates: PipelineStep[] = []
      const promises = groupSteps.map(async (step) => {
        const handler = handlers[step.id]
        if (!handler) {
          step.status = 'error'
          updates.push({ ...step })
          return
        }

        const startTime = Date.now()
        let lastError: unknown = null

        for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
          try {
            const result = await handler()
            step.status = 'complete'
            step.duration_ms = Date.now() - startTime
            step.output_preview = typeof result === 'string'
              ? result.substring(0, 200)
              : JSON.stringify(result).substring(0, 200)
            updates.push({ ...step })
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
          updates.push({ ...step })
        }
      })

      await Promise.allSettled(promises)

      for (const update of updates) {
        yield update
        executed.add(update.id)
      }

      yield { type: 'parallel_complete' as const, stepIds: group }
    }

    // Run any remaining steps sequentially
    for (const step of steps) {
      if (executed.has(step.id)) continue
      yield* this.runSingleStep(step, handlers[step.id])
    }
  }

  private async *runSingleStep(
    step: PipelineStep,
    handler: StepHandler | undefined,
  ): AsyncGenerator<PipelineStep> {
    step.status = 'running'
    yield { ...step }

    if (!handler) {
      step.status = 'error'
      yield { ...step }
      if (this.stopOnError) throw new Error(`No handler for step: ${step.name}`)
      return
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
        return
      } catch (err) {
        lastError = err
        if (attempt < this.maxRetries) {
          await new Promise(r => setTimeout(r, 500))
        }
      }
    }

    step.status = 'error'
    step.duration_ms = Date.now() - startTime
    step.output_preview = lastError instanceof Error ? lastError.message : String(lastError)
    yield { ...step }
    if (this.stopOnError) {
      throw lastError instanceof Error ? lastError : new Error(String(lastError))
    }
  }
}
