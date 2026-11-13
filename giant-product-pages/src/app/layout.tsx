import type { Metadata } from 'next'
import './globals.css'
import SiteHeader from '../components/SiteHeader/SiteHeader'

export const metadata: Metadata = {
  title: 'Giant PLP Prototype',
  description: 'Product listing prototype for Giant mountain bikes.',
  robots: { index: false, follow: false },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      {/* text-body-m is the document's baseline type; every element that needs a
          different one carries its own .text-* class from the design system. */}
      <body className="text-body-m">
        <SiteHeader />
        {children}
      </body>
    </html>
  )
}
