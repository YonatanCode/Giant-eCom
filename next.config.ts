import type { NextConfig } from 'next'

const config: NextConfig = {
  // Pin the workspace root to this repo. Without it Turbopack walks up, finds an
  // unrelated lockfile higher in the tree, and fails to resolve node_modules imports.
  turbopack: { root: import.meta.dirname },
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
