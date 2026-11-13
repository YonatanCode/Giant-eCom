import { redirect } from 'next/navigation'
import { CATEGORY_BASE_PATH, DEFAULT_CATEGORY_SLUG } from '../data/categories'

// The prototype only serves the NL market, so `/` lands on its default category — the same
// place giant-bicycles.com/nl has its road bikes.
export default function Home() {
  redirect(`${CATEGORY_BASE_PATH}/${DEFAULT_CATEGORY_SLUG}`)
}
