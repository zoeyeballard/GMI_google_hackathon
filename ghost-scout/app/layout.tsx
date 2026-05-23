import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Ghost Scout — AI Football Talent Discovery',
  description: 'Finding the world\'s hidden talent with AI-powered scouting',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-scout-dark text-white antialiased">
        {children}
      </body>
    </html>
  )
}
