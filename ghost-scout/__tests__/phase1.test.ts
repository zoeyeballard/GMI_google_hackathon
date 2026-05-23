import { existsSync } from 'fs'
import path from 'path'

describe('Phase 1: Project scaffold', () => {
  const requiredFiles = [
    'app/page.tsx',
    'app/api/scout/route.ts',
    'app/api/health/route.ts',
    'lib/gmi.ts',
    'lib/gemini.ts',
    'lib/rocketride.ts',
    'lib/benchmarks.ts',
    'lib/types.ts',
    'components/ScoutForm.tsx',
    'components/ReportCard.tsx',
    'components/PipelineStatus.tsx',
    'components/EmailDraft.tsx',
  ]

  requiredFiles.forEach(file => {
    it(`${file} exists`, () => {
      expect(existsSync(path.join(process.cwd(), file))).toBe(true)
    })
  })

  it('package.json has required dependencies', () => {
    const pkg = require('../package.json')
    expect(pkg.dependencies).toHaveProperty('@google/generative-ai')
    expect(pkg.dependencies).toHaveProperty('openai')
    expect(pkg.dependencies).toHaveProperty('zod')
  })
})
