import type { Metadata } from 'next'
import { Providers } from '@/components/Providers'
import './globals.css'

export const metadata: Metadata = {
  title: 'KX Sanctuary OS',
  description: 'A personal AI workspace for thinking, building, learning and managing knowledge.',
  keywords: ['KX Sanctuary OS', 'personal AI assistant', 'software engineering', 'knowledge management'],
  authors: [{ name: 'KX Sanctuary OS' }],
  openGraph: {
    title: 'KX Sanctuary OS',
    description: 'A personal AI workspace for thinking, building and learning.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Share+Tech+Mono&family=VT323&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-mono antialiased">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
