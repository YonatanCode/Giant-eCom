import { notFound } from 'next/navigation'
import StoreBody from '../../../../components/store/StoreBody'
import { officialStoreSlugs } from '../../../../data/official-store-details'
import { getStore } from '../../../../data/store'

export const dynamicParams = false

export function generateStaticParams() {
  return officialStoreSlugs
}

export default async function StorePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const store = getStore(slug)
  if (!store) notFound()

  return <StoreBody store={store} />
}
