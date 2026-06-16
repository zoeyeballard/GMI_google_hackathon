'use client'

import { useState, useMemo } from 'react'
import { PlayerInput, VideoAnalysisInput } from '@/lib/types'
import { validateYouTubeUrl } from '@/lib/videoValidation'
import VideoInput from '@/components/VideoInput'

interface DemoScenario {
  player: PlayerInput
  videoUrl?: string
  label?: string
}

const DEMO_SCENARIOS: DemoScenario[] = [
  {
    player: {
      name: 'Amadou Diallo',
      age: 14,
      country: 'Senegal',
      position: 'winger',
      height_cm: 168,
      weight_kg: 58,
      dominant_foot: 'left',
      sprint_100m_seconds: 11.4,
      skills_description: 'Exceptional pace and close control. Beats defenders with ease on the left flank. Raw but instinctive — makes intelligent diagonal runs and has a natural left foot with whip on crosses. Thrives in 1v1 situations.',
      language: 'French',
    },
  },
  {
    player: {
      name: 'Chidera Okafor',
      age: 15,
      country: 'Nigeria',
      position: 'striker',
      height_cm: 175,
      weight_kg: 68,
      dominant_foot: 'right',
      skills_description: 'Powerful and physical striker with elite finishing instinct. Strong in the air for his age, holds up play well against older defenders. Clinical inside the box — rarely wastes chances. Natural leader on the pitch.',
      language: 'Igbo',
    },
  },
  {
    player: {
      name: 'Mar\u00EDa Santos',
      age: 13,
      country: 'Bolivia',
      position: 'midfielder',
      height_cm: 155,
      weight_kg: 46,
      dominant_foot: 'both',
      skills_description: 'Creative midfielder with extraordinary vision for her age. Both-footed with an ability to switch play across 40 yards. Reads the game two steps ahead, constantly finding pockets of space. Excellent stamina and work rate.',
      language: 'Spanish',
    },
  },
  {
    label: '\uD83C\uDFA5 Amadou (Video Demo)',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    player: {
      name: 'Amadou Diallo',
      age: 14,
      country: 'Senegal',
      position: 'winger',
      height_cm: 168,
      weight_kg: 58,
      dominant_foot: 'left',
      sprint_100m_seconds: 11.4,
      skills_description: 'Exceptional pace and close control. Beats defenders with ease on the left flank. Raw but instinctive — makes intelligent diagonal runs and has a natural left foot with whip on crosses. Thrives in 1v1 situations.',
      language: 'French',
    },
  },
]

const COUNTRY_SUGGESTIONS = [
  'Nigeria', 'Senegal', 'Bolivia', 'Cambodia', 'Ethiopia', 'Ghana', 'Ivory Coast', 'Honduras',
]

interface ScoutFormProps {
  onSubmit: (player: PlayerInput, video?: VideoAnalysisInput) => void
  isLoading?: boolean
}

