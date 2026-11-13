import type { Metadata } from 'next'
import './globals.css'
import SiteHeader from '../../components/SiteHeader/SiteHeader'

export const metadata: Metadata = {
  title: 'Giant',
  description: 'Product listing and product pages for the Giant store journey prototype.',
  icons: { icon: '/favicon.svg' },
  robots: { index: false, follow: false },
}

// One of two root layouts: this one serves the product listing and product pages under
// /nl/bikes with their own stylesheet; the store finder has its own in ../(finder).
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
