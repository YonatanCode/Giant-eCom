import type { ScrapedStoreContentMap } from './store-content'

// Curated fixes for generated scrape data. These win over store-content.generated.ts.
export const storeContentOverrides = {} as const satisfies ScrapedStoreContentMap
