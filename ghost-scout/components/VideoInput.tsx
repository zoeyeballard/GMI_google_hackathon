'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { extractYouTubeVideoId, validateYouTubeUrl } from '@/lib/videoValidation'

interface VideoInputProps {
  youtubeUrl: string
  onYoutubeUrlChange: (url: string) => void
  videoDescription: string
  onVideoDescriptionChange: (desc: string) => void
  onFileSelected?: (file: File | null) => void
}

const MAX_FILE_SIZE_MB = 50
const ACCEPTED_VIDEO_TYPES = '.mp4,.mov,.webm'

export default function VideoInput({
  youtubeUrl,
  onYoutubeUrlChange,
  videoDescription,
  onVideoDescriptionChange,
  onFileSelected,
}: VideoInputProps) {
  const [mode, setMode] = useState<'url' | 'upload'>('url')
  const [debouncedUrl, setDebouncedUrl] = useState(youtubeUrl)
  const [fileName, setFileName] = useState<string | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const debounceTimer = useRef<ReturnType<typeof setTimeout>>()

  const handleUrlChange = useCallback((value: string) => {
    onYoutubeUrlChange(value)
    clearTimeout(debounceTimer.current)
    debounceTimer.current = setTimeout(() => setDebouncedUrl(value), 500)
  }, [onYoutubeUrlChange])

  useEffect(() => () => clearTimeout(debounceTimer.current), [])

  const videoId = debouncedUrl.trim() ? extractYouTubeVideoId(debouncedUrl) : null
  const isValid = debouncedUrl.trim() ? validateYouTubeUrl(debouncedUrl) : null

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null)
    const file = e.target.files?.[0] ?? null
    if (!file) {
      setFileName(null)
      onFileSelected?.(null)
      return
    }
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setFileError(`File exceeds ${MAX_FILE_SIZE_MB}MB limit`)
      setFileName(null)
      onFileSelected?.(null)
      return
    }
    setFileName(file.name)
    onFileSelected?.(file)
  }

  return (
    <div className="space-y-4">
      {/* Mode toggle */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setMode('url')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            mode === 'url'
              ? 'bg-red-500/15 border border-red-500/40 text-red-400'
              : 'border border-gray-700 text-gray-500 hover:text-gray-300 hover:border-gray-600'
          }`}
        >
          <YouTubeIcon className="w-4 h-4" />
          YouTube URL
        </button>
        <button
          type="button"
          onClick={() => setMode('upload')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            mode === 'upload'
              ? 'bg-blue-500/15 border border-blue-500/40 text-blue-400'
              : 'border border-gray-700 text-gray-500 hover:text-gray-300 hover:border-gray-600'
          }`}
        >
          <UploadIcon className="w-4 h-4" />
          Upload Clip
        </button>
      </div>

      {/* YouTube URL mode */}
      {mode === 'url' && (
        <div className="space-y-3">
          <div>
            <label htmlFor="yt-url" className="block text-sm font-medium text-gray-300 mb-1">
              YouTube Video URL
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2">
                <YouTubeIcon className="w-5 h-5 text-red-500" />
              </div>
              <input
                id="yt-url"
                type="url"
                value={youtubeUrl}
                onChange={e => handleUrlChange(e.target.value)}
                className="w-full pl-11 pr-10 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-scout-accent focus:outline-none focus:ring-1 focus:ring-scout-accent"
                placeholder="https://www.youtube.com/watch?v=..."
              />
              {isValid !== null && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-bold">
                  {isValid
                    ? <span className="text-green-400">&#10003;</span>
                    : <span className="text-red-400">&#10007;</span>
                  }
                </span>
              )}
            </div>
            {isValid === true && (
              <p className="text-xs text-green-400 mt-1 flex items-center gap-1">
                <span>&#10003;</span> Valid YouTube URL
              </p>
            )}
            {isValid === false && (
              <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                <span>&#10007;</span> Invalid URL — paste a youtube.com or youtu.be link
              </p>
            )}
          </div>

          {/* Thumbnail preview */}
          {videoId && (
            <div className="rounded-lg overflow-hidden border border-gray-700 bg-black">
              <div className="relative aspect-video max-w-xs">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
                  alt="Video thumbnail"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center shadow-lg">
                    <svg className="w-5 h-5 text-white ml-0.5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Upload mode */}
      {mode === 'upload' && (
        <div>
          <label htmlFor="video-file" className="block text-sm font-medium text-gray-300 mb-1">
            Upload Video Clip
          </label>
          <div
            onClick={() => fileRef.current?.click()}
            className="w-full p-6 border-2 border-dashed border-gray-700 rounded-lg bg-gray-800/30 hover:border-gray-600 hover:bg-gray-800/50 transition-colors cursor-pointer text-center"
          >
            <UploadIcon className="w-8 h-8 text-gray-500 mx-auto mb-2" />
            {fileName ? (
              <p className="text-sm text-scout-accent font-medium">{fileName}</p>
            ) : (
              <>
                <p className="text-sm text-gray-400">Click to select a video file</p>
                <p className="text-xs text-gray-600 mt-1">.mp4, .mov, .webm — max {MAX_FILE_SIZE_MB}MB</p>
              </>
            )}
          </div>
          <input
            ref={fileRef}
            id="video-file"
            type="file"
            accept={ACCEPTED_VIDEO_TYPES}
            onChange={handleFile}
            className="hidden"
          />
          {fileError && (
            <p className="text-xs text-red-400 mt-1">{fileError}</p>
          )}
          {fileName && !fileError && (
            <p className="text-xs text-yellow-400 mt-1">
              Note: Uploaded video analysis uses a different processing path and may take longer.
            </p>
          )}
        </div>
      )}

      {/* Video context (shared) */}
      <div>
        <label htmlFor="video-ctx" className="block text-sm font-medium text-gray-300 mb-1">
          Video Context <span className="text-gray-500">— optional</span>
        </label>
        <textarea
          id="video-ctx"
          rows={2}
          value={videoDescription}
          onChange={e => onVideoDescriptionChange(e.target.value)}
          className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-scout-accent focus:outline-none focus:ring-1 focus:ring-scout-accent resize-none"
          placeholder="e.g. This is from a U-15 regional tournament semifinal..."
        />
      </div>
    </div>
  )
}

function YouTubeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  )
}

function UploadIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
    </svg>
  )
}
