export interface ScrapedStoreContent {
  hero?: {
    image: string
  }
  banner?: {
    eyebrow?: string
    title: string
    body: string
    cta: string
    ctaSecondary?: string
    image: string
  }
}

export type ScrapedStoreContentMap = Record<string, ScrapedStoreContent>
