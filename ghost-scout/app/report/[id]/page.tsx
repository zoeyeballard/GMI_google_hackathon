'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import ReportCard from '@/components/ReportCard'
import EmailDraft from '@/components/EmailDraft'
import { ScoutingReport } from '@/lib/types'

export default function ReportPage() {
  const params = useParams()
  const [report, setReport] = useState<ScoutingReport | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const id = params.id as string
    if (!id) return

    fetch(`/api/scout?id=${id}`)
      .then(res => {
        if (!res.ok) throw new Error('Report not found')
        return res.json()
      })
      .then(setReport)
      .catch(err => setError(err.message))
  }, [params.id])

  if (error) {
    return (
      <div className="min-h-screen bg-scout-dark flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-2">Report Not Found</h1>
          <p className="text-gray-400">{error}</p>
          <a href="/" className="text-scout-accent hover:underline mt-4 inline-block">
            &larr; Back to Scout
          </a>
        </div>
      </div>
    )
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-scout-dark flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-scout-accent border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-scout-dark">
      <div className="text-center pt-8">
        <a href="/" className="text-gray-400 hover:text-scout-accent transition-colors text-sm">
          &larr; Scout another player
        </a>
      </div>
      <ReportCard report={report} />
      <EmailDraft email={report.email_draft} academy={report.matched_academy} />
    </div>
  )
}
