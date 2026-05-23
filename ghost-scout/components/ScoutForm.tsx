'use client'

import { useState } from 'react'
import { PlayerInput } from '@/lib/types'

const DEMO_SCENARIOS: PlayerInput[] = [
  {
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
  {
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
  {
    name: 'María Santos',
    age: 13,
    country: 'Bolivia',
    position: 'midfielder',
    height_cm: 155,
    weight_kg: 46,
    dominant_foot: 'both',
    skills_description: 'Creative midfielder with extraordinary vision for her age. Both-footed with an ability to switch play across 40 yards. Reads the game two steps ahead, constantly finding pockets of space. Excellent stamina and work rate.',
    language: 'Spanish',
  },
]

const COUNTRY_SUGGESTIONS = [
  'Nigeria', 'Senegal', 'Bolivia', 'Cambodia', 'Ethiopia', 'Ghana', 'Ivory Coast', 'Honduras',
]

interface ScoutFormProps {
  onSubmit: (player: PlayerInput) => void
  isLoading?: boolean
}

export default function ScoutForm({ onSubmit, isLoading = false }: ScoutFormProps) {
  const [form, setForm] = useState<Partial<PlayerInput>>({})
  const [showSuggestions, setShowSuggestions] = useState(false)

  const filteredCountries = COUNTRY_SUGGESTIONS.filter(c =>
    c.toLowerCase().startsWith((form.country || '').toLowerCase())
  )

  const updateField = <K extends keyof PlayerInput>(key: K, value: PlayerInput[K]) => {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  const loadDemo = (demo: PlayerInput) => {
    setForm({ ...demo })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(form as PlayerInput)
  }

  return (
    <div className="min-h-screen bg-scout-dark">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <header className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-3 tracking-tight">
            <span className="text-white">Ghost</span>{' '}
            <span className="text-scout-accent">Scout</span>
          </h1>
          <p className="text-gray-400 text-lg mb-4">Finding the world&apos;s hidden talent</p>
          <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
            <span>Powered by</span>
            <span className="text-blue-400 font-semibold">GMI Cloud</span>
            <span className="text-gray-600">·</span>
            <span className="text-yellow-400 font-semibold">Google Gemini</span>
            <span className="text-gray-600">·</span>
            <span className="text-purple-400 font-semibold">RocketRide</span>
          </div>
        </header>

        <div className="mb-10">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
            Quick Demo Scenarios
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {DEMO_SCENARIOS.map((demo) => (
              <button
                key={demo.name}
                type="button"
                onClick={() => loadDemo(demo)}
                className="text-left p-4 rounded-lg border border-gray-700 bg-gray-900/50 hover:border-scout-accent/50 hover:bg-gray-800/50 transition-all duration-200"
              >
                <div className="font-semibold text-white">{demo.name}</div>
                <div className="text-sm text-gray-400 mt-1">
                  {demo.age}yo · {demo.country} · {demo.position}
                  {demo.dominant_foot !== 'right' && ` · ${demo.dominant_foot} foot`}
                </div>
                <div className="text-xs text-gray-500 mt-2 line-clamp-2">
                  {demo.skills_description}
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

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 px-6 bg-scout-accent text-scout-dark font-bold rounded-lg text-lg hover:bg-green-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Analyzing...' : 'Generate Scouting Report'}
          </button>
        </form>
      </div>
    </div>
  )
}
