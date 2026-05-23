'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import ReportCard from '@/components/ReportCard'
import EmailDraft from '@/components/EmailDraft'
import { ScoutingReport } from '@/lib/types'

export default function ReportPage() {
  const params = useParams<{ id: string }>()
  const [report, setReport] = useState<ScoutingReport | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchReport() {
      try {
        const res = await fetch(`/api/scout?id=${params.id}`)
        if (res.ok) {
          const data = await res.json()
          setReport(data)
          return
        }
      } catch {
        // API unavailable, fall through to sessionStorage
      }

      const cached = sessionStorage.getItem(`report:${params.id}`)
      if (cached) {
        try {
          setReport(JSON.parse(cached))
          return
        } catch {
          // corrupted cache, ignore
        }
      }

      setError('Report not found — it may have expired. Generate a new one from the home page.')
      setLoading(false)
    }
    fetchReport().finally(() => setLoading(false))
  }, [params.id])

  if (loading) {
    return (
      <div className="min-h-screen bg-scout-dark flex items-center justify-center">
        <div className="text-gray-400 text-sm animate-pulse">Loading report...</div>
      </div>
    )
  }

  if (error || !report) {
    return (
      <div className="min-h-screen bg-scout-dark flex flex-col items-center justify-center gap-4">
        <p className="text-red-400">{error || 'Report not found'}</p>
        <Link
          href="/"
          className="text-scout-accent hover:underline text-sm"
        >
          &larr; Back to Scout
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-scout-dark">
      <div className="text-center pt-8">
        <Link
          href="/"
          className="text-gray-400 hover:text-scout-accent transition-colors text-sm"
        >
          &larr; Back to Scout
        </Link>
      </div>
      <ReportCard report={report} />
      <EmailDraft email={report.email_draft} academy={report.matched_academy} academyMatches={report.matched_academies} />
    </div>
  )
}
