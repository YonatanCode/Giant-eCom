import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import LayoutShell from '../../components/LayoutShell'
import 'maplibre-gl/dist/maplibre-gl.css'
import './globals.css'

export const metadata: Metadata = {
  title: 'Giant Store Connect',
  description: 'Store finder and store detail experiences for Giant stores.',
  icons: { icon: '/favicon.svg' },
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" data-brand="giant">
      <body>
        <LayoutShell>{children}</LayoutShell>
      </body>
    </html>
  )
}
