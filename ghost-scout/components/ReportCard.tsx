'use client'

import { useState } from 'react'
import { ScoutingReport } from '@/lib/types'

interface ReportCardProps {
  report: ScoutingReport
}

const ratingColors: Record<string, string> = {
  exceptional: 'text-scout-accent border-scout-accent',
  high_potential: 'text-blue-400 border-blue-400',
  promising: 'text-yellow-400 border-yellow-400',
  developing: 'text-gray-400 border-gray-400',
}

const countryFlags: Record<string, string> = {
  'Senegal': '\u{1F1F8}\u{1F1F3}',
  'Nigeria': '\u{1F1F3}\u{1F1EC}',
  'Bolivia': '\u{1F1E7}\u{1F1F4}',
  'Ghana': '\u{1F1EC}\u{1F1ED}',
  'Cambodia': '\u{1F1F0}\u{1F1ED}',
  'Ethiopia': '\u{1F1EA}\u{1F1F9}',
  'Ivory Coast': '\u{1F1E8}\u{1F1EE}',
  'Honduras': '\u{1F1ED}\u{1F1F3}',
}

function renderMarkdown(md: string): string {
  return md
    .replace(/^### (.+)$/gm, '<h3 class="text-lg font-bold text-white mt-6 mb-2">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold text-white mt-8 mb-3">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold text-white mt-8 mb-4">$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong class="text-white">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^- (.+)$/gm, '<li class="ml-4 text-gray-300">$1</li>')
    .replace(/\n\n/g, '<br/><br/>')
}

export default function ReportCard({ report }: ReportCardProps) {
  const [showNative, setShowNative] = useState(false)
  const [copied, setCopied] = useState(false)
  const { player, benchmark, comps, matched_academy } = report
  const flag = countryFlags[player.country] || '\u{1F30D}'
  const ratingClass = ratingColors[benchmark.overall_rating] || ratingColors.developing

  const handleDownloadPDF = () => {
    const originalTitle = document.title
    document.title = `GhostScout_${player.name.replace(/\s+/g, '_')}_Report`
    window.print()
    document.title = originalTitle
  }

  const handleCopyReport = async () => {
    try {
      await navigator.clipboard.writeText(report.report_english)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      const textarea = document.createElement('textarea')
      textarea.value = report.report_english
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const footerText = `${player.name} — Generated ${new Date(report.generated_at).toLocaleDateString()}`

  return (
    <div
      className="max-w-4xl mx-auto p-8 space-y-8"
      data-report-card
      data-report-footer={footerText}
    >
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white">{player.name}</h2>
          <div className="flex items-center gap-3 mt-2 text-gray-400">
            <span>{flag} {player.country}</span>
            <span className="text-gray-600">|</span>
            <span>Age {player.age}</span>
            <span className="text-gray-600">|</span>
            <span className="px-2 py-0.5 rounded bg-gray-800 text-sm capitalize">{player.position}</span>
          </div>
        </div>
        <div className={`px-5 py-2.5 border-2 rounded-lg text-center ${ratingClass}`}>
          <div className="text-xl font-black uppercase tracking-wider" data-testid="rating-badge">
            {benchmark.overall_rating.replace('_', ' ')}
          </div>
        </div>
      </div>

      <div className="bg-gray-900/50 rounded-lg p-6 border border-gray-800">
        <div className="text-sm text-gray-400 mb-2">Global Percentile</div>
        <div className="flex items-center gap-4">
          <div className="flex-1 h-4 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-scout-accent/60 to-scout-accent rounded-full transition-all duration-1000"
              style={{ width: `${benchmark.percentile}%` }}
            />
          </div>
          <span className="text-2xl font-bold text-scout-accent">{benchmark.percentile}%</span>
        </div>
        <div className="text-sm text-gray-400 mt-2">
          Top {100 - benchmark.percentile}% of U{player.age} {player.position}s globally
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-800">
          <h3 className="text-sm font-semibold text-scout-accent mb-2">Standout Attributes</h3>
          <div className="flex flex-wrap gap-2">
            {benchmark.standout_attributes.map(attr => (
              <span key={attr} className="px-2 py-1 text-xs rounded bg-scout-accent/10 text-scout-accent border border-scout-accent/20">
                {attr}
              </span>
            ))}
          </div>
        </div>
        <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-800">
          <h3 className="text-sm font-semibold text-yellow-400 mb-2">Development Areas</h3>
          <div className="flex flex-wrap gap-2">
            {benchmark.development_flags.map(flag => (
              <span key={flag} className="px-2 py-1 text-xs rounded bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                {flag}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-bold text-white mb-4">Player Comparisons</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {comps.map(comp => (
            <div key={comp.player_name} className="bg-gray-900/50 rounded-lg p-4 border border-gray-800">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-white">{comp.player_name}</span>
                <span className="text-scout-accent font-bold">{comp.similarity_score}%</span>
              </div>
              <div className="text-xs text-gray-500 mb-1">{comp.current_club} · {comp.position}</div>
              <div className="text-sm text-gray-400">{comp.note}</div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-bold text-white mb-4">Recommended Academies</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {report.matched_academies?.length ? (
            report.matched_academies.map((academy, idx) => (
              <div
                key={academy.name}
                className={`rounded-lg p-4 border ${idx === 0 ? 'bg-scout-accent/10 border-scout-accent/30' : 'bg-gray-900/50 border-gray-800'}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs font-semibold uppercase px-2 py-0.5 rounded ${
                    academy.tier === 'elite' ? 'bg-scout-accent/20 text-scout-accent' :
                    academy.tier === 'top' ? 'bg-blue-500/20 text-blue-400' :
                    'bg-gray-700/50 text-gray-400'
                  }`}>
                    {academy.tier}
                  </span>
                  <span className="text-scout-accent font-bold text-sm">{academy.fitScore}% fit</span>
                </div>
                <div className="font-semibold text-white text-sm mb-1">{academy.name}</div>
                <div className="text-xs text-gray-500 mb-2">{academy.country}</div>
                <div className="text-xs text-gray-400 leading-relaxed">{academy.reason}</div>
              </div>
            ))
          ) : (
            <div className="bg-scout-accent/10 border border-scout-accent/30 rounded-lg p-4 text-center col-span-3">
              <div className="text-xl font-bold text-scout-accent">{matched_academy}</div>
            </div>
          )}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white">Full Scouting Report</h3>
          <button
            onClick={() => setShowNative(!showNative)}
            className="px-4 py-1.5 text-sm rounded-lg border border-gray-700 text-gray-300 hover:border-scout-accent hover:text-scout-accent transition-colors"
            aria-label={showNative ? 'English' : player.language}
          >
            {showNative ? 'English' : player.language}
          </button>
        </div>
        <div
          className="bg-gray-900/50 rounded-lg p-6 border border-gray-800 prose prose-invert max-w-none text-gray-300 leading-relaxed"
          dangerouslySetInnerHTML={{
            __html: renderMarkdown(showNative ? report.report_native : report.report_english),
          }}
        />
      </div>

      <div className="flex items-center gap-3 pt-4 no-print">
        <button
          onClick={handleDownloadPDF}
          className="px-5 py-2.5 text-sm font-medium rounded-lg bg-scout-accent text-scout-dark hover:bg-scout-accent/90 transition-colors"
        >
          Download Report (PDF)
        </button>
        <button
          onClick={handleCopyReport}
          className="px-5 py-2.5 text-sm font-medium rounded-lg border border-scout-accent text-scout-accent hover:bg-scout-accent/10 transition-colors"
        >
          {copied ? 'Copied!' : 'Copy Report Text'}
        </button>
      </div>

      {copied && (
        <div className="fixed bottom-6 right-6 px-4 py-2.5 bg-scout-accent text-scout-dark text-sm font-medium rounded-lg shadow-lg shadow-scout-accent/20 animate-pulse no-print">
          Copied to clipboard!
        </div>
      )}
    </div>
  )
}
