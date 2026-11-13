'use client'

import { useEffect, useState } from 'react'
import type { Store } from '../../data/store'
import { applyEditorData, loadOverrides } from '../editor/overrides'
import Hero from './Hero'
import Intro from './Intro'
import Service from './Service'
import Banner from './Banner'
import Story from './Story'
import Team from './Team'
import Inventory from './Inventory'
import Dcf from './Dcf'
import Directions from './Directions'
import Faq from './Faq'
import Articles from './Articles'
import Brands from './Brands'
import Footer from '../Footer'

export default function StoreBody({ store: base }: { store: Store }) {
  const [store, setStore] = useState(base)

  // After hydration only — localStorage isn't available during SSR/export.
  useEffect(() => {
    const d = loadOverrides(base.slug)
    setStore(d ? applyEditorData(base, d) : base)
  }, [base])

  return (
    <>
      <Hero store={store} />
      <Intro store={store} />
      <Service store={store} />
      <Banner store={store} />
      <Story store={store} />
      <Team store={store} />
      <Inventory store={store} />
      <Dcf store={store} />
      <Directions store={store} />
      <Faq store={store} />
      <Articles store={store} />
      <Brands store={store} />
      <Footer storeSlug={store.slug} />
    </>
  )
}
