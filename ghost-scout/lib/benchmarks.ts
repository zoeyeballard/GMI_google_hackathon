interface PositionBenchmark {
  avg_sprint: number
  sprint_stddev: number
  avg_height: number
  height_stddev: number
  avg_weight: number
  weight_stddev: number
  key_skills: string[]
}

type BenchmarkData = Record<number, Record<string, PositionBenchmark>>

const benchmarkData: BenchmarkData = {
  12: {
    goalkeeper: { avg_sprint: 13.8, sprint_stddev: 0.5, avg_height: 155, height_stddev: 6, avg_weight: 45, weight_stddev: 5, key_skills: ['reflexes', 'positioning', 'communication'] },
    defender: { avg_sprint: 13.2, sprint_stddev: 0.5, avg_height: 154, height_stddev: 6, avg_weight: 44, weight_stddev: 5, key_skills: ['tackling', 'aerial ability', 'positioning'] },
    midfielder: { avg_sprint: 13.0, sprint_stddev: 0.4, avg_height: 150, height_stddev: 5, avg_weight: 42, weight_stddev: 5, key_skills: ['passing', 'vision', 'ball control'] },
    winger: { avg_sprint: 12.8, sprint_stddev: 0.4, avg_height: 149, height_stddev: 5, avg_weight: 41, weight_stddev: 4, key_skills: ['dribbling', 'pace', 'crossing'] },
    striker: { avg_sprint: 12.9, sprint_stddev: 0.4, avg_height: 152, height_stddev: 6, avg_weight: 43, weight_stddev: 5, key_skills: ['finishing', 'positioning', 'movement'] },
  },
  13: {
    goalkeeper: { avg_sprint: 13.3, sprint_stddev: 0.5, avg_height: 161, height_stddev: 7, avg_weight: 50, weight_stddev: 6, key_skills: ['reflexes', 'positioning', 'distribution'] },
    defender: { avg_sprint: 12.8, sprint_stddev: 0.5, avg_height: 159, height_stddev: 6, avg_weight: 49, weight_stddev: 5, key_skills: ['tackling', 'reading play', 'heading'] },
    midfielder: { avg_sprint: 12.6, sprint_stddev: 0.4, avg_height: 156, height_stddev: 6, avg_weight: 47, weight_stddev: 5, key_skills: ['passing', 'vision', 'stamina'] },
    winger: { avg_sprint: 12.4, sprint_stddev: 0.4, avg_height: 155, height_stddev: 6, avg_weight: 46, weight_stddev: 5, key_skills: ['dribbling', 'pace', 'crossing'] },
    striker: { avg_sprint: 12.5, sprint_stddev: 0.4, avg_height: 158, height_stddev: 6, avg_weight: 48, weight_stddev: 5, key_skills: ['finishing', 'positioning', 'hold-up'] },
  },
  14: {
    goalkeeper: { avg_sprint: 12.9, sprint_stddev: 0.5, avg_height: 168, height_stddev: 7, avg_weight: 56, weight_stddev: 6, key_skills: ['reflexes', 'shot-stopping', 'command of area'] },
    defender: { avg_sprint: 12.4, sprint_stddev: 0.4, avg_height: 166, height_stddev: 6, avg_weight: 55, weight_stddev: 5, key_skills: ['tackling', 'aerial duels', 'build-up play'] },
    midfielder: { avg_sprint: 12.2, sprint_stddev: 0.4, avg_height: 163, height_stddev: 6, avg_weight: 53, weight_stddev: 5, key_skills: ['passing range', 'vision', 'press resistance'] },
    winger: { avg_sprint: 12.1, sprint_stddev: 0.4, avg_height: 163, height_stddev: 6, avg_weight: 52, weight_stddev: 5, key_skills: ['dribbling', 'pace', 'crossing'] },
    striker: { avg_sprint: 12.0, sprint_stddev: 0.4, avg_height: 165, height_stddev: 6, avg_weight: 54, weight_stddev: 5, key_skills: ['finishing', 'positioning', 'hold-up'] },
  },
  15: {
    goalkeeper: { avg_sprint: 12.5, sprint_stddev: 0.5, avg_height: 174, height_stddev: 7, avg_weight: 62, weight_stddev: 6, key_skills: ['shot-stopping', 'distribution', 'crosses'] },
    defender: { avg_sprint: 12.0, sprint_stddev: 0.4, avg_height: 172, height_stddev: 6, avg_weight: 61, weight_stddev: 5, key_skills: ['defensive awareness', 'passing', 'leadership'] },
    midfielder: { avg_sprint: 11.9, sprint_stddev: 0.4, avg_height: 169, height_stddev: 6, avg_weight: 59, weight_stddev: 5, key_skills: ['ball retention', 'tactical awareness', 'long passing'] },
    winger: { avg_sprint: 11.7, sprint_stddev: 0.4, avg_height: 168, height_stddev: 6, avg_weight: 57, weight_stddev: 5, key_skills: ['1v1 dribbling', 'acceleration', 'end product'] },
    striker: { avg_sprint: 11.8, sprint_stddev: 0.4, avg_height: 171, height_stddev: 6, avg_weight: 60, weight_stddev: 5, key_skills: ['clinical finishing', 'link-up play', 'aerial threat'] },
  },
  16: {
    goalkeeper: { avg_sprint: 12.2, sprint_stddev: 0.4, avg_height: 179, height_stddev: 6, avg_weight: 68, weight_stddev: 6, key_skills: ['shot-stopping', 'sweeping', 'penalty area command'] },
    defender: { avg_sprint: 11.7, sprint_stddev: 0.4, avg_height: 177, height_stddev: 6, avg_weight: 67, weight_stddev: 5, key_skills: ['1v1 defending', 'ball-playing', 'composure'] },
    midfielder: { avg_sprint: 11.6, sprint_stddev: 0.4, avg_height: 174, height_stddev: 5, avg_weight: 64, weight_stddev: 5, key_skills: ['game management', 'pressing', 'creativity'] },
    winger: { avg_sprint: 11.4, sprint_stddev: 0.3, avg_height: 173, height_stddev: 5, avg_weight: 63, weight_stddev: 5, key_skills: ['beating defenders', 'final third delivery', 'goal threat'] },
    striker: { avg_sprint: 11.5, sprint_stddev: 0.4, avg_height: 176, height_stddev: 6, avg_weight: 66, weight_stddev: 5, key_skills: ['movement in box', 'composure', 'all-round finishing'] },
  },
  17: {
    goalkeeper: { avg_sprint: 12.0, sprint_stddev: 0.4, avg_height: 183, height_stddev: 5, avg_weight: 73, weight_stddev: 5, key_skills: ['elite reflexes', 'distribution range', 'leadership'] },
    defender: { avg_sprint: 11.5, sprint_stddev: 0.3, avg_height: 180, height_stddev: 5, avg_weight: 72, weight_stddev: 5, key_skills: ['tactical maturity', 'recovery pace', 'aerial dominance'] },
    midfielder: { avg_sprint: 11.4, sprint_stddev: 0.3, avg_height: 176, height_stddev: 5, avg_weight: 68, weight_stddev: 5, key_skills: ['tempo control', 'progressive passing', 'defensive contribution'] },
    winger: { avg_sprint: 11.2, sprint_stddev: 0.3, avg_height: 175, height_stddev: 5, avg_weight: 67, weight_stddev: 5, key_skills: ['elite dribbling', 'cutting inside', 'direct goal involvement'] },
    striker: { avg_sprint: 11.3, sprint_stddev: 0.3, avg_height: 179, height_stddev: 5, avg_weight: 71, weight_stddev: 5, key_skills: ['predatory instinct', 'hold-up mastery', 'versatile finishing'] },
  },
}

