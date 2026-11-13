import type { NextConfig } from 'next'

const config: NextConfig = {
  // Prototype: keep it out of search engines and AI training/indexing.
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow, noarchive, nosnippet, noimageindex, noai, noimageai' }],
      },
    ]
  },
}

export default config
