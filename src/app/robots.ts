import type { MetadataRoute } from 'next'

const AI_BOTS = [
  'GPTBot', 'ChatGPT-User', 'OAI-SearchBot', 'ClaudeBot', 'Claude-Web', 'anthropic-ai',
  'Google-Extended', 'Applebot-Extended', 'PerplexityBot', 'CCBot', 'Bytespider',
  'Amazonbot', 'meta-externalagent', 'cohere-ai', 'Diffbot',
]

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', disallow: '/' }, ...AI_BOTS.map((userAgent) => ({ userAgent, disallow: '/' }))],
  }
}
