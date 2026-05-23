import { NextRequest } from 'next/server'

describe('Phase 3: API routes', () => {
  describe('GET /api/health', () => {
    it('returns 200 with correct shape', async () => {
      const { GET } = await import('../app/api/health/route')
      const req = new NextRequest('http://localhost:3000/api/health')
      const res = await GET(req)
      expect(res.status).toBe(200)
      const body = await res.json()
      expect(body).toHaveProperty('status', 'ok')
      expect(body).toHaveProperty('providers')
      expect(body.providers).toContain('gmi')
      expect(body.providers).toContain('gemini')
      expect(body.providers).toContain('rocketride')
    })
  })

  describe('POST /api/scout — validation', () => {
    it('returns 400 on missing required fields', async () => {
      const { POST } = await import('../app/api/scout/route')
      const req = new NextRequest('http://localhost:3000/api/scout', {
        method: 'POST',
        body: JSON.stringify({ player: { name: 'X' } }),
        headers: { 'Content-Type': 'application/json' },
      })
      const res = await POST(req)
      expect(res.status).toBe(400)
    })

    it('returns 400 if age is out of range', async () => {
      const { POST } = await import('../app/api/scout/route')
      const req = new NextRequest('http://localhost:3000/api/scout', {
        method: 'POST',
        body: JSON.stringify({
          player: {
            name: 'Test Player', age: 25, country: 'Senegal',
            position: 'winger', height_cm: 168, weight_kg: 58,
            dominant_foot: 'left', skills_description: 'Very fast and technical winger with excellent dribbling',
            language: 'French'
          }
        }),
        headers: { 'Content-Type': 'application/json' },
      })
      const res = await POST(req)
      expect(res.status).toBe(400)
    })

    it('returns 400 if skills_description is too short', async () => {
      const { POST } = await import('../app/api/scout/route')
      const req = new NextRequest('http://localhost:3000/api/scout', {
        method: 'POST',
        body: JSON.stringify({
          player: {
            name: 'Test', age: 14, country: 'Nigeria', position: 'striker',
            height_cm: 170, weight_kg: 60, dominant_foot: 'right',
            skills_description: 'Fast', language: 'Yoruba'
          }
        }),
        headers: { 'Content-Type': 'application/json' },
      })
      const res = await POST(req)
      expect(res.status).toBe(400)
    })
  })

  describe('Academy matching', () => {
    it('matches left-footed winger to Barcelona La Masia', async () => {
      const { matchAcademy } = await import('../lib/academy')
      expect(matchAcademy('winger', 'left', 'Senegal')).toBe('FC Barcelona La Masia')
    })

    it('matches striker to RB Leipzig Academy', async () => {
      const { matchAcademy } = await import('../lib/academy')
      expect(matchAcademy('striker', 'right', 'Nigeria')).toBe('RB Leipzig Academy')
    })
  })
})