export function getBenchmarks(age: number, position: string): PositionBenchmark {
  const clampedAge = Math.max(12, Math.min(17, age))
  const posData = benchmarkData[clampedAge]
  const pos = posData?.[position.toLowerCase()]
  if (!pos) {
    return benchmarkData[14]!['midfielder']!
  }
  return pos
}

/**
 * For sprint: lower value = better, so we invert.
 * percentile = Phi((mean - value) / stdDev) * 100 for sprint
 * For other stats: Phi((value - mean) / stdDev) * 100
 *
 * Using a simple approximation of the normal CDF.
 */
export function calculatePercentile(value: number, mean: number, stdDev: number): number {
  const z = (mean - value) / stdDev
  const percentile = normalCDF(z) * 100
  return Math.max(0, Math.min(100, Math.round(percentile)))
}

function normalCDF(z: number): number {
  const a1 = 0.254829592
  const a2 = -0.284496736
  const a3 = 1.421413741
  const a4 = -1.453152027
  const a5 = 1.061405429
  const p = 0.3275911

  const sign = z < 0 ? -1 : 1
  const x = Math.abs(z) / Math.sqrt(2)
  const t = 1.0 / (1.0 + p * x)
  const y = 1.0 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-x * x)

  return 0.5 * (1.0 + sign * y)
}