export default function ScoutForm({ onSubmit, isLoading = false }: ScoutFormProps) {
  const [form, setForm] = useState<Partial<PlayerInput>>({})
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [videoDescription, setVideoDescription] = useState('')
  const [showVideoSection, setShowVideoSection] = useState(false)

  const youtubeStatus = useMemo(() => {
    if (!youtubeUrl.trim()) return 'empty'
    return validateYouTubeUrl(youtubeUrl) ? 'valid' : 'invalid'
  }, [youtubeUrl])

  const filteredCountries = COUNTRY_SUGGESTIONS.filter(c =>
    c.toLowerCase().startsWith((form.country || '').toLowerCase())
  )

  const updateField = <K extends keyof PlayerInput>(key: K, value: PlayerInput[K]) => {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  const loadDemo = (demo: DemoScenario) => {
    setForm({ ...demo.player })
    if (demo.videoUrl) {
      setYoutubeUrl(demo.videoUrl)
      setShowVideoSection(true)
    } else {
      setYoutubeUrl('')
      setShowVideoSection(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const videoInput: VideoAnalysisInput | undefined =
      showVideoSection && youtubeUrl.trim() && youtubeStatus === 'valid'
        ? {
            youtubeUrl,
            videoDescription: videoDescription.trim() || undefined,
            playerName: (form.name ?? ''),
            age: (form.age ?? 0),
            country: (form.country ?? ''),
            position: (form.position ?? ''),
            language: form.language || undefined,
          }
        : undefined
    onSubmit(form as PlayerInput, videoInput)
  }

  return (
    <div className="min-h-screen bg-scout-dark">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <header className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-3 tracking-tight">
            <span className="text-white">Ghost</span>{' '}
            <span className="text-scout-accent">Scout</span>
          </h1>
          <p className="text-gray-400 text-lg mb-5">Finding the world&apos;s hidden talent</p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <span className="text-xs text-gray-600 uppercase tracking-wider">Powered by</span>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-500/15 text-blue-400 border border-blue-500/30">
              GMI Cloud
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-bold border border-yellow-500/30 text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-orange-400 to-red-400"
              style={{ WebkitBackgroundClip: 'text' }}
            >
              <span className="px-3 py-1 rounded-full bg-gradient-to-r from-yellow-500/15 to-red-500/15 border border-yellow-500/30 text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-orange-400 to-red-400">
                Google Gemini
              </span>
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-500/15 text-purple-400 border border-purple-500/30">
              RocketRide
            </span>
          </div>
        </header>

        <div className="mb-10">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
            Quick Demo Scenarios
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {DEMO_SCENARIOS.map((demo, i) => (
              <button
                key={i}
                type="button"
                onClick={() => loadDemo(demo)}
                className={`text-left p-4 rounded-lg border transition-all duration-200 ${
                  demo.videoUrl
                    ? 'border-red-500/30 bg-red-500/5 hover:border-red-500/60 hover:bg-red-500/10'
                    : 'border-gray-700 bg-gray-900/50 hover:border-scout-accent/50 hover:bg-gray-800/50'
                }`}
              >
                <div className="font-semibold text-white">
                  {demo.label ?? demo.player.name}
                </div>
                <div className="text-sm text-gray-400 mt-1">
                  {demo.player.age}yo · {demo.player.country} · {demo.player.position}
                  {demo.player.dominant_foot !== 'right' && ` · ${demo.player.dominant_foot} foot`}
                </div>
                <div className="text-xs text-gray-500 mt-2 line-clamp-2">
                  {demo.videoUrl
                    ? 'Form + Video combined analysis (placeholder video)'
                    : demo.player.skills_description}
                </div>
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 bg-gray-900/30 rounded-xl p-8 border border-gray-800">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="player-name" className="block text-sm font-medium text-gray-300 mb-1">
                Player Name
              </label>
              <input
                id="player-name"
                type="text"
                value={form.name || ''}
                onChange={e => updateField('name', e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-scout-accent focus:outline-none focus:ring-1 focus:ring-scout-accent"
                placeholder="e.g. Amadou Diallo"
                required
              />
            </div>

            <div>
              <label htmlFor="age" className="block text-sm font-medium text-gray-300 mb-1">
                Age
              </label>
              <input
                id="age"
                type="number"
                min={10}
                max={18}
                value={form.age || ''}
                onChange={e => updateField('age', parseInt(e.target.value))}
                className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-scout-accent focus:outline-none focus:ring-1 focus:ring-scout-accent"
                placeholder="10-18"
                required
              />
            </div>

            <div className="relative">
              <label htmlFor="country" className="block text-sm font-medium text-gray-300 mb-1">
                Country
              </label>
              <input
                id="country"
                type="text"
                value={form.country || ''}
                onChange={e => {
                  updateField('country', e.target.value)
                  setShowSuggestions(true)
                }}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                onFocus={() => setShowSuggestions(true)}
                className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-scout-accent focus:outline-none focus:ring-1 focus:ring-scout-accent"
                placeholder="e.g. Senegal"
                required
              />
              {showSuggestions && filteredCountries.length > 0 && form.country && (
                <ul className="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
                  {filteredCountries.map(c => (
                    <li key={c}>
                      <button
                        type="button"
                        className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
                        onMouseDown={() => {
                          updateField('country', c)
                          setShowSuggestions(false)
                        }}
                      >
                        {c}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div>
              <label htmlFor="position" className="block text-sm font-medium text-gray-300 mb-1">
                Position
              </label>
              <select
                id="position"
                value={form.position || ''}
                onChange={e => updateField('position', e.target.value as PlayerInput['position'])}
                className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-scout-accent focus:outline-none focus:ring-1 focus:ring-scout-accent"
                required
              >
                <option value="">Select position...</option>
                <option value="goalkeeper">Goalkeeper</option>
                <option value="defender">Defender</option>
                <option value="midfielder">Midfielder</option>
                <option value="winger">Winger</option>
                <option value="striker">Striker</option>
              </select>
            </div>

            <div>
              <label htmlFor="height" className="block text-sm font-medium text-gray-300 mb-1">
                Height (cm)
              </label>
              <input
                id="height"
                type="number"
                min={140}
                max={200}
                value={form.height_cm || ''}
                onChange={e => updateField('height_cm', parseInt(e.target.value))}
                className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-scout-accent focus:outline-none focus:ring-1 focus:ring-scout-accent"
                placeholder="e.g. 168"
                required
              />
            </div>

            <div>
              <label htmlFor="weight" className="block text-sm font-medium text-gray-300 mb-1">
                Weight (kg)
              </label>
              <input
                id="weight"
                type="number"
                min={30}
                max={100}
                value={form.weight_kg || ''}
                onChange={e => updateField('weight_kg', parseInt(e.target.value))}
                className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-scout-accent focus:outline-none focus:ring-1 focus:ring-scout-accent"
                placeholder="e.g. 58"
                required
              />
            </div>
          </div>

          <fieldset>
            <legend className="block text-sm font-medium text-gray-300 mb-2">Dominant Foot</legend>
            <div className="flex gap-6">
              {(['left', 'right', 'both'] as const).map(foot => (
                <label key={foot} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="dominant_foot"
                    value={foot}
                    checked={form.dominant_foot === foot}
                    onChange={() => updateField('dominant_foot', foot)}
                    className="w-4 h-4 text-scout-accent bg-gray-800 border-gray-600 focus:ring-scout-accent"
                  />
                  <span className="text-sm text-gray-300 capitalize">{foot}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <div>
            <label htmlFor="sprint" className="block text-sm font-medium text-gray-300 mb-1">
              Sprint 100m (seconds) <span className="text-gray-500">— optional</span>
            </label>
            <input
              id="sprint"
              type="number"
              min={9}
              max={16}
              step={0.1}
              value={form.sprint_100m_seconds || ''}
              onChange={e => updateField('sprint_100m_seconds', parseFloat(e.target.value))}
              className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-scout-accent focus:outline-none focus:ring-1 focus:ring-scout-accent"
              placeholder="e.g. 11.4"
            />
          </div>

          <div>
            <label htmlFor="skills" className="block text-sm font-medium text-gray-300 mb-1">
              Skills Description
            </label>
            <textarea
              id="skills"
              rows={5}
              value={form.skills_description || ''}
              onChange={e => updateField('skills_description', e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-scout-accent focus:outline-none focus:ring-1 focus:ring-scout-accent resize-none"
              placeholder="Describe what you observed: pace, technique, decision-making, attitude..."
              required
            />
            <div className="text-xs text-gray-500 mt-1">
              {(form.skills_description || '').length}/1000 characters (minimum 20)
            </div>
          </div>

          <div>
            <label htmlFor="language" className="block text-sm font-medium text-gray-300 mb-1">
              Player&apos;s Native Tongue
            </label>
            <input
              id="language"
              type="text"
              value={form.language || ''}
              onChange={e => updateField('language', e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-scout-accent focus:outline-none focus:ring-1 focus:ring-scout-accent"
              placeholder="e.g. French, Yoruba, Spanish"
              required
            />
          </div>

          {/* ── Video Analysis (Optional) ── */}
          <div className="border border-gray-700 rounded-xl overflow-hidden">
            <button
              type="button"
              onClick={() => setShowVideoSection(!showVideoSection)}
              aria-label={showVideoSection ? 'Hide video analysis section' : 'Show video analysis section'}
              aria-expanded={showVideoSection}
              className="w-full flex items-center justify-between px-5 py-3.5 bg-gray-800/50 hover:bg-gray-800 transition-colors"
            >
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-red-500" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
                <span className="text-sm font-medium text-gray-300">
                  Add Video Analysis <span className="text-gray-500">(optional)</span>
                </span>
              </div>
              <svg
                className={`w-4 h-4 text-gray-500 transition-transform ${showVideoSection ? 'rotate-180' : ''}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showVideoSection && (
              <div className="px-5 py-4 border-t border-gray-700">
                <VideoInput
                  youtubeUrl={youtubeUrl}
                  onYoutubeUrlChange={setYoutubeUrl}
                  videoDescription={videoDescription}
                  onVideoDescriptionChange={setVideoDescription}
                />
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading || (showVideoSection && youtubeUrl.trim() !== '' && youtubeStatus === 'invalid')}
            aria-label="Generate scouting report"
            className="w-full py-3.5 px-6 bg-scout-accent text-scout-dark font-bold rounded-lg text-lg hover:bg-green-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading
              ? 'Analyzing...'
              : showVideoSection && youtubeStatus === 'valid'
                ? 'Generate Combined Report'
                : 'Generate Scouting Report'}
          </button>
        </form>

        {/* How It Works */}
        <div className="mt-12 mb-4">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-5 text-center">How It Works</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { step: '1', label: 'Benchmark', provider: 'GMI Cloud', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
              { step: '2', label: 'Player Comps', provider: 'GMI Cloud', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
              { step: '3', label: 'Scout Report', provider: 'Gemini', color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20' },
              { step: '4', label: 'Academy Email', provider: 'Gemini', color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20' },
            ].map((s) => (
              <div key={s.step} className={`rounded-lg ${s.bg} border ${s.border} p-2.5 text-center`}>
                <div className="text-xs font-bold text-white truncate">{s.label}</div>
                <div className={`text-[10px] ${s.color} mt-0.5`}>{s.provider}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
