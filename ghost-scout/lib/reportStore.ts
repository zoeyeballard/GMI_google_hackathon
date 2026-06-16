import { ScoutingReport, VideoAnalysisResult } from './types'

// In-memory stores for reports (cleared on server restart)
export const reportStore = new Map<string, ScoutingReport>()
export const videoReportStore = new Map<string, VideoAnalysisResult>()
