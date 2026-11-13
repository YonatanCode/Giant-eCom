import { notFound } from 'next/navigation'
import StoreEditor from '../../../../../components/editor/StoreEditor'
import { toEditorData } from '../../../../../components/editor/model'
import { officialStoreSlugs } from '../../../../../data/official-store-details'
import { getStore } from '../../../../../data/store'

export const dynamicParams = false

export function generateStaticParams() {
  return officialStoreSlugs
}

export default async function StoreEditorPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const store = getStore(slug)
  if (!store) notFound()

  return <StoreEditor data={toEditorData(store)} />
}
