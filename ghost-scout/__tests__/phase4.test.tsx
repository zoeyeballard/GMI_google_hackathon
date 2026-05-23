import '@testing-library/jest-dom'
import { render, screen, fireEvent } from '@testing-library/react'
import ScoutForm from '../components/ScoutForm'
import PipelineStatus from '../components/PipelineStatus'
import ReportCard from '../components/ReportCard'
import EmailDraft from '../components/EmailDraft'
import { PipelineStep, ScoutingReport } from '../lib/types'

const mockSteps: PipelineStep[] = [
  { id: 'step1', name: 'Benchmark Analysis', status: 'complete', provider: 'gmi', duration_ms: 843 },
  { id: 'step2', name: 'Player Comps', status: 'running', provider: 'gmi' },
  { id: 'step3', name: 'Scouting Report', status: 'pending', provider: 'gemini' },
  { id: 'step4', name: 'Academy Email', status: 'pending', provider: 'gemini' },
]

const mockReport: ScoutingReport = {
  id: 'test-123',
  generated_at: new Date().toISOString(),
  player: {
    name: 'Amadou Diallo', age: 14, country: 'Senegal', position: 'winger',
    height_cm: 168, weight_kg: 58, dominant_foot: 'left',
    sprint_100m_seconds: 11.4,
    skills_description: 'Exceptional pace, raw dribbler, left-footed natural winger',
    language: 'French',
  },
  benchmark: {
    percentile: 94,
    standout_attributes: ['Pace', 'Dribbling', 'Left foot'],
    development_flags: ['Crossing consistency', 'Defensive tracking'],
    overall_rating: 'exceptional',
  },
  comps: [
    { player_name: 'Sadio Mané', current_club: 'Al-Nassr', position: 'Winger', similarity_score: 87, note: 'Similar pace and left-footed dribbling profile at same age' },
  ],
  report_english: '# Scouting Report\n\nExecutive Summary: Exceptional talent...',
  report_native: '# Rapport de Scout\n\nRésumé: Talent exceptionnel...',
  matched_academy: 'FC Barcelona La Masia',
  email_draft: 'Dear FC Barcelona Academy Director,\n\nI am writing to bring to your attention...',
  pipeline_steps: mockSteps,
}

describe('Phase 4: UI components', () => {
  describe('ScoutForm', () => {
    it('renders all required form fields', () => {
      render(<ScoutForm onSubmit={jest.fn()} />)
      expect(screen.getByLabelText(/player name/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/age/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/country/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/position/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/skills/i)).toBeInTheDocument()
    })

    it('shows all 3 demo scenario cards', () => {
      render(<ScoutForm onSubmit={jest.fn()} />)
      expect(screen.getByText(/Amadou Diallo/)).toBeInTheDocument()
      expect(screen.getByText(/Chidera Okafor/)).toBeInTheDocument()
      expect(screen.getByText(/María Santos/)).toBeInTheDocument()
    })

    it('displays all 3 provider names in the header', () => {
      render(<ScoutForm onSubmit={jest.fn()} />)
      expect(screen.getByText(/GMI Cloud/i)).toBeInTheDocument()
      expect(screen.getByText(/Gemini/i)).toBeInTheDocument()
      expect(screen.getByText(/RocketRide/i)).toBeInTheDocument()
    })

    it('calls onSubmit with form data when submitted', () => {
      const onSubmit = jest.fn()
      render(<ScoutForm onSubmit={onSubmit} />)
      fireEvent.click(screen.getByText(/Amadou Diallo/))
      fireEvent.click(screen.getByRole('button', { name: /generate scouting report/i }))
      expect(onSubmit).toHaveBeenCalled()
    })
  })

  describe('PipelineStatus', () => {
    it('renders all 4 pipeline steps', () => {
      render(<PipelineStatus steps={mockSteps} />)
      expect(screen.getByText('Benchmark Analysis')).toBeInTheDocument()
      expect(screen.getByText('Player Comps')).toBeInTheDocument()
      expect(screen.getByText('Scouting Report')).toBeInTheDocument()
      expect(screen.getByText('Academy Email')).toBeInTheDocument()
    })

    it('shows provider labels for GMI and Gemini steps', () => {
      render(<PipelineStatus steps={mockSteps} />)
      expect(screen.getAllByText(/GMI Cloud/i).length).toBeGreaterThan(0)
      expect(screen.getAllByText(/Gemini/i).length).toBeGreaterThan(0)
    })

    it('shows duration for completed steps', () => {
      render(<PipelineStatus steps={mockSteps} />)
      expect(screen.getByText(/843ms/)).toBeInTheDocument()
    })
  })

  describe('ReportCard', () => {
    it('renders player name and country', () => {
      render(<ReportCard report={mockReport} />)
      expect(screen.getByText('Amadou Diallo')).toBeInTheDocument()
      expect(screen.getByText(/Senegal/)).toBeInTheDocument()
    })

    it('shows overall rating badge', () => {
      render(<ReportCard report={mockReport} />)
      expect(screen.getByTestId('rating-badge')).toHaveTextContent(/exceptional/i)
    })

    it('shows percentile', () => {
      render(<ReportCard report={mockReport} />)
      expect(screen.getByText(/94/)).toBeInTheDocument()
    })

    it('shows matched academy', () => {
      render(<ReportCard report={mockReport} />)
      expect(screen.getByText(/FC Barcelona La Masia/)).toBeInTheDocument()
    })

    it('has language toggle button', () => {
      render(<ReportCard report={mockReport} />)
      expect(screen.getByRole('button', { name: /French/i })).toBeInTheDocument()
    })

    it('shows comp player name', () => {
      render(<ReportCard report={mockReport} />)
      expect(screen.getByText(/Sadio Mané/)).toBeInTheDocument()
    })
  })

  describe('EmailDraft', () => {
    it('renders email content', () => {
      render(<EmailDraft email={mockReport.email_draft} academy={mockReport.matched_academy} />)
      expect(screen.getByText(/FC Barcelona Academy Director/i)).toBeInTheDocument()
    })

    it('has copy to clipboard button', () => {
      render(<EmailDraft email={mockReport.email_draft} academy={mockReport.matched_academy} />)
      expect(screen.getByRole('button', { name: /copy/i })).toBeInTheDocument()
    })
  })
})
