import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import ProductPage from '../../../../../../components/pdp/ProductPage/ProductPage'
import { CATEGORIES, getCategory } from '../../../../../../data/categories'

type Params = Promise<{ category: string; productId: string }>

export function generateStaticParams() {
  return CATEGORIES.flatMap((category) =>
    category.products.map((product) => ({ category: category.slug, productId: product.id })),
  )
}

async function resolve(params: Params) {
  const { category: slug, productId } = await params
  const category = getCategory(slug)
  const product = category?.products.find((candidate) => candidate.id === productId)
  return category && product ? { category, product } : null
}

export async function generateMetadata({ params }: { params: Params }) {
  const found = await resolve(params)
  return { title: found ? `${found.product.title} | Giant` : 'Not found' }
}

export default async function ProductRoute({ params }: { params: Params }) {
  const found = await resolve(params)
  if (!found) notFound()
  // The page reads the store and colour from the URL on the client, so the rest of the route
  // stays static; the boundary is what lets Next prerender around it.
  return (
    <Suspense>
      <ProductPage category={found.category} product={found.product} />
    </Suspense>
  )
}
