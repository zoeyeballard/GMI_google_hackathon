import { getBenchmarks, calculatePercentile } from '../lib/benchmarks'
import { RocketRideOrchestrator } from '../lib/rocketride'
import { PlayerInput } from '../lib/types'

const mockPlayer: PlayerInput = {
  name: 'Amadou Diallo',
  age: 14,
  country: 'Senegal',
  position: 'winger',
  height_cm: 168,
  weight_kg: 58,
  dominant_foot: 'left',
  sprint_100m_seconds: 11.4,
  skills_description: 'Exceptional pace and close control. Beats defenders with ease. Raw but instinctive.',
  language: 'French',
}

describe('Phase 2: Data layer', () => {
  describe('Benchmarks', () => {
    it('returns benchmarks for age 14 winger', () => {
      const b = getBenchmarks(14, 'winger')
      expect(b).toHaveProperty('avg_sprint')
      expect(b).toHaveProperty('avg_height')
      expect(b).toHaveProperty('key_skills')
    })

    it('calculatePercentile returns value between 0 and 100', () => {
      const p = calculatePercentile(11.4, 12.1, 0.4)
      expect(p).toBeGreaterThanOrEqual(0)
      expect(p).toBeLessThanOrEqual(100)
    })

    it('faster sprint = higher percentile for sprint', () => {
      const fast = calculatePercentile(10.8, 12.1, 0.4)
      const slow = calculatePercentile(12.8, 12.1, 0.4)
      expect(fast).toBeGreaterThan(slow)
    })
  })

  describe('RocketRide orchestrator', () => {
    it('runs steps in sequence and emits status updates', async () => {
      const orchestrator = new RocketRideOrchestrator()
      const statuses: string[] = []

      const steps = [
        { id: 'step1', name: 'Benchmark Analysis', status: 'pending' as const, provider: 'gmi' as const },
        { id: 'step2', name: 'Player Comps', status: 'pending' as const, provider: 'gmi' as const },
      ]

      const handlers = {
        step1: async () => ({ result: 'benchmark done' }),
        step2: async () => ({ result: 'comps done' }),
      }

      for await (const step of orchestrator.run(steps, handlers)) {
        statuses.push(`${step.id}:${step.status}`)
      }

      expect(statuses).toContain('step1:running')
      expect(statuses).toContain('step1:complete')
      expect(statuses).toContain('step2:running')
      expect(statuses).toContain('step2:complete')
    })

    it('records duration_ms for completed steps', async () => {
      const orchestrator = new RocketRideOrchestrator()
      const steps = [
        { id: 's1', name: 'Test', status: 'pending' as const, provider: 'gmi' as const },
      ]
      const handlers = { s1: async () => 'done' }
      const results: any[] = []
      for await (const step of orchestrator.run(steps, handlers)) {
        results.push(step)
      }
      const completed = results.find(r => r.id === 's1' && r.status === 'complete')
      expect(completed?.duration_ms).toBeGreaterThanOrEqual(0)
    })
  })
})
